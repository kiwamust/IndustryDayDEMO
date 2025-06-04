# Live Reference Info - 美しいUI設計 🎨

## 🎯 デザインコンセプト
**「ミニマル・エレガント・レスポンシブ」**

- 洗練されたモダンデザイン
- 直感的で使いやすいUX
- 美しいアニメーション効果
- プロフェッショナルな外観

## 🎨 デザインシステム

### カラーパレット
```css
:root {
  /* プライマリーカラー */
  --primary: #667eea;
  --primary-dark: #5a6fd8;
  --primary-light: #a8b5f0;
  
  /* セカンダリーカラー */
  --secondary: #764ba2;
  --accent: #f093fb;
  
  /* ニュートラル */
  --bg-primary: #fafbfc;
  --bg-secondary: #ffffff;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --border: #e2e8f0;
  
  /* ステータスカラー */
  --success: #48bb78;
  --warning: #ed8936;
  --error: #f56565;
}
```

### タイポグラフィ
```css
/* メインフォント */
font-family: 'Inter', 'Hiragino Kaku Gothic ProN', 'Helvetica Neue', Arial, sans-serif;

/* フォントサイズ */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 2rem;      /* 32px */
```

### スペーシング
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
```

## 📐 レイアウト設計

### デスクトップ版 (1200px+)
```
┌─────────────────────────────────────────────────────────┐
│ 🎤 Live Reference Info                    [🌙] [⚙️]    │ ヘッダー
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────┐  ┌─────────────────────────────┐ │
│ │ 📝 テキスト入力      │  │ 📚 検索結果                │ │
│ │                    │  │                             │ │
│ │ ┌─────────────────┐ │  │ ┌─────────────────────────┐ │ │
│ │ │                 │ │  │ │ 🔍 キーワード: AI       │ │ │
│ │ │   テキストエリア │ │  │ │ ───────────────────────── │ │ │
│ │ │                 │ │  │ │ 📖 人工知能 - Wikipedia  │ │ │
│ │ │                 │ │  │ │ 人工知能（AI）は...      │ │ │
│ │ │                 │ │  │ │                         │ │ │
│ │ └─────────────────┘ │  │ │ 🔗 詳細を見る           │ │ │
│ │                    │  │ └─────────────────────────┘ │ │
│ │ 🏷️ 抽出キーワード   │  │                             │ │
│ │ • AI ✨            │  │ ┌─────────────────────────┐ │ │
│ │ • 機械学習 ⚡       │  │ │ 🔍 キーワード: 機械学習  │ │ │
│ │ • 技術 🚀          │  │ │ ───────────────────────── │ │ │
│ └─────────────────────┘  │ │ 📖 機械学習 - Wikipedia │ │ │
│                          │ │ 機械学習は...            │ │ │
│                          │ └─────────────────────────┘ │ │
│                          └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### モバイル版 (768px以下)
```
┌─────────────────────┐
│ 🎤 Live Reference   │ ヘッダー
├─────────────────────┤
│ 📝 テキスト入力     │
│ ┌─────────────────┐ │
│ │                 │ │
│ │  テキストエリア  │ │
│ │                 │ │
│ └─────────────────┘ │
│ 🏷️ AI, 機械学習    │
├─────────────────────┤
│ 📚 検索結果         │
│ ┌─────────────────┐ │
│ │ 🔍 AI           │ │
│ │ 📖 人工知能      │ │
│ │ 概要テキスト...  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 🔍 機械学習      │ │
│ │ 📖 Machine...    │ │
│ └─────────────────┘ │
└─────────────────────┘
```

## ✨ アニメーション & インタラクション

### マイクロインタラクション
```css
/* スムーズなトランジション */
.smooth-transition {
  transition: all 0.2s ease-in-out;
}

/* ホバーエフェクト */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* フォーカス状態 */
.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* ローディングアニメーション */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 1.5s infinite;
}
```

