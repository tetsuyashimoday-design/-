// ============================================================
// Interview.gs - 面談管理・文字起こし・議事録自動生成
// ============================================================

function scheduleInterview(params) {
  requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  const user = getCurrentUser();
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INTERVIEWS);
  const interviewId = generateId('ITV');
  const now = new Date();

  sh.appendRow([
    interviewId,
    params.incident_id || '',
    params.interview_type || INTERVIEW_TYPE.REGULAR,
    params.interviewee_id || '',
    user.user_id,
    params.scheduled_at || '',
    '',
    'scheduled',
    params.location || '',
    params.notes || '',
    now,
    now,
  ]);

  // 面談対象者へ通知
  if (params.interviewee_email) {
    _notifyInterviewee(params.interviewee_email, interviewId, params);
  }

  writeAuditLog('INTERVIEW_SCHEDULED', 'interviews', interviewId,
    `種別: ${params.interview_type}, 対象: ${params.interviewee_id}`);
  return { success: true, interview_id: interviewId };
}

function getInterviews(filters) {
  const user = getCurrentUser();
  if (!user) throw new Error('認証が必要です');
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INTERVIEWS);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const row = _rowToObject(headers, data[i]);
    // スタッフは自分が関係する面談のみ
    if (user.role === ROLES.STAFF &&
        row.interviewee_id !== user.user_id &&
        row.interviewer_id !== user.user_id) continue;
    if (filters && filters.interview_type && row.interview_type !== filters.interview_type) continue;
    if (filters && filters.incident_id && row.incident_id !== filters.incident_id) continue;
    results.push(row);
  }
  return results;
}

/**
 * 面談文字起こしを保存し、むすぼなAIで要約→議事録Google Doc自動生成
 */
function saveInterviewTranscription(interviewId, transcription, intervieweeName) {
  requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  const user = getCurrentUser();
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  // 面談情報を取得
  const itvSh = ss.getSheetByName(SHEETS.INTERVIEWS);
  const itvData = itvSh.getDataRange().getValues();
  const itvHeaders = itvData[0];
  let interview = null;
  let interviewRowIndex = -1;

  for (let i = 1; i < itvData.length; i++) {
    if (itvData[i][0] === interviewId) {
      interview = _rowToObject(itvHeaders, itvData[i]);
      interviewRowIndex = i + 1;
      break;
    }
  }
  if (!interview) throw new Error('面談が見つかりません');

  // むすぼなAIで要約
  const aiResult = summarizeInterviewWithAI(
    transcription,
    interview.interview_type,
    intervieweeName || interview.interviewee_id,
  );

  // 議事録Google Docを生成
  const docInfo = _generateMinutesDocument(interview, transcription, aiResult.summary, intervieweeName);

  // 議事録シートに保存
  const minSh = ss.getSheetByName(SHEETS.INTERVIEW_MINUTES);
  const minutesId = generateId('MIN');
  const now = new Date();
  minSh.appendRow([
    minutesId,
    interviewId,
    transcription,
    aiResult.summary,
    docInfo.docId,
    docInfo.docUrl,
    user.user_id,
    now,
    now,
  ]);

  // 面談ステータスを完了に更新
  if (interviewRowIndex > 0) {
    itvSh.getRange(interviewRowIndex, 7).setValue(now);
    itvSh.getRange(interviewRowIndex, 8).setValue('completed');
    itvSh.getRange(interviewRowIndex, 12).setValue(now);
  }

  writeAuditLog('INTERVIEW_TRANSCRIPTION_SAVED', 'interview_minutes', minutesId,
    `面談ID: ${interviewId}, AI要約: ${aiResult.success ? '成功' : '失敗'}`);

  return {
    success: true,
    minutes_id: minutesId,
    doc_url: docInfo.docUrl,
    ai_success: aiResult.success,
    summary: aiResult.summary,
  };
}

