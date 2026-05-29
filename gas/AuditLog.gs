// ============================================================
// AuditLog.gs - 監査ログ記録
// ============================================================

function writeAuditLog(action, resourceType, resourceId, details, result) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sh = ss.getSheetByName(SHEETS.AUDIT_LOG);
    const user = Session.getActiveUser();
    const logId = generateId('LOG');
    sh.appendRow([
      logId,
      new Date(),
      user.getEmail(),
      '',
      action,
      resourceType,
      resourceId || '',
      details || '',
      '',
      result || 'SUCCESS',
    ]);
  } catch (e) {
    Logger.log('AuditLog error: ' + e.message);
  }
}
