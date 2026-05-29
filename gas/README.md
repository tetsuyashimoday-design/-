# スタッフ行動管理・勤務体制最適化システム

GAS (Google Apps Script) 実装

---

## ファイル構成

```
gas/
├── appsscript.json       # GASマニフェスト
├── Config.gs             # 設定・定数
├── Code.gs               # エントリーポイント・ルーティング
├── Auth.gs               # 認証・RBAC権限管理
├── AuditLog.gs           # 監査ログ
├── SheetSetup.gs         # スプレッドシート初期化
├── Incident.gs           # インシデント管理
├── Workflow.gs           # 書面通知ワークフロー
├── Interview.gs          # 面談管理・文字起こし・議事録
├── AI.gs                 # むすぼなAI連携
├── Dashboard.gs          # ダッシュボード・人員充足管理
├── Notification.gs       # アラート・自動通知
├── index.html            # メインUI
├── login.html            # ログイン画面
├── styles.html           # CSS
├── dashboard_view.html   # ダッシュボード画面
├── incident_view.html    # インシデント管理画面
├── workflow_view.html    # 書面ワークフロー画面
├── interview_view.html   # 面談・文字起こし画面
├── staffing_view.html    # 人員充足・エリア変更画面
└── common_scripts.html   # 共通JS
```

---

## セットアップ手順

### 1. Google Apps Script プロジェクト作成

1. [script.google.com](https://script.google.com) を開く
2. 「新しいプロジェクト」を作成
3. プロジェクト名を「スタッフ行動管理システム」に変更
4. すべての `.gs` ファイルと `.html` ファイルを貼り付け

### 2. スプレッドシート作成

1. Google スプレッドシートを新規作成
2. スプレッドシートIDをコピー（URLの `spreadsheets/d/` 以降の文字列）

### 3. スクリプトプロパティ設定

「プロジェクトの設定」→「スクリプトのプロパティ」に以下を設定：

| プロパティ名 | 値 |
|---|---|
| `SPREADSHEET_ID` | 手順2で作成したスプレッドシートのID |
| `ADMIN_EMAIL` | 管理者のメールアドレス |

### 4. 初期セットアップ実行

`Code.gs` の `_dispatch` 経由 または スクリプトエディタから `setupSpreadsheet()` を実行。

またはアプリをデプロイ後、管理者ユーザーでログインしてAPIアクション `setup` を呼び出す。

### 5. Webアプリとしてデプロイ

1. 「デプロイ」→「新しいデプロイ」
2. 種類：「ウェブアプリ」
3. 実行ユーザー：「アプリにアクセスしているユーザー」
4. アクセス：「自分のドメイン内の全員」または「全員」
5. デプロイ → URLをメモ

### 6. 最初のユーザー登録

スクリプトエディタから直接実行：

```javascript
// 管理者ユーザーを最初に手動で登録
function addFirstAdmin() {
  const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  const sh = ss.getSheetByName('users');
  sh.appendRow([
    'USR-ADMIN-001',
    'admin@yourcompany.com',  // 管理者のGoogleアカウント
    '管理者',
    'admin',
    '',
    true,
    new Date(),
    new Date()
  ]);
}
```

### 7. 日次通知トリガー設定

```javascript
setupDailyTrigger();  // スクリプトエディタから実行
```

---

## 機能一覧

### Phase 1 MVP (必須)
- ✅ インシデント登録・証拠ファイル管理
- ✅ 書面通知ワークフロー（下書き→承認→交付）
- ✅ 改善期限・アラート通知（毎朝9時自動実行）
- ✅ ロールベースアクセス制御（RBAC）
- ✅ 監査ログ（全操作記録）

### Phase 1 追加機能
- ✅ 訪問介護員面談の文字起こし（Web Speech API）
- ✅ むすぼなAIによる面談内容の自動要約
- ✅ 議事録Google Docの自動生成

### Phase 2
- ✅ 人員充足ダッシュボード（店舗別・シフト別）
- ✅ エリア変更申請・承認フロー
- ✅ 面談スケジュール管理

---

## ロール権限

| 機能 | 経営層 | エリア長 | HR | エリア担当 | スタッフ |
|---|:---:|:---:|:---:|:---:|:---:|
| インシデント登録 | ✅ | ✅ | ✅ | ✅ | - |
| インシデント閲覧 | 全件 | 全件 | 全件 | 自エリア | 自分のみ |
| 書面通知作成 | ✅ | ✅ | ✅ | - | - |
| 書面通知承認 | ✅ | ✅ | - | - | - |
| 面談記録 | ✅ | ✅ | ✅ | ✅ | - |
| 改善課題確認 | ✅ | ✅ | ✅ | ✅ | 自分のみ |
| 人員充足管理 | ✅ | ✅ | ✅ | ✅ | - |
| エリア変更承認 | ✅ | ✅ | - | - | - |

---

## 文字起こし機能（訪問介護員面談）

1. 「面談・議事録」メニューから面談を登録
2. 「記録する」ボタンをクリック
3. 「録音開始」でブラウザのマイクを使って文字起こし
   - または「テキスト直接入力」タブから手入力
4. 「AIで要約・議事録作成」ボタンをクリック
5. むすぼなAIが自動で議事録を生成
6. Google Documentとして保存・共有可能

> ⚠ 音声認識にはChrome/Edgeが必要です。iOSのSafariは非対応。

---

## むすぼなAI連携

`AI.gs` の `summarizeInterviewWithAI()` 関数が以下のAPIを呼び出します：

```
GET https://d28z92q54aiofg.cloudfront.net/chat
  ?content=<文字起こしテキスト>
  &systemContext=<議事録作成プロンプト>
```

接続失敗時はフォールバックとして文字起こし全文を保存します。

---

## データ保持・セキュリティ

| データ種別 | 保持期間 | 対応 |
|---|---|---|
| インシデント記録 | 10年 | Google Drive（閲覧制限） |
| 証拠ファイル | 10年 | Drive（PRIVATE設定） |
| 書面通知 | 10年 | Google Doc（権限管理） |
| 面談記録・議事録 | 5年 | Google Doc（権限管理） |
| 監査ログ | 全操作記録 | スプレッドシート（削除不可） |
