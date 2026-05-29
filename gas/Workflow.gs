// ============================================================
// Workflow.gs - 書面通知ワークフロー・改善タスク管理
// ============================================================

function createNotice(incidentId, staffId, noticeType, content, improvementDeadline) {
  const user = requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.NOTICES);
  const noticeId = generateId('NTC');
  const now = new Date();

  sh.appendRow([
    noticeId,
    incidentId,
    staffId,
    noticeType,
    content,
    '',   // doc_id (承認後に生成)
    '',   // doc_url
    'draft',
    user.user_id,
    '',   // approved_by
    '',   // approved_at
    '',   // issued_at
    improvementDeadline || '',
    now,
  ]);

  // エリア長に承認依頼
  _sendNoticeApprovalRequest(user, noticeId, incidentId, noticeType);

  writeAuditLog('NOTICE_CREATED', 'notices', noticeId, `incidentId: ${incidentId}`);
  return { success: true, notice_id: noticeId };
}

function approveNotice(noticeId) {
  const user = requireRole([ROLES.ADMIN, ROLES.AREA_MANAGER]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.NOTICES);
  const data = sh.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === noticeId) {
      const notice = _rowToObject(headers, data[i]);
      if (notice.status !== 'draft') throw new Error('承認済みまたは交付済みの書面です');

      // Google Doc書面を自動生成
      const docInfo = _generateNoticeDocument(notice);

      sh.getRange(i + 1, 6).setValue(docInfo.docId);
      sh.getRange(i + 1, 7).setValue(docInfo.docUrl);
      sh.getRange(i + 1, 8).setValue('approved');
      sh.getRange(i + 1, 10).setValue(user.user_id);
      sh.getRange(i + 1, 11).setValue(new Date());

      // 改善タスクを自動作成
      if (notice.improvement_deadline) {
        _createImprovementTask(notice);
      }

      writeAuditLog('NOTICE_APPROVED', 'notices', noticeId, `承認者: ${user.email}`);
      return { success: true, doc_url: docInfo.docUrl };
    }
  }
  throw new Error('書面が見つかりません');
}

function issueNotice(noticeId) {
  const user = requireRole([ROLES.ADMIN, ROLES.AREA_MANAGER]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.NOTICES);
  const data = sh.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === noticeId) {
      const notice = _rowToObject(headers, data[i]);
      if (notice.status !== 'approved') throw new Error('承認されていない書面です');

      sh.getRange(i + 1, 8).setValue('issued');
      sh.getRange(i + 1, 12).setValue(new Date());

      // インシデントステータスを更新
      updateIncidentStatus(notice.incident_id, INCIDENT_STATUS.NOTICE_ISSUED, '書面交付完了');

      writeAuditLog('NOTICE_ISSUED', 'notices', noticeId, `対象スタッフ: ${notice.staff_id}`);
      return { success: true };
    }
  }
  throw new Error('書面が見つかりません');
}

function getNotices(incidentId) {
  requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.NOTICES);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    if (!incidentId || data[i][1] === incidentId) {
      results.push(_rowToObject(headers, data[i]));
    }
  }
  return results;
}

function getImprovementTasks(staffId) {
  const user = getCurrentUser();
  if (!user) throw new Error('認証が必要です');
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.IMPROVEMENT_TASKS);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const row = _rowToObject(headers, data[i]);
    // スタッフは自分のタスクのみ
    if (user.role === ROLES.STAFF && row.staff_id !== user.user_id) continue;
    if (staffId && row.staff_id !== staffId) continue;
    results.push(row);
  }
  return results;
}

function updateTaskStatus(taskId, status, notes) {
  const user = getCurrentUser();
  if (!user) throw new Error('認証が必要です');
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.IMPROVEMENT_TASKS);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      // スタッフは自分のタスクのみ更新可
      if (user.role === ROLES.STAFF && data[i][2] !== user.user_id) {
        throw new Error('権限がありません');
      }
      sh.getRange(i + 1, 8).setValue(status);
      if (status === 'completed') sh.getRange(i + 1, 10).setValue(new Date());
      sh.getRange(i + 1, 12).setValue(new Date());
      writeAuditLog('TASK_STATUS_UPDATED', 'improvement_tasks', taskId, `${status}: ${notes || ''}`);
      return { success: true };
    }
  }
  throw new Error('タスクが見つかりません');
}

function _generateNoticeDocument(notice) {
  const templateContent = _buildNoticeTemplate(notice);
  const doc = DocumentApp.create(`書面通知_${notice.notice_id}_${new Date().toLocaleDateString('ja-JP')}`);
  const body = doc.getBody();

  body.clear();
  body.appendParagraph(CONFIG.APP_NAME).setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph('書面通知').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`通知ID: ${notice.notice_id}`);
  body.appendParagraph(`作成日: ${new Date().toLocaleDateString('ja-JP')}`);
  body.appendHorizontalRule();
  body.appendParagraph('【通知内容】').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(notice.content || '');

  if (notice.improvement_deadline) {
    body.appendParagraph('【改善期限】').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const deadline = notice.improvement_deadline instanceof Date
      ? notice.improvement_deadline.toLocaleDateString('ja-JP')
      : notice.improvement_deadline;
    body.appendParagraph(deadline);
  }

  body.appendHorizontalRule();
  body.appendParagraph('承認者署名欄: ___________________________');
  body.appendParagraph('交付日: ___________________________');

  doc.saveAndClose();
  return { docId: doc.getId(), docUrl: doc.getUrl() };
}

function _createImprovementTask(notice) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.IMPROVEMENT_TASKS);
  const taskId = generateId('TSK');

  sh.appendRow([
    taskId,
    notice.incident_id,
    notice.staff_id,
    notice.notice_id,
    '改善課題（書面通知より）',
    notice.content || '',
    notice.improvement_deadline || '',
    'open',
    notice.approved_by || '',
    '',
    new Date(),
    new Date(),
  ]);
  return taskId;
}

function _sendNoticeApprovalRequest(user, noticeId, incidentId, noticeType) {
  try {
    const appUrl = ScriptApp.getService().getUrl();
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const userSh = ss.getSheetByName(SHEETS.USERS);
    const data = userSh.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if ([ROLES.ADMIN, ROLES.AREA_MANAGER].includes(data[i][3]) && data[i][5]) {
        GmailApp.sendEmail(
          data[i][1],
          `【承認依頼】書面通知 (${noticeId})`,
          `書面通知の承認をお願いします。\n\n` +
          `書面ID: ${noticeId}\nインシデント: ${incidentId}\n種別: ${noticeType}\n\n` +
          `${appUrl}`,
        );
      }
    }
  } catch (e) {
    Logger.log('承認通知エラー: ' + e.message);
  }
}

function _buildNoticeTemplate(notice) {
  return notice.content || '';
}