### 検索結果の表示アニメーション
```css
/* スライドイン効果 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.search-result {
  animation: slideInRight 0.3s ease-out;
}
```

## 🎯 コンポーネント設計

### 1. ヘッダーコンポーネント
```html
<header class="header">
  <div class="header-content">
    <h1 class="logo">
      🎤 <span class="logo-text">Live Reference Info</span>
    </h1>
    <div class="header-actions">
      <button class="btn-icon" id="themeToggle">🌙</button>
      <button class="btn-icon">⚙️</button>
    </div>
  </div>
</header>
```

### 2. 入力エリアコンポーネント
```html
<div class="input-panel">
  <div class="input-header">
    <h2>📝 テキスト入力</h2>
    <span class="input-status">待機中</span>
  </div>
  <textarea 
    id="inputText" 
    class="text-input" 
    placeholder="ここにテキストを入力してください&#10;手入力・音声認識・ペースト対応"
  ></textarea>
  <div class="keywords-section">
    <h3>🏷️ 抽出キーワード</h3>
    <div id="keywords" class="keywords-list"></div>
  </div>
</div>
```

### 3. 検索結果コンポーネント
```html
<div class="results-panel">
  <div class="results-header">
    <h2>📚 検索結果</h2>
    <span class="results-count">0件</span>
  </div>
  <div id="results" class="results-list"></div>
</div>
```

### 4. 検索結果カード
```html
<div class="result-card">
  <div class="result-header">
    <span class="result-keyword">🔍 AI</span>
    <span class="result-source">Wikipedia</span>
  </div>
  <h3 class="result-title">📖 人工知能</h3>
  <p class="result-summary">
    人工知能（AI）は、人間の知的な行動を模倣する技術...
  </p>
  <div class="result-actions">
    <a href="#" class="btn-link">🔗 詳細を見る</a>
    <button class="btn-bookmark">🔖 保存</button>
  </div>
</div>
```

## 🎨 CSS実装（抜粋）

```css
/* ベーススタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Hiragino Kaku Gothic ProN', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: var(--text-primary);
}

/* メインコンテナ */
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-4);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  min-height: 100vh;
}

/* パネル共通スタイル */
.panel {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: var(--space-6);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
}

/* テキストエリア */
.text-input {
  width: 100%;
  min-height: 200px;
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: var(--space-4);
  font-size: var(--text-base);
  resize: vertical;
  transition: all 0.2s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* キーワードタグ */
.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: linear-gradient(45deg, var(--primary), var(--accent));
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: 20px;
  font-size: var(--text-sm);
  font-weight: 500;
  margin: var(--space-1);
  animation: fadeInScale 0.3s ease-out;
}

/* 検索結果カード */
.result-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  transition: all 0.2s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

/* レスポンシブ */
@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

/* ダークモード */
[data-theme="dark"] {
  --bg-primary: #1a202c;
  --bg-secondary: #2d3748;
  --text-primary: #e2e8f0;
  --text-secondary: #a0aec0;
  --border: #4a5568;
}
```

## ⚡ 10分実装戦略

### 優先度1 (必須)
- [ ] 基本レイアウト (Grid/Flexbox)
- [ ] 美しいカラーパレット適用
- [ ] カード型デザイン
- [ ] レスポンシブ対応

### 優先度2 (重要)
- [ ] スムーズなアニメーション
- [ ] ホバーエフェクト
- [ ] 美しいタイポグラフィ
- [ ] アイコンの統一

### 優先度3 (理想)
- [ ] ダークモード
- [ ] 詳細なマイクロインタラクション
- [ ] 高度なアニメーション

---

**🎨 美しさのポイント**:
- グラデーション背景
- 洗練されたカード型デザイン  
- スムーズなアニメーション
- 統一感のある色彩とアイコン
- モダンなタイポグラフィ

このデザインシステムで10分でもプロレベルの美しいUIが作れます！🚀 