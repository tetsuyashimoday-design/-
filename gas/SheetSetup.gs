// ============================================================
// SheetSetup.gs - スプレッドシート初期化
// ============================================================

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  _setupUsersSheet(ss);
  _setupStaffSheet(ss);
  _setupIncidentsSheet(ss);
  _setupEvidenceSheet(ss);
  _setupNoticesSheet(ss);
  _setupInterviewsSheet(ss);
  _setupInterviewMinutesSheet(ss);
  _setupImprovementTasksSheet(ss);
  _setupAreasSheet(ss);
  _setupAreaTransfersSheet(ss);
  _setupStaffingSheet(ss);
  _setupAuditLogSheet(ss);

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('スプレッドシートの初期設定が完了しました');
}

function _getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function _setupUsersSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.USERS);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'user_id', 'email', 'name', 'role', 'area', 'is_active',
      'created_at', 'updated_at'
    ]);
    sh.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#4a86e8').setFontColor('#ffffff');
  }
}

function _setupStaffSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.STAFF);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'staff_id', 'name', 'email', 'store', 'area', 'shift_type',
      'employment_type', 'is_active', 'notes', 'created_at', 'updated_at'
    ]);
    sh.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#4a86e8').setFontColor('#ffffff');
  }
}

function _setupIncidentsSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.INCIDENTS);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'incident_id', 'reported_by', 'reported_at', 'offender_id', 'victim_id',
      'incident_date', 'incident_type', 'description', 'location', 'status',
      'assigned_to', 'area', 'severity', 'is_anonymous', 'created_at', 'updated_at'
    ]);
    sh.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#cc0000').setFontColor('#ffffff');
  }
}

function _setupEvidenceSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.EVIDENCE);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'evidence_id', 'incident_id', 'file_name', 'file_type', 'drive_file_id',
      'drive_url', 'uploaded_by', 'uploaded_at', 'description', 'access_log'
    ]);
    sh.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#cc0000').setFontColor('#ffffff');
  }
}

function _setupNoticesSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.NOTICES);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'notice_id', 'incident_id', 'staff_id', 'notice_type', 'content',
      'doc_id', 'doc_url', 'status', 'created_by', 'approved_by',
      'approved_at', 'issued_at', 'improvement_deadline', 'created_at'
    ]);
    sh.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#e69138').setFontColor('#ffffff');
  }
}

function _setupInterviewsSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.INTERVIEWS);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'interview_id', 'incident_id', 'interview_type', 'interviewee_id',
      'interviewer_id', 'scheduled_at', 'completed_at', 'status',
      'location', 'notes', 'created_at', 'updated_at'
    ]);
    sh.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#6aa84f').setFontColor('#ffffff');
  }
}

function _setupInterviewMinutesSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.INTERVIEW_MINUTES);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'minutes_id', 'interview_id', 'transcription', 'ai_summary',
      'doc_id', 'doc_url', 'created_by', 'created_at', 'updated_at'
    ]);
    sh.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#6aa84f').setFontColor('#ffffff');
  }
}

function _setupImprovementTasksSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.IMPROVEMENT_TASKS);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'task_id', 'incident_id', 'staff_id', 'notice_id', 'title',
      'description', 'deadline', 'status', 'assigned_by',
      'completed_at', 'created_at', 'updated_at'
    ]);
    sh.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#e69138').setFontColor('#ffffff');
  }
}

function _setupAreasSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.AREAS);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'area_id', 'area_name', 'store', 'manager_id', 'is_active', 'created_at'
    ]);
    sh.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#4a86e8').setFontColor('#ffffff');
  }
}

function _setupAreaTransfersSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.AREA_TRANSFERS);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'transfer_id', 'staff_id', 'from_area', 'to_area', 'reason',
      'requested_by', 'requested_at', 'approved_by', 'approved_at',
      'effective_date', 'status', 'notes'
    ]);
    sh.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#4a86e8').setFontColor('#ffffff');
  }
}

function _setupStaffingSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.STAFFING);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'record_id', 'store', 'shift_type', 'date', 'required_count',
      'actual_count', 'shortage', 'notes', 'updated_at'
    ]);
    sh.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#4a86e8').setFontColor('#ffffff');
  }
}

function _setupAuditLogSheet(ss) {
  const sh = _getOrCreateSheet(ss, SHEETS.AUDIT_LOG);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'log_id', 'timestamp', 'user_email', 'user_name', 'action',
      'resource_type', 'resource_id', 'details', 'ip_address', 'result'
    ]);
    sh.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#999999').setFontColor('#ffffff');
  }
}
