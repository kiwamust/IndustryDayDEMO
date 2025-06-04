# Live Reference Info - OpenAI API セットアップガイド 🚀

## 📋 概要

このガイドでは、Live Reference InfoでOpenAI APIを使用するための設定方法を説明します。

## 🔑 Step 1: OpenAI APIキーの取得

### 1.1 OpenAI公式サイトでAPIキー取得
1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. アカウント作成 & ログイン
3. **API Keys** ページに移動
4. **+ Create new secret key** をクリック
5. 作成されたAPIキーをコピー（**重要**: 一度しか表示されません）

### 1.2 APIキー形式の確認
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ⚙️ Step 2: 設定ファイルの編集

### 2.1 config.jsファイルを編集
```javascript
// mvp-1/config.js
window.LIVE_REFERENCE_CONFIG = {
    // ここに実際のAPIキーを貼り付け
    OPENAI_API_KEY: 'sk-proj-your-actual-api-key-here',
    
    SETTINGS: {
        DEBOUNCE_TIME: 300,        // リアルタイム更新の間隔
        MAX_KEYWORDS: 5,           // 最大キーワード数
        OPENAI_MODEL: 'gpt-4o-mini', // 使用モデル
        OPENAI_MAX_TOKENS: 500,    // 最大トークン数
        OPENAI_TEMPERATURE: 0.7    // 創造性パラメータ
    }
};
```

### 2.2 設定項目の説明

| 項目 | 説明 | 推奨値 |
|------|------|--------|
| `DEBOUNCE_TIME` | 入力後の待機時間（ms） | 300 |
| `MAX_KEYWORDS` | 抽出キーワード数上限 | 5 |
| `OPENAI_MODEL` | 使用するOpenAIモデル | gpt-4o-mini |
| `OPENAI_MAX_TOKENS` | 回答の最大長 | 500 |
| `OPENAI_TEMPERATURE` | 回答の創造性（0-1） | 0.7 |

## 🚀 Step 3: アプリケーション起動

### 3.1 ローカルサーバー起動
```bash
cd mvp-1
python3 -m http.server 8080
```

### 3.2 ブラウザでアクセス
```
http://localhost:8080
```

### 3.3 動作確認
1. テキストエリアに入力: `AIと機械学習について`
2. 自動キーワード抽出（0.3秒後）
3. OpenAI APIによる検索結果表示

## 🧪 Step 4: テスト・デバッグ

### 4.1 APIキーの動作確認
- ブラウザのConsole（F12）を開く
- エラーメッセージを確認:
  ```
  ✅ 正常: "✨ AI検索完了: 3個のキーワード"
  ❌ APIキーエラー: "OpenAI API error: 401"
  ```

### 4.2 よくあるトラブル

#### 🚨 "API Key not set" エラー
```javascript
// 解決方法: config.jsでAPIキーを正しく設定
OPENAI_API_KEY: 'sk-proj-your-actual-key-here'  // ✅ 正しい
OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE'       // ❌ 間違い
```

#### 🚨 "401 Unauthorized" エラー
- APIキーが間違っている
- APIキーの権限が不足している
- 請求設定が未完了

#### 🚨 "CORS" エラー
- `file://` でアクセスしている → `http://localhost:8080` を使用

### 4.3 フォールバック機能
APIキーが設定されていない場合、自動的にWikipedia検索にフォールバックします。

## 💰 Step 5: コスト管理

### 5.1 料金目安（2024年基準）
- **gpt-4o-mini**: $0.15/1M入力トークン、$0.60/1M出力トークン
- **1回の検索**: 約100-200トークン = 約$0.0001

### 5.2 コスト最適化
```javascript
// 安価なモデル使用
OPENAI_MODEL: 'gpt-4o-mini',        // 最安
// OPENAI_MODEL: 'gpt-4o',           // 高品質・高価格

// トークン数制限
OPENAI_MAX_TOKENS: 300,            // コスト重視
// OPENAI_MAX_TOKENS: 1000,        // 品質重視
```

## 🔒 Step 6: セキュリティ対策

### 6.1 APIキーの保護
```bash
# .gitignoreに追加（重要）
echo "config.js" >> .gitignore
echo "*.env" >> .gitignore
```

### 6.2 本番環境での推奨方法
- フロントエンドに直接APIキーを書かない
- バックエンドAPIサーバー経由でOpenAI APIを呼び出し
- 環境変数でAPIキーを管理

## 🎯 Step 7: 完成確認

### ✅ チェックリスト
- [ ] OpenAI APIキー取得済み
- [ ] config.jsにAPIキー設定済み
- [ ] ローカルサーバー起動済み
- [ ] ブラウザでアクセス確認
- [ ] AI検索の動作確認
- [ ] コスト設定確認
- [ ] セキュリティ対策済み

### 🎉 成功時の表示
```
🤖 AI検索中... (OpenAI Realtime API)
↓
✨ AI検索完了: 3個のキーワード
```

---

## 📞 サポート

### トラブル時の確認事項
1. **Console確認**: F12でエラーメッセージ
2. **APIキー確認**: config.jsの設定
3. **ネットワーク確認**: インターネット接続
4. **残高確認**: OpenAIアカウントの残高

**🚀 設定完了後、リアルタイムAI検索をお楽しみください！** 