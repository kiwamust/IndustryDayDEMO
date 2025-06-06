// OpenAI API設定テンプレートファイル
// 使用方法: このファイルをconfig.jsにコピーして実際のAPIキーを設定してください

window.LIVE_REFERENCE_CONFIG = {
    // OpenAI APIキー（.envファイルまたは直接設定）
    // 優先順位: 1. .env, 2. 直接設定
    get OPENAI_API_KEY() {
        // .envファイルから取得を試行
        const envKey = window.EnvLoader?.OPENAI_API_KEY;
        if (envKey && envKey !== '' && envKey !== 'your_openai_api_key_here') {
            return envKey;
        }
        
        // フォールバック: 直接設定値
        return 'YOUR_OPENAI_API_KEY_HERE';
    },
    
    // その他の設定
    SETTINGS: {
        // リアルタイム更新の間隔（ミリ秒）
        DEBOUNCE_TIME: 1000,  // 1秒に調整（レスポンシブな体験）
        
        // 最大キーワード数
        MAX_KEYWORDS: 3,      // 3個に削減（高速化）
        
        // OpenAI設定
        OPENAI_MODEL: 'gpt-4o-mini',     // gpt-4o-mini | gpt-4o | gpt-3.5-turbo
        OPENAI_MAX_TOKENS: 300,          // 300に削減（高速化）
        OPENAI_TEMPERATURE: 0.3,         // 0.3に調整（バランス）
        
        // 表示設定
        ENABLE_TYPING_FEEDBACK: true,    // タイピング中のフィードバック
        ENABLE_ANIMATIONS: true,         // アニメーション効果
        ENABLE_REALTIME_SEARCH: true     // リアルタイム検索を有効化
    }
};

// セットアップ手順:
// 1. このファイルを 'config.js' にコピー
//    cp config.example.js config.js
// 
// 2. config.js の OPENAI_API_KEY を実際のAPIキーに変更
//    OPENAI_API_KEY: 'sk-proj-your-actual-api-key-here'
//
// 3. ブラウザで動作確認
//    http://localhost:8080

// 注意:
// - config.js は .gitignore に追加済みのため、Gitにコミットされません
// - APIキーは絶対に公開しないでください
// - 本番環境では環境変数やサーバーサイドでの管理を推奨 