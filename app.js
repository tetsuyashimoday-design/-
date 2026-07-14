'use strict';

/* ============================
   店舗データ
   ============================ */
const STORE_DATA = {
  '自由が丘': {
    service: '訪問介護',
    kpis: [
      { label: '紹介獲得', value: '8件', delta: '▲+2件', dir: 'up' },
      { label: '訪問回数', value: '36回', delta: '▲+5回', dir: 'up' },
      { label: '紹介になる割合', value: '22.2%', delta: '▲+3.1', dir: 'up' },
      { label: '再訪問の割合', value: '78%', delta: '▲+5', dir: 'up' },
    ],
    goal: { label: '月の目標：10件', pct: 80, text: '80%まできた（8/10件）あと12日', color: 'linear-gradient(90deg,#059669,#10b981)' },
    repRanking: [
      { name: '高橋', pct: 100, val: '5件' },
      { name: '佐藤', pct: 60, val: '3件' },
    ],
    referrers: [
      { name: '田口さん', facility: 'A病院', rel: badge('いつも紹介くれる', '#d1fae5', '#065f46'), last: '7/8', count: '12名', rep: '高橋' },
      { name: '佐々木さん', facility: 'L病院', rel: badge('いつも紹介くれる', '#d1fae5', '#065f46'), last: '7/5', count: '8名', rep: '佐藤' },
      { name: '山本さん', facility: 'B居宅', rel: badge('何度か紹介あり', '#dbeafe', '#1e40af'), last: '7/3', count: '3名', rep: '佐藤' },
      { name: '斎藤さん', facility: 'C居宅', rel: badge('定期的に会ってる', '#fef3c7', '#92400e'), last: '7/8', count: '0名', rep: '佐藤' },
      { name: '加藤さん', facility: 'D病院', rel: badge('定期的に会ってる', '#fef3c7', '#92400e'), last: '7/5', count: '0名', rep: '高橋' },
    ],
    planTable: [
      { name: '鈴木 花子', plans: '35件', vacancy: '0件', vacancyColor: '#dc2626', referred: '0名', status: badge('満杯', '#fee2e2', '#991b1b') },
      { name: '山下 優子', plans: '28件', vacancy: '7件', vacancyColor: '#059669', referred: '2名', status: badge('余裕あり', '#d1fae5', '#065f46') },
      { name: '西田 真理', plans: '31件', vacancy: '4件', vacancyColor: '#f59e0b', referred: '1名', status: badge('やや余裕', '#fef3c7', '#92400e') },
    ],
    planComment: '💡 鈴木さんは満杯なので新しい紹介は山下さん・西田さんに振り分けるのがよさそう。',
    insights: [
      { level: 'high', title: '⚠️ 高橋さん1人に6割が集中しています', desc: '高橋さんが休んだり異動したら、紹介が一気に減るかもしれません。佐藤さんとの同行訪問で少しずつ引継ぎを。' },
      { level: 'med', title: 'A病院からの紹介がゼロの週が3週続いてます', desc: '担当のケアマネさんが変わった可能性あり。新しい方に早めに挨拶しておくと安心です。' },
      { level: '', title: '💡 高橋さんの「相手に合わせた資料」が効いてるみたい', desc: '佐藤さんにも同じやり方を試してもらえば、お店全体の紹介率が上がりそうです。' },
    ],
    position: [
      '紹介獲得：<strong style="color:#059669">4店舗中 1位</strong>',
      '紹介率：<strong style="color:#059669">1位</strong>（22.2%）',
      '再訪問率：<strong style="color:#059669">1位</strong>（78%）',
      '1か所への頼りすぎ：<span style="color:#059669">問題なし</span>（28%）',
    ],
    coverage: [
      'エリア内の施設：14か所',
      '行けている：12か所',
      'まだ行けてない：F診療所、G居宅',
      '<span style="color:#f59e0b;font-weight:600">A病院への集中度：28%（まだ大丈夫）</span>',
    ],
    todos: [
      { num: 1, task: 'A病院の新しいケアマネさんに挨拶', target: '後任の方', rep: '高橋', due: '7/14', status: badge('まだ', '#fef3c7', '#92400e') },
      { num: 2, task: '佐藤さんと高橋さんで一緒にB居宅を訪問', target: '山本さん', rep: '2人で', due: '7/15', status: badge('まだ', '#fef3c7', '#92400e') },
      { num: 3, task: 'F診療所に初めて行く（まだ行けてない所）', target: '新規', rep: '佐藤', due: '7/16', status: badge('予定あり', '#d1fae5', '#065f46') },
      { num: 4, task: '斎藤さんに空き状況を伝える', target: '斎藤さん', rep: '佐藤', due: '7/17', status: badge('予定あり', '#d1fae5', '#065f46') },
      { num: 5, task: '高橋さんの資料を佐藤さんに共有', target: '—', rep: '高橋', due: '7/14', status: badge('まだ', '#fef3c7', '#92400e') },
    ],
  },

  '学芸大学': {
    service: '訪問介護',
    kpis: [
      { label: '紹介獲得', value: '3件', delta: '▼-2件', dir: 'down' },
      { label: '訪問回数', value: '22回', delta: '▼-4回', dir: 'down' },
      { label: '紹介になる割合', value: '13.6%', delta: '▼-4.0', dir: 'down' },
      { label: '再訪問の割合', value: '58%', delta: '▼-9', dir: 'down' },
    ],
    goal: { label: '月の目標：8件', pct: 38, text: '38%（3/8件）このペースだと厳しい', color: 'linear-gradient(90deg,#f59e0b,#dc2626)' },
    repRanking: [
      { name: '田中', pct: 100, val: '3件' },
    ],
    referrers: [
      { name: '木下さん', facility: 'E病院', rel: badge('いつも紹介くれる', '#d1fae5', '#065f46'), last: '6/20', count: '6名', rep: '田中' },
      { name: '松本さん', facility: 'F居宅', rel: badge('何度か紹介あり', '#dbeafe', '#1e40af'), last: '6/25', count: '2名', rep: '田中' },
      { name: '関口さん', facility: 'G居宅', rel: badge('ほとんど会えていない', '#fee2e2', '#991b1b'), last: '5/30', count: '0名', rep: '田中' },
    ],
    planTable: [
      { name: '中川 貴子', plans: '26件', vacancy: '2件', vacancyColor: '#f59e0b', referred: '0名', status: badge('やや余裕', '#fef3c7', '#92400e') },
      { name: '岡本 さゆり', plans: '19件', vacancy: '9件', vacancyColor: '#059669', referred: '1名', status: badge('余裕あり', '#d1fae5', '#065f46') },
    ],
    planComment: '💡 ケアマネさんの異動後、新しい方との関係づくりが追いついていません。',
    insights: [
      { level: 'high', title: '⚠️ ケアマネさんが2人異動してから紹介が止まっています', desc: '新しい担当の方とまだ関係ができていません。早めの顔つなぎが必要です。' },
      { level: 'med', title: '3ヶ月連続で紹介数が減っています', desc: '6月5件→7月3件。このままだと今月の目標達成は厳しい状況です。' },
      { level: '', title: '💡 E病院の木下さんとは関係が続いている', desc: 'ここだけは安定して紹介がある。他の紹介元にも同じ関わり方を広げたい。' },
    ],
    position: [
      '紹介獲得：<strong style="color:#dc2626">4店舗中 3位</strong>',
      '紹介率：<strong style="color:#f59e0b">3位</strong>（13.6%）',
      '再訪問率：<strong style="color:#dc2626">4位</strong>（58%）',
      '1か所への頼りすぎ：<span style="color:#f59e0b">やや注意</span>（38%）',
    ],
    coverage: [
      'エリア内の施設：11か所',
      '行けている：7か所',
      'まだ行けてない：H居宅、I診療所、J居宅、K病院',
      '<span style="color:#dc2626;font-weight:600">E病院への集中度：45%（要注意）</span>',
    ],
    todos: [
      { num: 1, task: '新しいケアマネさん（後任）に自己紹介に行く', target: '後任の方', rep: '田中', due: '7/15', status: badge('まだ', '#fef3c7', '#92400e') },
      { num: 2, task: '関口さんに久しぶりに顔を出す', target: '関口さん', rep: '田中', due: '7/16', status: badge('まだ', '#fef3c7', '#92400e') },
      { num: 3, task: 'H居宅に初めて行く', target: '新規', rep: '田中', due: '7/17', status: badge('まだ', '#fef3c7', '#92400e') },
    ],
  },

  '中目黒': {
    service: '訪問介護',
    kpis: [
      { label: '紹介獲得', value: '2件', delta: '▼-1件', dir: 'down' },
      { label: '訪問回数', value: '15回', delta: '▼-3回', dir: 'down' },
      { label: '紹介になる割合', value: '8.0%', delta: '▼-2.5', dir: 'down' },
      { label: '再訪問の割合', value: '32%', delta: '▼-6', dir: 'down' },
    ],
    goal: { label: '月の目標：6件', pct: 33, text: '33%（2/6件）大きく遅れています', color: 'linear-gradient(90deg,#dc2626,#f59e0b)' },
    repRanking: [
      { name: '伊藤', pct: 100, val: '2件' },
    ],
    referrers: [
      { name: '村上さん', facility: 'A病院（分院）', rel: badge('いつも紹介くれる', '#d1fae5', '#065f46'), last: '6/18', count: '2名', rep: '伊藤' },
      { name: '林さん', facility: 'I居宅', rel: badge('ほとんど会えていない', '#fee2e2', '#991b1b'), last: '5/22', count: '0名', rep: '伊藤' },
    ],
    planTable: [
      { name: '長谷川 明美', plans: '22件', vacancy: '1件', vacancyColor: '#dc2626', referred: '0名', status: badge('やや余裕', '#fef3c7', '#92400e') },
    ],
    planComment: '💡 ケアマネさんとの接点自体が少なく、まず定期訪問を増やす必要があります。',
    insights: [
      { level: 'high', title: '🚨 紹介率8%・再訪問32%はチームで最も低い水準です', desc: 'A病院1か所への依存度が42%と高く、訪問先の数も6か所と少ないのが要因です。' },
      { level: 'med', title: '再訪問できていない案件が多い', desc: '訪問した後、次の約束をその場で決められていないケースが目立ちます。' },
      { level: '', title: '💡 まずは自由が丘のやり方を参考に', desc: '再訪問率78%の自由が丘では、訪問当日にメモを残して次回日程を決めています。' },
    ],
    position: [
      '紹介獲得：<strong style="color:#dc2626">4店舗中 4位</strong>',
      '紹介率：<strong style="color:#dc2626">4位</strong>（8.0%）',
      '再訪問率：<strong style="color:#dc2626">4位</strong>（32%）',
      '1か所への頼りすぎ：<span style="color:#dc2626">頼りすぎ</span>（42%）',
    ],
    coverage: [
      'エリア内の施設：18か所',
      '行けている：6か所',
      'まだ行けてない：J病院、K居宅、L診療所、M居宅、ほか8か所',
      '<span style="color:#dc2626;font-weight:600">A病院への集中度：42%（頼りすぎ）</span>',
    ],
    todos: [
      { num: 1, task: '自由が丘の高橋さんに同行してやり方を学ぶ', target: '高橋さん', rep: '伊藤', due: '7/16', status: badge('予定あり', '#d1fae5', '#065f46') },
      { num: 2, task: '新しい訪問先を5か所リストアップする', target: '新規', rep: '伊藤', due: '7/15', status: badge('まだ', '#fef3c7', '#92400e') },
      { num: 3, task: '村上さん以外の紹介元をつくる動きを始める', target: '新規', rep: '伊藤', due: '7/18', status: badge('まだ', '#fef3c7', '#92400e') },
    ],
  },

  '代官山': {
    service: '訪問介護',
    kpis: [
      { label: '紹介獲得', value: '4件', delta: '▼-1件', dir: 'down' },
      { label: '訪問回数', value: '20回', delta: '▼-2回', dir: 'down' },
      { label: '紹介になる割合', value: '20.0%', delta: '▼-1.0', dir: 'down' },
      { label: '再訪問の割合', value: '55%', delta: '▼-8', dir: 'down' },
    ],
    goal: { label: '月の目標：6件', pct: 67, text: '67%（4/6件）あと2件', color: 'linear-gradient(90deg,#f59e0b,#10b981)' },
    repRanking: [
      { name: '中村（引継ぎ中）', pct: 100, val: '4件' },
    ],
    referrers: [
      { name: '小川さん', facility: 'N病院', rel: badge('いつも紹介くれる', '#d1fae5', '#065f46'), last: '7/2', count: '4名', rep: '中村' },
      { name: '橋本さん', facility: 'O居宅', rel: badge('何度か紹介あり', '#dbeafe', '#1e40af'), last: '6/29', count: '2名', rep: '中村' },
    ],
    planTable: [
      { name: '福田 由美', plans: '24件', vacancy: '3件', vacancyColor: '#f59e0b', referred: '1名', status: badge('やや余裕', '#fef3c7', '#92400e') },
    ],
    planComment: '💡 担当交代に向けて、紹介元との関係を早めに引き継ぐ準備が必要です。',
    insights: [
      { level: 'high', title: '⚠️ 担当が来月退職予定。引継ぎがまだ進んでいません', desc: '小川さん・橋本さんとの関係は担当者個人に依存しています。同行訪問で早めに引き継ぎを。' },
      { level: 'med', title: '紹介率・再訪問率がじわじわ下がっています', desc: '先月から再訪問率が8ポイント下がりました。担当交代への不安が影響しているかもしれません。' },
      { level: '', title: '💡 小川さんとの関係は長く、安定しています', desc: '新しい担当者への引継ぎがうまくいけば、この関係は維持できそうです。' },
    ],
    position: [
      '紹介獲得：<strong style="color:#f59e0b">4店舗中 2位</strong>',
      '紹介率：<strong style="color:#f59e0b">2位</strong>（20.0%）',
      '再訪問率：<strong style="color:#f59e0b">3位</strong>（55%）',
      '1か所への頼りすぎ：<span style="color:#059669">問題なし</span>（25%）',
    ],
    coverage: [
      'エリア内の施設：10か所',
      '行けている：8か所',
      'まだ行けてない：P居宅、Q診療所',
      '<span style="color:#059669;font-weight:600">N病院への集中度：25%（まだ大丈夫）</span>',
    ],
    todos: [
      { num: 1, task: '後任者への引継ぎ資料を作成する', target: '—', rep: '中村', due: '7/16', status: badge('まだ', '#fef3c7', '#92400e') },
      { num: 2, task: '小川さんに後任者を紹介する同行訪問', target: '小川さん', rep: '中村', due: '7/18', status: badge('まだ', '#fef3c7', '#92400e') },
      { num: 3, task: '橋本さんに引継ぎの見通しを伝える', target: '橋本さん', rep: '中村', due: '7/17', status: badge('予定あり', '#d1fae5', '#065f46') },
    ],
  },
};

