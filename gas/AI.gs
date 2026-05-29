// ============================================================
// AI.gs - むすぼなAI連携（面談文字起こし要約）
// ============================================================

function summarizeInterviewWithAI(transcription, interviewType, intervieweeName) {
  const systemContext = _buildSystemContext(interviewType, intervieweeName);
  const url = `${CONFIG.MUSUBONA_AI_URL}?content=${encodeURIComponent(transcription)}&systemContext=${encodeURIComponent(systemContext)}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      muteHttpExceptions: true,
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
    });

    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (statusCode !== 200) {
      Logger.log(`むすぼなAI エラー ${statusCode}: ${responseText}`);
      return {
        success: false,
        error: `AIサービスエラー (${statusCode})`,
        summary: _fallbackSummary(transcription),
      };
    }

    let summary = responseText;
    try {
      const json = JSON.parse(responseText);
      summary = json.content || json.message || json.response || json.text || responseText;
    } catch (_) {
      summary = responseText;
    }

    return { success: true, summary };
  } catch (e) {
    Logger.log('むすぼなAI 接続エラー: ' + e.message);
    return {
      success: false,
      error: e.message,
      summary: _fallbackSummary(transcription),
    };
  }
}

function _buildSystemContext(interviewType, intervieweeName) {
  const typeName = _interviewTypeName(interviewType);
  return `あなたは介護事業所の人事・コンプライアンス担当の議事録作成AIです。
以下の面談の文字起こしを受け取り、正確・簡潔な議事録を作成してください。

【面談種別】${typeName}
【対象者】${intervieweeName || '（記録済み）'}

# 議事録フォーマット
## 面談概要
（面談の目的・背景を1〜2文で）

## 主な発言・確認事項
（箇条書きで重要事項を列挙）

## 合意事項・確認事項
（双方で確認・合意した内容）

## 次回アクション・フォローアップ事項
（担当者・期限を含めて記載）

## 特記事項
（懸念点・リスク・経緯として残すべき事項）

---
個人情報保護に配慮し、必要最小限の情報のみ記録してください。
感情的・主観的表現は客観的表現に言い換えてください。`;
}

function _interviewTypeName(type) {
  const names = {
    [INTERVIEW_TYPE.VICTIM_FOLLOWUP]: '被害者フォローアップ面談',
    [INTERVIEW_TYPE.OFFENDER_GUIDANCE]: '加害者指導面談',
    [INTERVIEW_TYPE.REGULAR]: '定期面談',
    [INTERVIEW_TYPE.CAREGIVER]: '訪問介護員面談',
  };
  return names[type] || '面談';
}

// AI未接続時のフォールバック：ルールベース要約
function _fallbackSummary(transcription) {
  if (!transcription) return '（文字起こしデータなし）';
  const lines = transcription.split('\n').filter(l => l.trim());
  const preview = lines.slice(0, 5).join('\n');
  return `【自動要約（AI未接続）】\n\n文字起こし全文（${lines.length}行）の先頭部分：\n${preview}\n\n※むすぼなAIへの接続に失敗しました。全文は文字起こしタブをご確認ください。`;
}
