# Live Reference Info - セットアップガイド 🚀🎤

## 📋 概要

このガイドでは、Live Reference InfoでOpenAI API + 高度な音声認識機能を使用するための**セキュアな**設定方法を説明します。

### ✨ 新機能
- **🎤 Fn+Space クイック音声検索**: Willow AI風のホットキー対応
- **🧠 AI強化キーワード抽出**: OpenAI GPT-4による高精度分析
- **🔊 音声認識高精度化**: 専門用語辞書・信頼度フィルタリング

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

## 🔒 Step 2: セキュアな設定ファイル作成

### 2.1 設定ファイルをコピー
```bash
cd mvp-1
cp config.example.js config.js
```

### 2.2 config.jsにAPIキーを設定
```javascript
// mvp-1/config.js
window.LIVE_REFERENCE_CONFIG = {
    // ここに実際のAPIキーを貼り付け
    OPENAI_API_KEY: 'sk-proj-your-actual-api-key-here',
    
    SETTINGS: {
        DEBOUNCE_TIME: 300,
        MAX_KEYWORDS: 5,
        OPENAI_MODEL: 'gpt-4o-mini',
        OPENAI_MAX_TOKENS: 500,
        OPENAI_TEMPERATURE: 0.7
    }
};
```

### 2.3 .envファイルでの管理（推奨）
```bash
# ルートディレクトリの.envファイルを編集
nano .env
```

```env
# .env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2.4 設定項目の説明

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

### 3.3 基本動作確認
1. **テキスト入力**: `AIと機械学習について`
2. **自動キーワード抽出**（1秒後）
3. **OpenAI APIによる検索結果表示**

### 3.4 音声機能確認
#### 🎤 通常音声入力
1. **Voice Input**ボタンをクリック
2. マイク許可を与える
3. 音声で話す: `"ディープラーニング フレームワーク"`
4. 自動的にテキスト化→検索実行

#### 🚀 Fn+Space クイック検索
1. **Fn+Space**（または**Ctrl+Space**）を押しながら
2. 短く話す: `"React hooks"`
3. キーを離すと即座に検索実行
4. 右上に進行状況表示

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

#### 🎤 音声認識関連トラブル

##### 🔇 マイクが動作しない
- ブラウザでマイク許可を確認
- システム設定でマイクアクセス許可
- HTTPSまたはlocalhostでアクセス（セキュリティ要件）

##### 🎤 Fn+Spaceが動作しない
- `Ctrl+Space`をフォールバックとして使用
- ブラウザがアクティブ状態か確認
- コンソール（F12）でエラーメッセージ確認

##### 🗣️ 音声認識精度が低い
- 静かな環境で話す
- マイクに近づく
- はっきりと発音する
- 専門用語は少しゆっくり話す

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

## 🔒 Step 6: セキュリティ対策（重要）

### 6.1 .gitignoreの確認
```bash
# .gitignore に以下が含まれているか確認
cat .gitignore
```

```gitignore
# API Keys & Secrets
.env
*.env
mvp-1/config.js
```

### 6.2 ファイル構成
```
IndustryDayDEMO/
├── .env                    # 🔒 Git除外（実際のAPIキー）
├── .gitignore              # ✅ Gitコミット済み
├── mvp-1/
│   ├── config.js           # 🔒 Git除外（実際の設定）
│   ├── config.example.js   # ✅ Gitコミット済み（テンプレート）
│   ├── index.html
│   ├── script.js
│   └── style.css
```

### 6.3 セキュリティチェックリスト
- [ ] `.env` ファイルが `.gitignore` に追加されている
- [ ] `mvp-1/config.js` が `.gitignore` に追加されている
- [ ] `config.example.js` には実際のAPIキーが含まれていない
- [ ] Gitコミット前に `git status` で確認

### 6.4 本番環境での推奨方法
- フロントエンドに直接APIキーを書かない
- バックエンドAPIサーバー経由でOpenAI APIを呼び出し
- 環境変数やシークレット管理サービスを使用

## 🎯 Step 7: 完成確認

### ✅ チェックリスト

#### 基本機能
- [ ] OpenAI APIキー取得済み
- [ ] `.env` ファイル作成・設定済み
- [ ] `config.js` ファイル作成・設定済み
- [ ] `.gitignore` でAPIキーが保護されている
- [ ] ローカルサーバー起動済み
- [ ] ブラウザでアクセス確認
- [ ] AI検索の動作確認

#### 音声機能
- [ ] マイク許可設定済み
- [ ] 通常音声入力の動作確認
- [ ] Fn+Space クイック検索の動作確認
- [ ] 音声認識精度確認（専門用語含む）
- [ ] Fn-Key Modeトグルボタンの動作確認

### 🎉 成功時の表示

#### AI検索成功
```
🤖 AI検索中... (OpenAI GPT-4o-mini)
↓
✨ AI検索完了: 3個のキーワード [技術][科学][ビジネス]
```

#### Fn+Space音声検索成功
```
🎤 録音中... (Fn/Ctrlキーを離すと終了)
↓
🔍 検索中...
↓
✅ 検索完了
```

## 🛠️ Step 8: 安全な共有・開発

### 8.1 チーム開発時
```bash
# 1. 新メンバーへの共有
git clone <repository>
cd mvp-1
cp config.example.js config.js
# 2. config.js に各自のAPIキーを設定
```

### 8.2 環境別設定
```bash
# 開発環境
OPENAI_MODEL=gpt-4o-mini      # 低コスト
OPENAI_MAX_TOKENS=300

# 本番環境
OPENAI_MODEL=gpt-4o           # 高品質
OPENAI_MAX_TOKENS=1000
```

---

## 📞 サポート

### セキュリティ確認コマンド
```bash
# APIキーがGitに含まれていないか確認
git log --all --full-history -- .env
git log --all --full-history -- mvp-1/config.js

# 出力が空であればOK（ファイルがGit管理されていない）
```

### トラブル時の確認事項
1. **Console確認**: F12でエラーメッセージ
2. **APIキー確認**: config.jsの設定
3. **セキュリティ確認**: .gitignoreの設定
4. **ネットワーク確認**: インターネット接続
5. **残高確認**: OpenAIアカウントの残高
6. **🎤 マイク確認**: ブラウザでマイク許可
7. **🔊 音声品質**: 静かな環境・明確な発音

### デバッグ用JavaScript関数
ブラウザのコンソール（F12）で実行可能：
```javascript
// Fn-Key Mode状態確認
window.liveReferenceInfo.getFnKeyModeStatus()

// 音声認識テスト
window.liveReferenceInfo.fnKeyMode.startQuickCapture()

// システム情報確認
navigator.mediaDevices.enumerateDevices()
```

**🚀 セキュアな設定完了後、AI強化音声検索をお楽しみください！** 