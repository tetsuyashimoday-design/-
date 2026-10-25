// Backlog 課題登録エンドポイント（Cloudflare Worker 用）
// 既存 Worker（/api/anthropic）の fetch ハンドラから
//   if (url.pathname === '/api/backlog') return handleBacklog(request, env);
// のように呼び出してください。
//
// 必要な設定:
//   wrangler secret put BACKLOG_API_KEY        … Backlog「個人設定 → API」で発行したキー
// 任意の設定（[vars]）:
//   BACKLOG_DOMAIN         既定: keieikika.backlog.com
//   BACKLOG_PROJECT_KEY    既定: AIDEV_VISIT
//   BACKLOG_ISSUE_TYPE_ID  未設定ならプロジェクトの先頭の種別を使用
//   BACKLOG_PRIORITY_ID    既定: 3（中）
//   ALLOWED_ORIGIN         設定するとその Origin 以外からの登録を拒否

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

export async function handleBacklog(request, env) {
  const origin = request.headers.get('Origin') || '';
  const headers = corsHeaders(env.ALLOWED_ORIGIN || '*');
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers });
  if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403, headers });
  if (!env.BACKLOG_API_KEY) return new Response('BACKLOG_API_KEY が未設定です', { status: 500, headers });

  const domain = env.BACKLOG_DOMAIN || 'keieikika.backlog.com';
  const projectKey = env.BACKLOG_PROJECT_KEY || 'AIDEV_VISIT';
  const api = (path) => `https://${domain}/api/v2${path}${path.includes('?') ? '&' : '?'}apiKey=${env.BACKLOG_API_KEY}`;

  try {
    const d = await request.json();

    const project = await (await fetch(api(`/projects/${projectKey}`))).json();
    if (!project.id) return new Response(JSON.stringify(project), { status: 502, headers });

    let issueTypeId = env.BACKLOG_ISSUE_TYPE_ID;
    if (!issueTypeId) {
      const types = await (await fetch(api(`/projects/${projectKey}/issueTypes`))).json();
      issueTypeId = types[0]?.id;
    }

    const description = [
      `依頼書ID: ${d.id || ''}`,
      `依頼日: ${d.iraiDate || ''}`,
      `利用者: ${d.userName || ''} 様`,
      `区分: ${d.serviceType || ''}（${d.ninteiKekka || ''}）`,
      `依頼元: ${d.fromJigyoshoName || ''}（担当: ${d.fromTanto || ''}）`,
      `希望開始日: ${d.kibouStartDate || ''}`,
      `サービス内容: ${d.services || ''}`,
      `スケジュール: ${d.schedules || ''}`,
      '',
      `備考: ${d.bikou || ''}`,
    ].join('\n');

    const body = new URLSearchParams({
      projectId: String(project.id),
      issueTypeId: String(issueTypeId),
      priorityId: String(env.BACKLOG_PRIORITY_ID || 3),
      summary: `【新規依頼】${d.userName || '(氏名未入力)'}様 ${d.serviceType || ''}`.trim(),
      description,
    });
    if (d.kibouStartDate) body.set('startDate', d.kibouStartDate);

    const r = await fetch(api('/issues'), { method: 'POST', body });
    return new Response(await r.text(), {
      status: r.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