function getInterviewMinutes(interviewId) {
  const user = getCurrentUser();
  if (!user) throw new Error('認証が必要です');
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INTERVIEW_MINUTES);
  const data = sh.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === interviewId) {
      const row = _rowToObject(headers, data[i]);
      writeAuditLog('MINUTES_ACCESSED', 'interview_minutes', data[i][0], `面談ID: ${interviewId}`);
      return row;
    }
  }
  return null;
}

function _generateMinutesDocument(interview, transcription, summary, intervieweeName) {
  const typeName = _interviewTypeNamePublic(interview.interview_type);
  const dateStr = new Date().toLocaleDateString('ja-JP');
  const doc = DocumentApp.create(`面談議事録_${typeName}_${dateStr}_${interview.interview_id}`);
  const body = doc.getBody();

  // スタイル設定
  const titleStyle = {};
  titleStyle[DocumentApp.Attribute.FONT_SIZE] = 16;
  titleStyle[DocumentApp.Attribute.BOLD] = true;

  body.clear();

  const title = body.appendParagraph(`面談議事録 - ${typeName}`);
  title.setHeading(DocumentApp.ParagraphHeading.TITLE);

  body.appendParagraph('【面談基本情報】').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  const infoTable = body.appendTable([
    ['面談ID', interview.interview_id],
    ['面談種別', typeName],
    ['対象者', intervieweeName || interview.interviewee_id],
    ['実施日時', interview.completed_at ? new Date(interview.completed_at).toLocaleString('ja-JP') : dateStr],
    ['実施場所', interview.location || ''],
    ['担当者ID', interview.interviewer_id],
    ['作成日', dateStr],
  ]);
  infoTable.setBorderWidth(1);

  body.appendParagraph('');
  body.appendParagraph('【AI要約議事録】').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('※むすぼなAIにより自動生成されています。内容を確認のうえ、必要に応じて修正してください。')
    .setItalic(true);
  body.appendParagraph('');
  body.appendParagraph(summary || '（要約なし）');

  body.appendParagraph('');
  body.appendHorizontalRule();
  body.appendParagraph('【文字起こし全文】').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('（機密情報 - 閲覧権限者のみ）').setItalic(true);
  body.appendParagraph(transcription || '（文字起こしデータなし）');

  body.appendParagraph('');
  body.appendHorizontalRule();
  body.appendParagraph(`本議事録は ${CONFIG.APP_NAME} により自動生成されました。`).setItalic(true);
  body.appendParagraph(`生成日時: ${new Date().toLocaleString('ja-JP')}`).setItalic(true);

  doc.saveAndClose();
  return { docId: doc.getId(), docUrl: doc.getUrl() };
}

function _notifyInterviewee(email, interviewId, params) {
  try {
    const appUrl = ScriptApp.getService().getUrl();
    const scheduledDate = params.scheduled_at
      ? new Date(params.scheduled_at).toLocaleString('ja-JP')
      : '日程調整中';
    GmailApp.sendEmail(
      email,
      `【面談日程のご連絡】${_interviewTypeNamePublic(params.interview_type)}`,
      `面談の日程についてご連絡します。\n\n` +
      `面談ID: ${interviewId}\n` +
      `種別: ${_interviewTypeNamePublic(params.interview_type)}\n` +
      `日時: ${scheduledDate}\n` +
      `場所: ${params.location || '別途連絡'}\n\n` +
      `ご不明な点はご連絡ください。\n${appUrl}`,
    );
  } catch (e) {
    Logger.log('面談通知エラー: ' + e.message);
  }
}

function _interviewTypeNamePublic(type) {
  const names = {
    [INTERVIEW_TYPE.VICTIM_FOLLOWUP]: '被害者フォローアップ面談',
    [INTERVIEW_TYPE.OFFENDER_GUIDANCE]: '指導面談',
    [INTERVIEW_TYPE.REGULAR]: '定期面談',
    [INTERVIEW_TYPE.CAREGIVER]: '訪問介護員面談',
  };
  return names[type] || '面談';
}
