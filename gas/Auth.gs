// ============================================================
// Auth.gs - 認証・権限管理 (RBAC)
// ============================================================

function getCurrentUser() {
  const email = Session.getActiveUser().getEmail();
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.USERS);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email && data[i][5] === true) {
      return {
        user_id: data[i][0],
        email: data[i][1],
        name: data[i][2],
        role: data[i][3],
        area: data[i][4],
      };
    }
  }
  return null;
}

function requireRole(allowedRoles) {
  const user = getCurrentUser();
  if (!user) throw new Error('認証が必要です');
  if (!allowedRoles.includes(user.role)) {
    writeAuditLog('ACCESS_DENIED', 'auth', '', `必要なロール: ${allowedRoles.join(',')}`);
    throw new Error('この操作を行う権限がありません');
  }
  return user;
}

function canViewIncident(user, incident) {
  if ([ROLES.ADMIN, ROLES.HR, ROLES.AREA_MANAGER].includes(user.role)) return true;
  if (user.role === ROLES.AREA_STAFF && incident.area === user.area) return true;
  // スタッフは自分が当事者の案件のみ
  if (user.role === ROLES.STAFF) {
    return incident.offender_id === user.user_id || incident.victim_id === user.user_id;
  }
  return false;
}

function registerUser(email, name, role, area) {
  requireRole([ROLES.ADMIN, ROLES.HR]);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.USERS);
  const userId = generateId('USR');
  const now = new Date();
  sh.appendRow([userId, email, name, role, area, true, now, now]);
  writeAuditLog('USER_REGISTERED', 'users', userId, `${email} (${role})`);
  return userId;
}

function generateId(prefix) {
  return `${prefix}-${new Date().getTime()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}
