// ============================================================
// Notification.gs - アラート・自動通知（時間駆動トリガー）
// ============================================================

/**
 * 毎朝9時に実行するトリガーを設定
 */
function setupDailyTrigger() {
  // 既存トリガーを削除
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'runDailyNotifications') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('runDailyNotifications')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}

function runDailyNotifications() {
  _checkImprovementDeadlines();
  _checkStaffingShortage();
  _checkOverdueIncidents();
  _checkPendingNoticeApprovals();
}

function _checkImprovementDeadlines() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.IMPROVEMENT_TASKS);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] || data[i][7] !== 'open') continue;
    const deadline = data[i][6] ? new Date(data[i][6]) : null;
    if (!deadline) continue;

    const isOverdue = deadline < now;
    const isNearing = deadline <= threeDaysLater && deadline >= now;

    if (isOverdue || isNearing) {
      const subject = isOverdue
        ? `【期限超過】改善課題の対応が遅れています (${data[i][0]})`
        : `【期限3日前】改善課題の期限が迫っています (${data[i][0]})`;
      const body = `改善課題の期限について通知します。\n\n` +
        `タスクID: ${data[i][0]}\n` +
        `対象スタッフ: ${data[i][2]}\n` +
        `内容: ${data[i][4]}\n` +
        `期限: ${deadline.toLocaleDateString('ja-JP')}\n\n` +
        `システムにログインして対応状況を確認してください。\n${ScriptApp.getService().getUrl()}`;

      _sendToManagersAndStaff(data[i][2], data[i][8], subject, body);
    }
  }
}

function _checkStaffingShortage() {
  const staffing = _getStaffingSummary();
  const shortages = staffing.filter(s => s.is_shortage);
  if (shortages.length === 0) return;

  const lines = shortages.map(s =>
    `・${s.store} ${s.shift_type}: 必要 ${s.required}名 / 現在 ${s.actual}名 (充足率 ${s.fulfillment_rate}%)`
  );

  _sendToAdmins(
    '【人員不足アラート】充足率80%未満の店舗があります',
    `以下の店舗で人員が不足しています。\n\n${lines.join('\n')}\n\n` +
    `${ScriptApp.getService().getUrl()}`,
  );
}

function _checkOverdueIncidents() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INCIDENTS);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const openOld = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    if ([INCIDENT_STATUS.OPEN, INCIDENT_STATUS.PENDING_APPROVAL].includes(data[i][9])) {
      const reported = data[i][2] ? new Date(data[i][2]) : null;
      if (reported && reported < sevenDaysAgo) {
        openOld.push({ id: data[i][0], reported: data[i][2], area: data[i][11] });
      }
    }
  }

  if (openOld.length === 0) return;
  const lines = openOld.map(o => `・${o.id} (報告日: ${o.reported}, エリア: ${o.area})`);
  _sendToAdmins(
    '【未対応アラート】7日以上未対応のインシデントがあります',
    `以下のインシデントが7日以上未対応です。\n\n${lines.join('\n')}\n\n${ScriptApp.getService().getUrl()}`,
  );
}

function _checkPendingNoticeApprovals() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.NOTICES);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const pending = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] || data[i][7] !== 'draft') continue;
    const created = data[i][13] ? new Date(data[i][13]) : null;
    if (created && created < threeDaysAgo) {
      pending.push({ id: data[i][0], created: data[i][13] });
    }
  }

  if (pending.length === 0) return;
  const lines = pending.map(p => `・${p.id} (作成日: ${p.created})`);
  _sendToAdmins(
    '【承認待ち】3日以上未承認の書面があります',
    `以下の書面通知が3日以上未承認です。\n\n${lines.join('\n')}\n\n${ScriptApp.getService().getUrl()}`,
  );
}

function _sendToAdmins(subject, body) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sh = ss.getSheetByName(SHEETS.USERS);
    const data = sh.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if ([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER].includes(data[i][3]) && data[i][5]) {
        GmailApp.sendEmail(data[i][1], subject, body);
      }
    }
  } catch (e) {
    Logger.log('管理者通知エラー: ' + e.message);
  }
}

function _sendToManagersAndStaff(staffId, assignedById, subject, body) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const userSh = ss.getSheetByName(SHEETS.USERS);
    const userData = userSh.getDataRange().getValues();
    const emails = new Set();

    for (let i = 1; i < userData.length; i++) {
      if (!userData[i][5]) continue;
      if ([ROLES.ADMIN, ROLES.AREA_MANAGER].includes(userData[i][3])) {
        emails.add(userData[i][1]);
      }
      if (userData[i][0] === staffId || userData[i][0] === assignedById) {
        emails.add(userData[i][1]);
      }
    }

    emails.forEach(email => GmailApp.sendEmail(email, subject, body));
  } catch (e) {
    Logger.log('通知エラー: ' + e.message);
  }
}

// Dashboard.gsで使うため再宣言回避
function _getStaffingSummary() {
  return getDashboardData().staffing_summary;
}
