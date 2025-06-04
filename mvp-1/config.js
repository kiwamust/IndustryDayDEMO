// OpenAI API設定ファイル
// 使用方法: このファイルでAPIキーを設定してください

window.LIVE_REFERENCE_CONFIG = {
    // OpenAI APIキーをここに設定
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    
    // その他の設定
    SETTINGS: {
        // リアルタイム更新の間隔（ミリ秒）
        DEBOUNCE_TIME: 300,
        
        // 最大キーワード数
        MAX_KEYWORDS: 5,
        
        // OpenAI設定
        OPENAI_MODEL: 'gpt-4o-mini',
        OPENAI_MAX_TOKENS: 500,
        OPENAI_TEMPERATURE: 0.7,
        
        // 表示設定
        ENABLE_TYPING_FEEDBACK: true,
        ENABLE_ANIMATIONS: true
    }
};

// 使用例:
// 1. このファイルのOPENAI_API_KEYに実際のAPIキーを設定
// 2. index.htmlでこのファイルを読み込み
// 3. script.jsで window.LIVE_REFERENCE_CONFIG.OPENAI_API_KEY を使用 