// ============================================================
// Incident.gs - インシデント管理
// ============================================================

function createIncident(params) {
  const user = requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INCIDENTS);
  const incidentId = generateId('INC');
  const now = new Date();

  sh.appendRow([
    incidentId,
    user.user_id,
    now,
    params.offender_id || '',
    params.victim_id || '',
    params.incident_date || now,
    params.incident_type || '',
    params.description || '',
    params.location || '',
    INCIDENT_STATUS.OPEN,
    user.user_id,
    params.area || user.area,
    params.severity || 'medium',
    params.is_anonymous || false,
    now,
    now,
  ]);

  // エリア長に承認依頼通知
  _notifyAreaManager(user.area, incidentId, params);

  writeAuditLog('INCIDENT_CREATED', 'incidents', incidentId, `種別: ${params.incident_type}`);
  return { success: true, incident_id: incidentId };
}

function getIncidents(filters) {
  const user = getCurrentUser();
  if (!user) throw new Error('認証が必要です');
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INCIDENTS);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const row = _rowToObject(headers, data[i]);
    if (!canViewIncident(user, row)) continue;
    if (filters) {
      if (filters.status && row.status !== filters.status) continue;
      if (filters.area && row.area !== filters.area) continue;
    }
    results.push(row);
  }

  writeAuditLog('INCIDENT_LIST_VIEWED', 'incidents', '', `${results.length}件`);
  return results;
}

function getIncident(incidentId) {
  const user = getCurrentUser();
  if (!user) throw new Error('認証が必要です');
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INCIDENTS);
  const data = sh.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === incidentId) {
      const incident = _rowToObject(headers, data[i]);
      if (!canViewIncident(user, incident)) {
        writeAuditLog('ACCESS_DENIED', 'incidents', incidentId, '権限なし', 'DENIED');
        throw new Error('このインシデントへのアクセス権限がありません');
      }
      writeAuditLog('INCIDENT_VIEWED', 'incidents', incidentId, '');
      return incident;
    }
  }
  throw new Error('インシデントが見つかりません');
}

function updateIncidentStatus(incidentId, newStatus, notes) {
  const user = requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INCIDENTS);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === incidentId) {
      sh.getRange(i + 1, 10).setValue(newStatus);
      sh.getRange(i + 1, 16).setValue(new Date());
      writeAuditLog('INCIDENT_STATUS_UPDATED', 'incidents', incidentId,
        `${data[i][9]} → ${newStatus}: ${notes || ''}`);
      return { success: true };
    }
  }
  throw new Error('インシデントが見つかりません');
}

function uploadEvidence(incidentId, fileName, fileType, base64Data, description) {
  requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  // アクセス権確認
  getIncident(incidentId);

  const folder = _getEvidenceFolder();
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), fileType, fileName);
  const file = folder.createFile(blob);
  // 証拠ファイルは機密: 共有を無効化
  file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.EVIDENCE);
  const evidenceId = generateId('EVD');
  const user = getCurrentUser();

  sh.appendRow([
    evidenceId,
    incidentId,
    fileName,
    fileType,
    file.getId(),
    file.getUrl(),
    user.user_id,
    new Date(),
    description || '',
    '',
  ]);

  writeAuditLog('EVIDENCE_UPLOADED', 'evidence', evidenceId, `${fileName} (${incidentId})`);
  return { success: true, evidence_id: evidenceId };
}

function getEvidence(incidentId) {
  const user = getCurrentUser();
  getIncident(incidentId); // 権限チェック
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.EVIDENCE);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === incidentId) {
      const row = _rowToObject(headers, data[i]);
      // URLは権限者のみ
      if (![ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER].includes(user.role)) {
        row.drive_url = ''; // URLを隠す
      }
      results.push(row);
      writeAuditLog('EVIDENCE_ACCESSED', 'evidence', data[i][0], `${data[i][2]}`);
    }
  }
  return results;
}

function _getEvidenceFolder() {
  const folderId = CONFIG.DRIVE_FOLDER_ID;
  if (folderId) return DriveApp.getFolderById(folderId);
  const folder = DriveApp.createFolder('【機密】インシデント証拠ファイル');
  PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', folder.getId());
  return folder;
}

function _notifyAreaManager(area, incidentId, params) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sh = ss.getSheetByName(SHEETS.USERS);
    const data = sh.getDataRange().getValues();
    const appUrl = ScriptApp.getService().getUrl();

    for (let i = 1; i < data.length; i++) {
      if (data[i][3] === ROLES.AREA_MANAGER && data[i][4] === area && data[i][5]) {
        const managerEmail = data[i][1];
        GmailApp.sendEmail(
          managerEmail,
          `【要対応】新規インシデント報告 (${incidentId})`,
          `新しいインシデントが登録されました。\n\n` +
          `インシデントID: ${incidentId}\n` +
          `種別: ${params.incident_type}\n` +
          `発生日: ${params.incident_date}\n` +
          `エリア: ${area}\n\n` +
          `システムにログインして内容を確認してください。\n${appUrl}`,
        );
      }
    }
  } catch (e) {
    Logger.log('通知エラー: ' + e.message);
  }
}

function _rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i]; });
  return obj;
}
