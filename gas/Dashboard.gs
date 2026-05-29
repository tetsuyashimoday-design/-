// ============================================================
// Dashboard.gs - ダッシュボード・人員充足管理
// ============================================================

function getDashboardData() {
  requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  return {
    incident_summary: _getIncidentSummary(),
    staffing_summary: _getStaffingSummary(),
    pending_tasks: _getPendingTasksCount(),
    upcoming_interviews: _getUpcomingInterviews(),
    kpi: _getKpiData(),
  };
}

function _getIncidentSummary() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INCIDENTS);
  const data = sh.getDataRange().getValues();
  const summary = { total: 0, open: 0, pending: 0, resolved: 0, escalated: 0 };

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    summary.total++;
    const status = data[i][9];
    if (status === INCIDENT_STATUS.OPEN) summary.open++;
    else if (status === INCIDENT_STATUS.PENDING_APPROVAL) summary.pending++;
    else if (status === INCIDENT_STATUS.RESOLVED) summary.resolved++;
    else if (status === INCIDENT_STATUS.ESCALATED) summary.escalated++;
  }
  return summary;
}

function _getStaffingSummary() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.STAFFING);
  const data = sh.getDataRange().getValues();
  const byStore = {};

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    const store = data[i][1];
    const shiftType = data[i][2];
    const required = data[i][4] || 0;
    const actual = data[i][5] || 0;

    if (!byStore[store]) byStore[store] = {};
    if (!byStore[store][shiftType]) {
      byStore[store][shiftType] = { required: 0, actual: 0 };
    }
    byStore[store][shiftType].required += required;
    byStore[store][shiftType].actual += actual;
  }

  const result = [];
  for (const store in byStore) {
    for (const shiftType in byStore[store]) {
      const d = byStore[store][shiftType];
      const rate = d.required > 0 ? Math.round((d.actual / d.required) * 100) : 0;
      result.push({
        store,
        shift_type: shiftType,
        required: d.required,
        actual: d.actual,
        shortage: Math.max(0, d.required - d.actual),
        fulfillment_rate: rate,
        is_shortage: rate < 80,
      });
    }
  }
  return result;
}

function _getPendingTasksCount() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.IMPROVEMENT_TASKS);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  let open = 0;
  let overdue = 0;

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    if (data[i][7] === 'open') {
      open++;
      if (data[i][6] && new Date(data[i][6]) < now) overdue++;
    }
  }
  return { open, overdue };
}

function _getUpcomingInterviews() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.INTERVIEWS);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const now = new Date();
  const upcoming = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] || data[i][7] !== 'scheduled') continue;
    const scheduled = data[i][5] ? new Date(data[i][5]) : null;
    if (scheduled && scheduled >= now) {
      upcoming.push(_rowToObject(headers, data[i]));
    }
  }
  return upcoming.slice(0, 10);
}

function _getKpiData() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const incSh = ss.getSheetByName(SHEETS.INCIDENTS);
  const incData = incSh.getDataRange().getValues();
  const noticeSh = ss.getSheetByName(SHEETS.NOTICES);
  const noticeData = noticeSh.getDataRange().getValues();
  const itvSh = ss.getSheetByName(SHEETS.INTERVIEWS);
  const itvData = itvSh.getDataRange().getValues();

  // KPI: 問題発生から書面通知までのリードタイム（平均）
  let totalLeadTime = 0;
  let countLeadTime = 0;

  for (let i = 1; i < noticeData.length; i++) {
    if (!noticeData[i][0] || !noticeData[i][11]) continue;
    const incidentId = noticeData[i][1];
    for (let j = 1; j < incData.length; j++) {
      if (incData[j][0] === incidentId && incData[j][5]) {
        const incidentDate = new Date(incData[j][5]);
        const issuedDate = new Date(noticeData[i][11]);
        const days = (issuedDate - incidentDate) / (1000 * 60 * 60 * 24);
        totalLeadTime += days;
        countLeadTime++;
        break;
      }
    }
  }

  const avgLeadTime = countLeadTime > 0 ? Math.round(totalLeadTime / countLeadTime * 10) / 10 : null;

  // KPI: フォローアップ実施率
  let victimInterviews = 0;
  let completedVictimInterviews = 0;
  for (let i = 1; i < itvData.length; i++) {
    if (itvData[i][2] === INTERVIEW_TYPE.VICTIM_FOLLOWUP) {
      victimInterviews++;
      if (itvData[i][7] === 'completed') completedVictimInterviews++;
    }
  }
  const followupRate = victimInterviews > 0
    ? Math.round((completedVictimInterviews / victimInterviews) * 100)
    : 100;

  return {
    avg_lead_time_days: avgLeadTime,
    lead_time_target: 3,
    followup_rate: followupRate,
    followup_target: 100,
  };
}

function updateStaffing(store, shiftType, date, required, actual, notes) {
  requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.STAFFING);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  const dateStr = date instanceof Date ? date.toLocaleDateString('ja-JP') : date;

  // 既存レコードを探す
  for (let i = 1; i < data.length; i++) {
    const rowDate = data[i][3] instanceof Date
      ? data[i][3].toLocaleDateString('ja-JP')
      : data[i][3];
    if (data[i][1] === store && data[i][2] === shiftType && rowDate === dateStr) {
      sh.getRange(i + 1, 5).setValue(required);
      sh.getRange(i + 1, 6).setValue(actual);
      sh.getRange(i + 1, 7).setValue(Math.max(0, required - actual));
      sh.getRange(i + 1, 8).setValue(notes || '');
      sh.getRange(i + 1, 9).setValue(now);
      writeAuditLog('STAFFING_UPDATED', 'staffing', data[i][0], `${store} ${shiftType}`);
      return { success: true };
    }
  }

  const recordId = generateId('STF');
  sh.appendRow([
    recordId, store, shiftType, date,
    required, actual, Math.max(0, required - actual),
    notes || '', now,
  ]);
  writeAuditLog('STAFFING_CREATED', 'staffing', recordId, `${store} ${shiftType}`);
  return { success: true, record_id: recordId };
}

function getAreaTransfers(filters) {
  requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.AREA_TRANSFERS);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    const row = _rowToObject(headers, data[i]);
    if (filters && filters.status && row.status !== filters.status) continue;
    results.push(row);
  }
  return results;
}

function requestAreaTransfer(staffId, fromArea, toArea, reason, effectiveDate) {
  requireRole([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER, ROLES.AREA_STAFF]);
  const user = getCurrentUser();
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.AREA_TRANSFERS);
  const transferId = generateId('TRF');

  sh.appendRow([
    transferId, staffId, fromArea, toArea, reason,
    user.user_id, new Date(), '', '', effectiveDate || '',
    'pending', '',
  ]);

  writeAuditLog('AREA_TRANSFER_REQUESTED', 'area_transfers', transferId,
    `${staffId}: ${fromArea} → ${toArea}`);
  return { success: true, transfer_id: transferId };
}

function approveAreaTransfer(transferId) {
  requireRole([ROLES.ADMIN, ROLES.AREA_MANAGER]);
  const user = getCurrentUser();
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.AREA_TRANSFERS);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === transferId) {
      sh.getRange(i + 1, 8).setValue(user.user_id);
      sh.getRange(i + 1, 9).setValue(new Date());
      sh.getRange(i + 1, 11).setValue('approved');
      writeAuditLog('AREA_TRANSFER_APPROVED', 'area_transfers', transferId, `承認者: ${user.email}`);
      return { success: true };
    }
  }
  throw new Error('エリア変更申請が見つかりません');
}