/* ============================
   個人データ
   ============================ */
const REP_DATA = {
  '高橋 美咲': {
    store: '自由が丘', role: 'サービス提供責任者', isTop: true,
    kpis: [
      { label: '紹介もらえた数', value: '5件', delta: '▲+2件', dir: 'up' },
      { label: '訪問した回数', value: '22回', delta: '▲+4回', dir: 'up' },
      { label: '再訪問できた割合', value: '82%', delta: '▲+4', dir: 'up' },
      { label: '行けている施設の数', value: '12か所', delta: '▲+2', dir: 'up' },
    ],
    goal: { label: 'わたしの月目標：4件', pct: 100, text: '125%達成！（5/4件）目標を超えました 🎉', color: 'linear-gradient(90deg,#059669,#10b981)' },
    rank: [
      '紹介獲得：<strong>1番目</strong>（4人中）',
      '紹介になる率：みんな14% ／ <strong>わたし22%</strong> <span style="color:#059669">◎</span>',
      '再訪問率：みんな61% ／ <strong>わたし82%</strong> <span style="color:#059669">◎</span>',
      '行けてる施設数：みんな8 ／ <strong>わたし12</strong> <span style="color:#059669">◎</span>',
    ],
    reviewRows: [
      { prev: '資料のやり方を他の担当にも共有する', result: '佐藤さんに共有し、一緒に訪問した', status: badge('✅ できた', '#d1fae5', '#065f46') },
      { prev: '新規開拓を月2件は続ける', result: '今月は2件開拓できた', status: badge('✅ できた', '#d1fae5', '#065f46') },
      { prev: '再訪問率85%を目指す', result: '82%（前月80%から改善）', status: badge('🔶 途中', '#fef3c7', '#92400e') },
      { prev: 'A病院以外の大きい病院にも接点を作る', result: 'まだ手が回っていない', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
    ],
    reviewRate: 'できた率：<strong>75%</strong>（4つのうち3つ）',
    insights: [
      { level: '', title: '💡 訪問から紹介につながる率がチームで一番高い', desc: '相手に合わせた資料を持っていくやり方が効いています。この強みを維持しつつ、チームへの共有も続けましょう。' },
      { level: 'med', title: '6割の紹介がA病院1か所に集中しています', desc: '高橋さん個人の頼りすぎではなく店舗全体の課題ですが、他の紹介元も一緒に育てると安心です。' },
    ],
    compare: {
      isTop: true, secondName: '佐藤',
      rows: [
        { metric: '紹介もらえた数', mine: '5件', other: '3件', diff: '+2件' },
        { metric: '紹介になる率', mine: '22%', other: '17%', diff: '+5' },
        { metric: '再訪問の割合', mine: '82%', other: '75%', diff: '+7' },
      ],
    },
    todos: [
      { num: 1, task: 'A病院の新しいケアマネさんに挨拶', target: '後任の方', due: '7/14' },
      { num: 2, task: '資料のやり方を佐藤さんに共有（同行訪問）', target: '—', due: '7/15' },
      { num: 3, task: '中目黒の伊藤さんに訪問のコツを教える', target: '伊藤さん', due: '7/16' },
    ],
    schedule: [
      { date: '7/14(月)', place: 'A病院', person: '田口さん', action: '定期訪問＋新ケアマネさんへ挨拶' },
      { date: '7/15(火)', place: 'B居宅', person: '山本さん', action: '佐藤さんと同行訪問' },
      { date: '7/16(水)', place: '中目黒', person: '伊藤さん', action: '訪問のやり方を共有' },
      { date: '7/17(木)', place: 'D病院', person: '加藤さん', action: 'いつもの訪問' },
    ],
    charaMsgs: [
      { text: '{name}さん、今月もう目標を達成したね！🎉', sub: 'ここからは無理せず、チームへの共有を頑張ってみて。みんな頼ってるよ。' },
      { text: '資料のやり方、佐藤さんにも伝わってるみたいだよ 👏', sub: '{name}さんの工夫がチーム全体の力になってる。' },
      { text: 'A病院への集中、ちょっと気になるところ 🤔', sub: '{name}さんのせいじゃないけど、他の紹介元も育てられたら店舗全体が安定するね。' },
      { text: '今週も訪問ペースいい感じだね 💪', sub: '{name}さんの丁寧さが結果につながってる。この調子で。' },
    ],
  },

  '佐藤 恵子': {
    store: '自由が丘', role: 'サービス提供責任者', isTop: false,
    kpis: [
      { label: '紹介もらえた数', value: '3件', delta: '▲+1件', dir: 'up' },
      { label: '訪問した回数', value: '18回', delta: '▲+3回', dir: 'up' },
      { label: '再訪問できた割合', value: '75%', delta: '▼-3', dir: 'down' },
      { label: '行けている施設の数', value: '10か所', delta: '▲+1', dir: 'up' },
    ],
    goal: { label: 'わたしの月目標：4件', pct: 75, text: '75%（3/4件）あと1件！', color: 'linear-gradient(90deg,#4f46e5,#7c3aed)' },
    rank: [
      '紹介獲得：<strong>2番目</strong>（4人中）',
      '紹介になる率：みんな14% ／ <strong>わたし17%</strong> <span style="color:#059669">◎</span>',
      '再訪問率：みんな61% ／ <strong>わたし75%</strong> <span style="color:#059669">◎</span>',
      '行けてる施設数：みんな8 ／ <strong>わたし10</strong> <span style="color:#059669">◎</span>',
    ],
    reviewRows: [
      { prev: '木村さん（T居宅）に会いに行く', result: '7/3に1回行けた', status: badge('✅ できた', '#d1fae5', '#065f46') },
      { prev: '再訪問を80%以上にする', result: '75%（前月78%から下がった）', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
      { prev: '渡辺さん（Q居宅）に初めて行く', result: 'まだ行けてない', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
      { prev: '高橋さんの資料のやり方を試す', result: '2回の訪問で使ってみた', status: badge('🔶 途中', '#fef3c7', '#92400e') },
    ],
    reviewRate: 'できた率：<strong>50%</strong>（4つのうち2つ）',
    insights: [
      { level: 'high', title: '⚠️ 木村さんにしばらく会えてないみたい', desc: '3週間空いちゃってる。顔を見せるだけでいいから、明日ついでに寄れるかな？' },
      { level: 'med', title: '再訪問が少し減ってる', desc: '先週は4件ほどもう一回行けてなかった。訪問したあと5日以内にもう一度行くと、紹介につながりやすいよ。' },
      { level: '', title: '💡 いいところ：バランスよく色んなところに行けてる', desc: '10か所にまんべんなく通えてるのはチームで一番。特定のところに頼らない安定した動きだね。' },
    ],
    compare: {
      isTop: false, topName: '高橋',
      rows: [
        { metric: '紹介もらえた数', mine: '3件', top: '5件', diff: '-2', tip: '—' },
        { metric: '紹介になる率', mine: '17%', top: '22%', diff: '-5', tip: '初めて行くとき、相手に合わせた資料を持っていく' },
        { metric: '再訪問の割合', mine: '75%', top: '82%', diff: '-7', tip: '訪問した日のうちにメモを書いて、次の予定を決める' },
        { metric: '1回の会話の長さ', mine: '15分', top: '25分', diff: '-10分', tip: '近況を聞くだけでも会話が広がるよ' },
      ],
    },
    todos: [
      { num: 1, task: '木村さん（T居宅）に顔を出す', target: '木村さん', reason: '3週間会えてない。顔見せだけでOK', due: '7/15' },
      { num: 2, task: '渡辺さん（Q居宅）に初めてのご挨拶', target: '渡辺さん', reason: 'B居宅から近い。同じやり方が通じそう', due: '7/17' },
      { num: 3, task: '高橋さんと一緒にB居宅を訪問', target: '山本さん', reason: '高橋さんのやり方を見て学ぶ', due: '7/15' },
      { num: 4, task: '斎藤さん（C居宅）に空き状況を伝える', target: '斎藤さん', reason: '紹介のきっかけを逃さないため', due: '7/14' },
    ],
    schedule: [
      { date: '7/14(月)', place: 'C居宅', person: '斎藤さん', action: '再訪問＋空き状況伝える' },
      { date: '7/15(火)', place: 'B居宅', person: '山本さん', action: '高橋さんと一緒に訪問' },
      { date: '7/15(火)', place: 'T居宅', person: '木村さん', action: '顔見せ（3週ぶり）' },
      { date: '7/16(水)', place: 'L病院', person: '佐々木さん', action: 'いつもの訪問' },
      { date: '7/17(木)', place: 'Q居宅', person: '渡辺さん', action: '初めてのご挨拶' },
    ],
    charaMsgs: [
      { text: '{name}さん、あと1件で目標達成だよ！🔥', sub: '今週のペースなら大丈夫。斎藤さんへのもう一回が鍵になりそう。応援してるよ！' },
      { text: '昨日は18回も回ったんだね、お疲れさま 💪', sub: 'これだけ動けてたら、きっといい結果につながるよ。今日は少しゆっくりでも大丈夫。' },
      { text: '再訪問が先週より増えてるね 👏', sub: '丁寧に関係を育ててるのが伝わってくるよ。この調子！' },
      { text: '木村さんのところ、明日ついでに寄れそう？ 🤗', sub: '3週間空いちゃったけど、顔を出すだけでOK。気軽にね。' },
      { text: '今月はまだ種まきの時期だよ 🌱', sub: '焦らなくていい。来月の芽を今育ててると思って。{name}さんの丁寧さはちゃんと届いてるよ。' },
      { text: '高橋さんの資料、1件だけ試してみない？ 💡', sub: '全部変えなくていいよ。次の訪問1件だけ、お試しで。合わなかったらやめればOK！' },
    ],
  },

  '田中 健一': {
    store: '学芸大学', role: 'サービス提供責任者', isTop: false,
    kpis: [
      { label: '紹介もらえた数', value: '3件', delta: '▼-2件', dir: 'down' },
      { label: '訪問した回数', value: '22回', delta: '▼-4回', dir: 'down' },
      { label: '再訪問できた割合', value: '58%', delta: '▼-9', dir: 'down' },
      { label: '行けている施設の数', value: '7か所', delta: '▼-1', dir: 'down' },
    ],
    goal: { label: 'わたしの月目標：5件', pct: 60, text: '60%（3/5件）このペースだと厳しい', color: 'linear-gradient(90deg,#f59e0b,#dc2626)' },
    rank: [
      '紹介獲得：<strong>3番目</strong>（4人中）',
      '紹介になる率：みんな14% ／ <strong>わたし13.6%</strong> <span style="color:#f59e0b">やや低い</span>',
      '再訪問率：みんな61% ／ <strong>わたし58%</strong> <span style="color:#dc2626">要改善</span>',
      '行けてる施設数：みんな8 ／ <strong>わたし7</strong> <span style="color:#f59e0b">やや少ない</span>',
    ],
    reviewRows: [
      { prev: '病院以外の紹介元にも訪問する', result: '今月もほとんど病院中心だった', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
      { prev: '関口さん（G居宅）に月1回は会う', result: '5/30以来会えていない', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
      { prev: 'ケアマネさん異動後の新しい方に挨拶', result: 'まだ挨拶できていない', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
      { prev: '加藤さんへの訪問前にリストを確認する', result: '2回試して好評だった', status: badge('✅ できた', '#d1fae5', '#065f46') },
    ],
    reviewRate: 'できた率：<strong>25%</strong>（4つのうち1つ）',
    insights: [
      { level: 'high', title: '⚠️ 病院ばかりに集中し、居宅への訪問が少ない', desc: '訪問先のかたよりが45%と高め。居宅介護支援事業所にも定期的に顔を出すと紹介元が広がります。' },
      { level: 'med', title: 'ケアマネさん異動後、まだ新しい方に挨拶できていません', desc: '関係が途切れかけています。今週中に一度顔を出すのがおすすめです。' },
      { level: '', title: '💡 加藤さんへの訪問前リスト確認は好評でした', desc: '具体的な話ができて会話が弾んだとのこと。他の紹介元にも広げてみましょう。' },
    ],
    compare: {
      isTop: false, topName: '高橋',
      rows: [
        { metric: '紹介もらえた数', mine: '3件', top: '5件', diff: '-2', tip: '—' },
        { metric: '紹介になる率', mine: '13.6%', top: '22%', diff: '-8.4', tip: '訪問先に病院以外の居宅も増やす' },
        { metric: '再訪問の割合', mine: '58%', top: '82%', diff: '-24', tip: '訪問当日にメモを残し、次の予定をその場で決める' },
        { metric: '1回の会話の長さ', mine: '12分', top: '25分', diff: '-13分', tip: '退院予定者リストを確認してから訪問する' },
      ],
    },
    todos: [
      { num: 1, task: '新しいケアマネさん（後任）に自己紹介に行く', target: '後任の方', reason: 'ケアマネさん異動後まだ挨拶できていない', due: '7/15' },
      { num: 2, task: '関口さん（G居宅）に久しぶりに顔を出す', target: '関口さん', reason: '5/30以来会えていない', due: '7/16' },
      { num: 3, task: 'H居宅に初めて行く', target: '新規', reason: 'まだ行けてない訪問先', due: '7/17' },
    ],
    schedule: [
      { date: '7/14(月)', place: 'E病院', person: '木下さん', action: '定期訪問' },
      { date: '7/15(火)', place: '学芸大学支店', person: '後任ケアマネ', action: '自己紹介' },
      { date: '7/16(水)', place: 'G居宅', person: '関口さん', action: '久しぶりの訪問' },
      { date: '7/17(木)', place: 'H居宅', person: '新規', action: '初めての挨拶' },
    ],
    charaMsgs: [
      { text: '{name}さん、今週は居宅にも1件行けるといいね 🌱', sub: '病院だけじゃなく、居宅の担当さんとも顔なじみになると紹介の芽が増えるよ。' },
      { text: '関口さんとしばらく会えてないみたいだね 🤗', sub: '{name}さんが動きやすいタイミングで、顔を出すだけでも大丈夫。' },
      { text: '加藤さんへの訪問前リスト確認、いいアイデアだったね 👍', sub: 'その工夫、他の紹介元にも広げてみよう。' },
      { text: '新しいケアマネさんへの挨拶、今週中にできそう？ 💡', sub: '{name}さんなら大丈夫。まずは顔を見せることから。' },
    ],
  },

  '伊藤 誠': {
    store: '中目黒', role: 'サービス提供責任者', isTop: false,
    kpis: [
      { label: '紹介もらえた数', value: '2件', delta: '▼-1件', dir: 'down' },
      { label: '訪問した回数', value: '15回', delta: '▼-3回', dir: 'down' },
      { label: '再訪問できた割合', value: '32%', delta: '▼-6', dir: 'down' },
      { label: '行けている施設の数', value: '6か所', delta: '▼-1', dir: 'down' },
    ],
    goal: { label: 'わたしの月目標：5件', pct: 40, text: '40%（2/5件）大きく遅れています', color: 'linear-gradient(90deg,#dc2626,#f59e0b)' },
    rank: [
      '紹介獲得：<strong>4番目</strong>（4人中）',
      '紹介になる率：みんな14% ／ <strong>わたし8.0%</strong> <span style="color:#dc2626">要改善</span>',
      '再訪問率：みんな61% ／ <strong>わたし32%</strong> <span style="color:#dc2626">要改善</span>',
      '行けてる施設数：みんな8 ／ <strong>わたし6</strong> <span style="color:#dc2626">少ない</span>',
    ],
    reviewRows: [
      { prev: '新しい訪問先を3か所開拓する', result: 'まだ手が回っていない', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
      { prev: '村上さん以外の紹介元をつくる', result: 'まだできていない', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
      { prev: '訪問後5日以内に再訪問する', result: '今月も再訪問が少なかった', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
      { prev: '自由が丘のやり方を学ぶ', result: 'まだ同行できていない', status: badge('❌ まだ', '#fee2e2', '#991b1b') },
    ],
    reviewRate: 'できた率：<strong>0%</strong>（4つのうち0つ）',
    insights: [
      { level: 'high', title: '🚨 紹介率・再訪問率がチームで最も低い水準です', desc: 'A病院1か所への依存度も42%と高め。まずは高橋さんに同行して、やり方を1つ試してみましょう。' },
      { level: 'med', title: '訪問先が6か所と少なめです', desc: '新しい訪問先を増やすことが、紹介の機会そのものを増やす近道になりそうです。' },
      { level: '', title: '💡 村上さんとの関係は安定しています', desc: 'ここでの信頼関係の作り方を、他の紹介元にも広げられるといいですね。' },
    ],
    compare: {
      isTop: false, topName: '高橋',
      rows: [
        { metric: '紹介もらえた数', mine: '2件', top: '5件', diff: '-3', tip: '—' },
        { metric: '紹介になる率', mine: '8.0%', top: '22%', diff: '-14', tip: '訪問先ごとに合わせた資料を用意する' },
        { metric: '再訪問の割合', mine: '32%', top: '82%', diff: '-50', tip: '訪問当日にその場で次回日程を決める' },
        { metric: '訪問先の数', mine: '6か所', top: '12か所', diff: '-6か所', tip: '週1か所ずつ新規開拓の時間を作る' },
      ],
    },
    todos: [
      { num: 1, task: '自由が丘の高橋さんに同行してやり方を学ぶ', target: '高橋さん', reason: '見て学ぶのが一番の近道', due: '7/16' },
      { num: 2, task: '新しい訪問先を5か所リストアップする', target: '新規', reason: '訪問先の少なさが紹介数に直結している', due: '7/15' },
      { num: 3, task: '村上さん以外の紹介元をつくる動きを始める', target: '新規', reason: 'A病院への依存を減らすため', due: '7/18' },
    ],
    schedule: [
      { date: '7/14(月)', place: 'A病院（分院）', person: '村上さん', action: '定期訪問' },
      { date: '7/15(火)', place: '事務所', person: '—', action: '新規訪問先リストアップ' },
      { date: '7/16(水)', place: '自由が丘', person: '高橋さん', action: '同行訪問で学ぶ' },
      { date: '7/18(金)', place: 'I居宅', person: '林さん', action: '久しぶりの訪問' },
    ],
    charaMsgs: [
      { text: '{name}さん、まずは1つだけ試してみよう 🌱', sub: '全部変えなくていいよ。次の訪問1件だけ、高橋さんのやり方をお試しで。' },
      { text: '村上さんとの関係、いい感じに続いてるね 👍', sub: '{name}さんのその丁寧さを、他の紹介元にも少しずつ広げていこう。' },
      { text: '今週、高橋さんに同行できそう？ 🤝', sub: '見て学ぶだけでも大きな一歩になるよ。応援してる！' },
      { text: '焦らなくて大丈夫、{name}さん 🌤️', sub: '小さな一歩でも、続ければ必ず変わっていくよ。' },
    ],
  },
};

const TEAM_RANKING = [
  { name: '高橋', full: '高橋 美咲', val: '5件', pct: 100 },
  { name: '佐藤', full: '佐藤 恵子', val: '3件', pct: 60 },
  { name: '田中', full: '田中 健一', val: '2件', pct: 40 },
  { name: '伊藤', full: '伊藤 誠', val: '2件', pct: 40 },
];

/* ============================
   ヘルパー
   ============================ */
function badge(text, bg, color) {
  return `<span class="badge" style="background:${bg};color:${color}">${text}</span>`;
}

const $ = id => document.getElementById(id);

/* ============================
   店舗ビューの描画
   ============================ */
function renderStorePage(storeName) {
  const d = STORE_DATA[storeName];
  if (!d) return;

  $('store-banner').textContent = `🏠 ${storeName} — ${d.service}`;

  $('store-kpis').innerHTML = d.kpis.map(k => `
    <div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value">${k.value}</div><div class="kpi-change ${k.dir}">${k.delta}</div></div>
  `).join('');

  $('store-goal').innerHTML = `
    <div style="margin-bottom:6px;font-size:12px;color:#888">${d.goal.label}</div>
    <div style="background:#e2e8f0;border-radius:6px;height:20px;overflow:hidden;margin-bottom:6px"><div style="background:${d.goal.color};height:100%;width:${d.goal.pct}%;border-radius:6px"></div></div>
    <div style="font-size:13px;font-weight:700;color:#059669">${d.goal.text}</div>
  `;

  $('store-rep-ranking').innerHTML = d.repRanking.map(r => `
    <div class="rank-row"><div class="rank-name">${r.name}</div><div class="rank-bar"><div class="rank-fill" style="width:${r.pct}%"></div></div><div class="rank-val">${r.val}</div></div>
  `).join('');

  $('store-referrers').innerHTML = d.referrers.map(r => `
    <tr><td><strong>${r.name}</strong></td><td>${r.facility}</td><td>${r.rel}</td><td>${r.last}</td><td>${r.count}</td><td>${r.rep}</td></tr>
  `).join('');

  $('store-plan-table').innerHTML = d.planTable.map(p => `
    <tr><td><strong>${p.name}</strong></td><td>${p.plans}</td><td style="color:${p.vacancyColor};font-weight:700">${p.vacancy}</td><td>${p.referred}</td><td>${p.status}</td></tr>
  `).join('');
  $('store-plan-comment').textContent = d.planComment;

  $('store-insights').innerHTML = d.insights.map(i => `
    <div class="insight-item ${i.level}"><div class="insight-title">${i.title}</div><div class="insight-desc">${i.desc}</div></div>
  `).join('');

  $('store-position').innerHTML = d.position.join('<br>');
  $('store-coverage').innerHTML = d.coverage.join('<br>');

  $('store-todos').innerHTML = d.todos.map(t => `
    <tr><td>${t.num}</td><td>${t.task}</td><td>${t.target}</td><td>${t.rep}</td><td>${t.due}</td><td>${t.status}</td></tr>
  `).join('');
}

function onStoreChange() {
  renderStorePage($('store-select').value);
}

/* ============================
   個人ビューの描画
   ============================ */
let charaIdx = 0;

function renderPersonalPage(repName) {
  const d = REP_DATA[repName];
  if (!d) return;

  $('personal-banner').textContent = `${d.store} ｜ ${d.role}`;

  charaIdx = 0;
  updateCharaMessage(repName);

  $('personal-kpis').innerHTML = d.kpis.map(k => `
    <div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value">${k.value}</div><div class="kpi-change ${k.dir}">${k.delta}</div></div>
  `).join('');

  $('personal-goal').innerHTML = `
    <div style="margin-bottom:6px;font-size:12px;color:#888">${d.goal.label}</div>
    <div style="background:#e2e8f0;border-radius:6px;height:18px;overflow:hidden;margin-bottom:6px"><div style="background:${d.goal.color};height:100%;width:${Math.min(d.goal.pct, 100)}%;border-radius:6px"></div></div>
    <div style="font-size:13px;font-weight:700;color:#4f46e5">${d.goal.text}</div>
  `;

  $('personal-rank').innerHTML = d.rank.join('<br>');

  $('personal-review-table').innerHTML = d.reviewRows.map(r => `
    <tr><td>${r.prev}</td><td>${r.result}</td><td>${r.status}</td></tr>
  `).join('');
  $('personal-review-comment').innerHTML = d.reviewRate;

  $('personal-insights').innerHTML = d.insights.map(i => `
    <div class="insight-item ${i.level}"><div class="insight-title">${i.title}</div><div class="insight-desc">${i.desc}</div></div>
  `).join('');

  $('personal-compare').innerHTML = renderCompare(d.compare);

  const hasReason = d.todos.length && 'reason' in d.todos[0];
  $('personal-todos').innerHTML = d.todos.map(t => `
    <tr><td style="font-weight:700;color:#7c3aed">${t.num}</td><td>${t.task}</td><td>${t.target}</td><td>${hasReason ? t.reason : ''}</td><td>${t.due}</td></tr>
  `).join('');

  $('personal-schedule').innerHTML = d.schedule.map(s => `
    <tr><td>${s.date}</td><td>${s.place}</td><td>${s.person}</td><td>${s.action}</td></tr>
  `).join('');

  $('personal-team-ranking').innerHTML = TEAM_RANKING.map(t => {
    const isMe = t.full === repName;
    const nameStyle = isMe ? ' style="color:#4f46e5;font-weight:700"' : '';
    const label = isMe ? `${t.name}（自分）` : t.name;
    return `<div class="rank-row"><div class="rank-name"${nameStyle}>${label}</div><div class="rank-bar"><div class="rank-fill" style="width:${t.pct}%"></div></div><div class="rank-val">${t.val}</div></div>`;
  }).join('');
}

function renderCompare(compare) {
  if (compare.isTop) {
    const rows = compare.rows.map(r => `
      <tr><td>${r.metric}</td><td style="font-weight:700;color:#4f46e5">${r.mine}</td><td>${r.other}</td><td style="color:#059669;font-weight:700">${r.diff}</td></tr>
    `).join('');
    return `
      <div class="card" style="border:1px solid #059669;background:#ecfdf5"><div class="card-title">🏆 あなたはチームのトップです（2位・${compare.secondName}さんとの差）</div>
        <table class="dt"><thead><tr><th>項目</th><th>わたし</th><th>${compare.secondName}さん</th><th>差</th></tr></thead><tbody>${rows}</tbody></table>
      </div>`;
  }
  const rows = compare.rows.map(r => `
    <tr><td>${r.metric}</td><td>${r.mine}</td><td style="color:#059669;font-weight:700">${r.top}</td><td style="color:#dc2626">${r.diff}</td><td>${r.tip}</td></tr>
  `).join('');
  return `
    <div class="card" style="border:1px solid #6366f1"><div class="card-title">📊 ${compare.topName}さんとの比べっこ — 真似できそうなこと</div>
      <table class="dt"><thead><tr><th>項目</th><th>わたし</th><th>${compare.topName}さん</th><th>差</th><th>こうするといいかも</th></tr></thead><tbody>${rows}</tbody></table>
    </div>`;
}

function onPersonalChange() {
  renderPersonalPage($('personal-select').value);
}

/* ============================
   バナゴリくん
   ============================ */
function updateCharaMessage(repName) {
  const d = REP_DATA[repName];
  const shortName = repName.split(' ')[0];
  const msg = d.charaMsgs[charaIdx];
  $('chara-text').textContent = msg.text.replace('{name}', shortName);
  $('chara-sub').textContent = msg.sub.replace('{name}', shortName);
}

function nextCharaMsg() {
  const repName = $('personal-select').value;
  const d = REP_DATA[repName];
  charaIdx = (charaIdx + 1) % d.charaMsgs.length;
  updateCharaMessage(repName);
  const el = $('chara-msg');
  el.style.transform = 'scale(0.98)';
  setTimeout(() => { el.style.transform = ''; }, 100);
}

/* ============================
   タブ切り替え
   ============================ */
function sw(el, pageId) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $(pageId).classList.add('active');
}

/* ============================
   設定の保存・読み込み
   ============================ */
const SETTINGS_KEY = 'careDashboardSettings';
const SETTINGS_FIELDS = [
  'set-goal-referrals', 'set-goal-visits', 'set-threshold-source',
  'set-threshold-revisit', 'set-warn-months', 'set-threshold-person',
];

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  SETTINGS_FIELDS.forEach(id => {
    if (saved[id] !== undefined) $(id).value = saved[id];
  });
}

function saveSettings() {
  const values = {};
  SETTINGS_FIELDS.forEach(id => { values[id] = $(id).value; });
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(values));

  const msg = $('settings-saved-msg');
  msg.style.display = 'inline';
  setTimeout(() => { msg.style.display = 'none'; }, 2000);
}

/* ============================
   初期化
   ============================ */
(function init() {
  renderStorePage($('store-select').value);
  renderPersonalPage($('personal-select').value);
  loadSettings();
  $('save-settings').addEventListener('click', saveSettings);
})();
