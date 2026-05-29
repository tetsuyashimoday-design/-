// ============================================================
// Code.gs - エントリーポイント・ルーティング
// ============================================================

function doGet(e) {
  const page = e.parameter.page || 'index';
  const user = getCurrentUser();

  if (!user) {
    return HtmlService.createTemplateFromFile('login')
      .evaluate()
      .setTitle(CONFIG.APP_NAME)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  const template = HtmlService.createTemplateFromFile('index');
  template.user = JSON.stringify(user);
  template.page = page;

  return template.evaluate()
    .setTitle(CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  try {
    const result = _dispatch(action, data.params || {});
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    writeAuditLog('API_ERROR', action, '', err.message, 'ERROR');
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function _dispatch(action, params) {
  const routes = {
    // 認証
    'get_current_user': () => getCurrentUser(),
    'register_user': () => registerUser(params.email, params.name, params.role, params.area),

    // インシデント管理
    'create_incident': () => createIncident(params),
    'get_incidents': () => getIncidents(params.filters),
    'get_incident': () => getIncident(params.incident_id),
    'update_incident_status': () => updateIncidentStatus(params.incident_id, params.status, params.notes),
    'upload_evidence': () => uploadEvidence(params.incident_id, params.file_name, params.file_type, params.base64_data, params.description),
    'get_evidence': () => getEvidence(params.incident_id),

    // 書面ワークフロー
    'create_notice': () => createNotice(params.incident_id, params.staff_id, params.notice_type, params.content, params.improvement_deadline),
    'approve_notice': () => approveNotice(params.notice_id),
    'issue_notice': () => issueNotice(params.notice_id),
    'get_notices': () => getNotices(params.incident_id),
    'get_improvement_tasks': () => getImprovementTasks(params.staff_id),
    'update_task_status': () => updateTaskStatus(params.task_id, params.status, params.notes),

    // 面談管理
    'schedule_interview': () => scheduleInterview(params),
    'get_interviews': () => getInterviews(params.filters),
    'save_transcription': () => saveInterviewTranscription(params.interview_id, params.transcription, params.interviewee_name),
    'get_interview_minutes': () => getInterviewMinutes(params.interview_id),

    // ダッシュボード
    'get_dashboard': () => getDashboardData(),
    'update_staffing': () => updateStaffing(params.store, params.shift_type, params.date, params.required, params.actual, params.notes),
    'get_area_transfers': () => getAreaTransfers(params.filters),
    'request_area_transfer': () => requestAreaTransfer(params.staff_id, params.from_area, params.to_area, params.reason, params.effective_date),
    'approve_area_transfer': () => approveAreaTransfer(params.transfer_id),

    // セットアップ（管理者のみ）
    'setup': () => { requireRole([ROLES.ADMIN]); setupSpreadsheet(); setupDailyTrigger(); return 'セットアップ完了'; },
  };

  if (!routes[action]) throw new Error(`不明なアクション: ${action}`);
  return routes[action]();
}

// HTMLファイルのインクルード用
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
