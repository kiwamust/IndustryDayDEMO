// .envファイル読み込み用スクリプト
// 注意: これは開発用の簡易実装です

class EnvLoader {
    constructor() {
        this.env = {};
        this.loadEnv();
    }
    
    async loadEnv() {
        try {
            // .envファイルを読み込み（開発環境のみ）
            const response = await fetch('../.env');
            const text = await response.text();
            
            // .env形式をパース
            const lines = text.split('\n');
            lines.forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    const value = valueParts.join('=').trim();
                    this.env[key.trim()] = value;
                }
            });
            
            console.log('✅ Environment variables loaded');
            
        } catch (error) {
            console.warn('⚠️ Could not load .env file, using config.js instead');
            console.warn('This is normal in production or when .env is not accessible');
        }
    }
    
    get(key) {
        return this.env[key] || '';
    }
    
    // 使いやすいプロパティアクセス
    get OPENAI_API_KEY() {
        return this.get('OPENAI_API_KEY');
    }
    
    get ANTHROPIC_API_KEY() {
        return this.get('ANTHROPIC_API_KEY');
    }
}

// グローバルに公開
window.EnvLoader = new EnvLoader(); 