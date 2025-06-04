// OpenAI API設定テンプレートファイル
// 使用方法: このファイルをconfig.jsにコピーして実際のAPIキーを設定してください

window.LIVE_REFERENCE_CONFIG = {
    // OpenAI APIキーをここに設定
    // 実際のAPIキー例: 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    
    // その他の設定
    SETTINGS: {
        // リアルタイム更新の間隔（ミリ秒）
        DEBOUNCE_TIME: 300,
        
        // 最大キーワード数
        MAX_KEYWORDS: 5,
        
        // OpenAI設定
        OPENAI_MODEL: 'gpt-4o-mini',     // gpt-4o-mini | gpt-4o | gpt-3.5-turbo
        OPENAI_MAX_TOKENS: 500,          // 100-1000 (コスト vs 品質)
        OPENAI_TEMPERATURE: 0.7,         // 0.0-1.0 (正確性 vs 創造性)
        
        // 表示設定
        ENABLE_TYPING_FEEDBACK: true,    // タイピング中のフィードバック
        ENABLE_ANIMATIONS: true          // アニメーション効果
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