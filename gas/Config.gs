// ============================================================
// Config.gs - 設定・定数定義
// ============================================================

const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '',
  DRIVE_FOLDER_ID: PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || '',
  MUSUBONA_AI_URL: 'https://d28z92q54aiofg.cloudfront.net/chat',
  APP_NAME: 'スタッフ行動管理・勤務体制最適化システム',
  ADMIN_EMAIL: PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || '',
};

const SHEETS = {
  USERS: 'users',
  INCIDENTS: 'incidents',
  EVIDENCE: 'evidence',
  NOTICES: 'notices',
  INTERVIEWS: 'interviews',
  INTERVIEW_MINUTES: 'interview_minutes',
  STAFF: 'staff',
  AREAS: 'areas',
  AREA_TRANSFERS: 'area_transfers',
  STAFFING: 'staffing',
  AUDIT_LOG: 'audit_log',
  IMPROVEMENT_TASKS: 'improvement_tasks',
};

const ROLES = {
  ADMIN: 'admin',           // 経営層
  AREA_MANAGER: 'area_manager', // エリア長
  AREA_STAFF: 'area_staff', // エリア担当者
  HR: 'hr',                 // HR担当
  STAFF: 'staff',           // 一般スタッフ
};

const INCIDENT_STATUS = {
  OPEN: 'open',
  PENDING_APPROVAL: 'pending_approval',
  NOTICE_ISSUED: 'notice_issued',
  IMPROVING: 'improving',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
};

const INTERVIEW_TYPE = {
  VICTIM_FOLLOWUP: 'victim_followup',    // 被害者フォローアップ
  OFFENDER_GUIDANCE: 'offender_guidance', // 加害者指導
  REGULAR: 'regular',                     // 定期面談
  CAREGIVER: 'caregiver',               // 訪問介護員面談
};
