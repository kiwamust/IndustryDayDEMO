// Live Reference Info - MVP-1 JavaScript with OpenAI Realtime API

class LiveReferenceInfo {
    constructor() {
        this.searchCount = 0;
        this.keywords = new Set();
        this.searchHistory = [];
        
        // OpenAI API設定（.env または config.js から取得）
        this.config = window.LIVE_REFERENCE_CONFIG || {};
        this.initializeAPIKey();
        this.OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
        this.settings = this.config.SETTINGS || {};
        
        this.initializeElements();
        this.bindEvents();
        this.updateTimestamp();
    }
    
    initializeElements() {
        this.inputText = document.getElementById('inputText');
        this.extractBtn = document.getElementById('extractBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.keywordTags = document.getElementById('keywordTags');
        this.searchStatus = document.getElementById('searchStatus');
        this.searchResults = document.getElementById('searchResults');
        this.lastUpdate = document.getElementById('lastUpdate');
        this.searchCountEl = document.getElementById('searchCount');
    }
    
    bindEvents() {
        // リアルタイム処理（入力時）
        this.inputText.addEventListener('input', () => {
            // 即座に視覚フィードバック
            this.showTypingFeedback();
            
            clearTimeout(this.inputTimeout);
            this.inputTimeout = setTimeout(() => {
                this.extractKeywords();
            }, this.settings.DEBOUNCE_TIME || 300); // 設定可能なデバウンス時間
        });
        
        // ボタンイベント
        this.extractBtn.addEventListener('click', () => {
            this.extractKeywords();
        });
        
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });
        
        // エンターキーで抽出実行
        this.inputText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.extractKeywords();
            }
        });
    }
    
    // APIキーの初期化
    initializeAPIKey() {
        // .envファイルから取得を優先
        const envKey = window.EnvLoader?.OPENAI_API_KEY;
        if (envKey && envKey !== '' && envKey !== 'your_openai_api_key_here') {
            this.OPENAI_API_KEY = envKey;
            console.log('✅ Using API key from .env file');
            return;
        }
        
        // config.jsから取得
        if (typeof this.config.OPENAI_API_KEY === 'function') {
            this.OPENAI_API_KEY = this.config.OPENAI_API_KEY();
        } else {
            this.OPENAI_API_KEY = this.config.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
        }
        
        if (this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE' || this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            console.warn('⚠️ API key not configured. Please set OPENAI_API_KEY in .env or config.js');
        } else {
            console.log('✅ Using API key from config.js');
        }
    }

    // タイピング中の視覚フィードバック
    showTypingFeedback() {
        const text = this.inputText.value.trim();
        if (text.length > 10) {
            this.updateSearchStatus('⌨️ 入力中... (リアルタイム解析準備)');
        } else if (text.length > 0) {
            this.updateSearchStatus('✏️ 入力中...');
        } else {
            this.updateSearchStatus('キーワードを入力して検索を開始してください');
        }
    }
    
    // キーワード抽出（シンプルな実装）
    extractKeywords() {
        const text = this.inputText.value.trim();
        if (!text) {
            this.updateSearchStatus('テキストを入力してください');
            return;
        }
        
        this.updateSearchStatus('キーワード抽出中...');
        
        // シンプルなキーワード抽出ロジック
        const keywords = this.performKeywordExtraction(text);
        
        if (keywords.length === 0) {
            this.updateSearchStatus('キーワードが見つかりませんでした');
            return;
        }
        
        this.displayKeywords(keywords);
        this.searchWithOpenAI(keywords, text);
        this.updateTimestamp();
    }
    
    performKeywordExtraction(text) {
        // 1. 基本的な前処理
        let processedText = text
            .toLowerCase()
            .replace(/[。、！？，．\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        // 2. 技術用語・カタカナ語の抽出
        const techKeywords = this.extractTechnicalTerms(text);
        
        // 3. 重要な名詞の抽出（簡易版）
        const importantNouns = this.extractImportantNouns(processedText);
        
        // 4. キーワードの統合とフィルタリング
        const allKeywords = [...new Set([...techKeywords, ...importantNouns])];
        
        return allKeywords
            .filter(keyword => keyword.length >= 2) // 2文字以上
            .filter(keyword => !this.isStopWord(keyword))
            .slice(0, this.settings.MAX_KEYWORDS || 5); // 設定可能な最大キーワード数
    }
    
    extractTechnicalTerms(text) {
        const patterns = [
            // カタカナ語（3文字以上）
            /[ァ-ヴー]{3,}/g,
            // 英単語（3文字以上）
            /\b[A-Za-z]{3,}\b/g,
            // 技術用語パターン
            /AI|ML|DX|IoT|API|SDK|UI|UX|CSS|HTML|JavaScript|Python|React/gi
        ];
        
        const keywords = [];
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                keywords.push(...matches);
            }
        });
        
        return keywords;
    }
    
    extractImportantNouns(text) {
        // 日本語の重要キーワードリスト（簡易版）
        const importantTerms = [
            '機械学習', '人工知能', 'データサイエンス', 'プログラミング',
            'ウェブ開発', 'フロントエンド', 'バックエンド', 'データベース',
            'セキュリティ', 'クラウド', 'インフラ', 'ネットワーク',
            '設計', '開発', '実装', '運用', '保守', 'テスト',
            'アルゴリズム', 'データ構造', 'フレームワーク', 'ライブラリ'
        ];
        
        return importantTerms.filter(term => 
            text.includes(term)
        );
    }
    
    isStopWord(word) {
        const stopWords = [
            'する', 'です', 'である', 'ます', 'だ', 'と', 'の', 'が', 'を', 'に',
            'で', 'は', 'も', 'から', 'まで', 'こと', 'もの', 'ため', 'よう',
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
            'with', 'by', 'an', 'a', 'is', 'are', 'was', 'were', 'be', 'been'
        ];
        
        return stopWords.includes(word.toLowerCase());
    }
    
    displayKeywords(keywords) {
        this.keywordTags.innerHTML = '';
        keywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag searching';
            tag.textContent = keyword;
            tag.addEventListener('click', () => {
                this.searchSingleKeyword(keyword);
            });
            this.keywordTags.appendChild(tag);
            this.keywords.add(keyword);
        });
    }
    
    // OpenAI APIを使ったリアルタイム検索
    async searchWithOpenAI(keywords, fullText) {
        this.updateSearchStatus('🤖 AI検索中... (OpenAI Realtime API)');
        this.searchResults.innerHTML = '';
        
        try {
            // 各キーワードに対してOpenAI APIで検索風の回答を生成
            const promises = keywords.map(keyword => this.searchWithOpenAIKeyword(keyword, fullText));
            const results = await Promise.allSettled(promises);
            
            this.displayOpenAIResults(results, keywords);
            this.markKeywordsAsSearched();
            this.searchCount++;
            this.updateSearchCount();
            this.updateSearchStatus(`✨ AI検索完了: ${keywords.length}個のキーワード`);
            
        } catch (error) {
            console.error('OpenAI Search error:', error);
            this.updateSearchStatus('❌ AI検索エラーが発生しました');
        }
    }
    
    // 単一キーワードでOpenAI検索
    async searchWithOpenAIKeyword(keyword, context = '') {
        if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            // フォールバック: Wikipedia検索
            console.warn('OpenAI API Key not set, falling back to Wikipedia');
            return await this.searchWikipedia(keyword);
        }
        
        try {
            const prompt = context 
                ? `"${context}"という文脈で、"${keyword}"について最新の参考情報を教えてください。以下の形式で回答してください：

タイトル: ${keyword}について
概要: （100文字程度の要約）
詳細: （200文字程度の詳しい説明）
関連情報: （関連する技術やトピック）
参考リンク: （もしあれば）`
                : `"${keyword}"について最新の参考情報を教えてください。技術的な内容であれば最新のトレンドや応用例も含めて説明してください。`;

            const response = await fetch(this.OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: this.settings.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'あなたは親切で知識豊富なリサーチアシスタントです。質問されたトピックについて、正確で最新の情報を分かりやすく説明してください。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: this.settings.OPENAI_MAX_TOKENS || 500,
                    temperature: this.settings.OPENAI_TEMPERATURE || 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '情報が見つかりませんでした';

            return {
                keyword: keyword,
                title: `🤖 AI検索: ${keyword}`,
                extract: content,
                source: 'OpenAI',
                url: '#'
            };

        } catch (error) {
            console.error(`OpenAI search error for "${keyword}":`, error);
            // フォールバック: Wikipedia検索
            return await this.searchWikipedia(keyword);
        }
    }
    
    async searchSingleKeyword(keyword) {
        this.updateSearchStatus(`🤖 "${keyword}" をAI検索中...`);
        
        try {
            const result = await this.searchWithOpenAIKeyword(keyword, this.inputText.value);
            this.displaySingleOpenAIResult(result, keyword);
            this.updateSearchStatus(`✨ "${keyword}" のAI検索完了`);
        } catch (error) {
            console.error('Single search error:', error);
            this.updateSearchStatus(`❌ "${keyword}" の検索でエラーが発生しました`);
        }
    }
    
    displaySingleOpenAIResult(result, keyword) {
        // 既存の結果をクリア
        this.searchResults.innerHTML = '';
        this.createOpenAIResultItem(result, keyword);
    }
    
    async searchWikipedia(keyword) {
        const apiUrl = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`;
        
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                // 英語版で再試行
                const enApiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`;
                const enResponse = await fetch(enApiUrl);
                if (!enResponse.ok) {
                    throw new Error('Wikipedia API error');
                }
                return await enResponse.json();
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Wikipedia search error for "${keyword}":`, error);
            return {
                title: keyword,
                extract: '検索結果が見つかりませんでした',
                content_urls: { desktop: { page: '#' } }
            };
        }
    }
    
    // OpenAI検索結果の表示
    displayOpenAIResults(results, keywords) {
        results.forEach((result, index) => {
            const keyword = keywords[index];
            
            if (result.status === 'fulfilled' && result.value) {
                this.createOpenAIResultItem(result.value, keyword);
            } else {
                this.createErrorItem(keyword);
            }
        });
    }
    
    // OpenAI検索結果のアイテム作成
    createOpenAIResultItem(data, keyword) {
        const item = document.createElement('div');
        item.className = 'result-item openai-result';
        
        const title = data.title || `🤖 ${keyword}`;
        const extract = data.extract || '情報が見つかりませんでした';
        const source = data.source || 'AI';
        
        // OpenAI結果の場合は改行を保持
        const formattedExtract = extract.replace(/\n/g, '<br>');
        
        item.innerHTML = `
            <div class="result-header">
                <div class="result-title-openai">
                    ${title}
                </div>
                <div class="result-source">
                    ⚡ ${source} リアルタイム検索
                </div>
            </div>
            <div class="result-snippet openai-content">
                ${formattedExtract}
            </div>
            <div class="result-actions">
                <button class="search-more-btn" onclick="window.liveReferenceInfo.searchSingleKeyword('${keyword}')">
                    🔄 再検索
                </button>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${extract.replace(/`/g, '\\`')}\`)">
                    📋 コピー
                </button>
            </div>
        `;
        
        this.searchResults.appendChild(item);
    }
    
    displaySingleResult(result, keyword) {
        // 既存の結果をクリア
        this.searchResults.innerHTML = '';
        this.createResultItem(result, keyword);
    }
    
    createResultItem(data, keyword) {
        const item = document.createElement('div');
        item.className = 'result-item';
        
        const title = data.title || keyword;
        const extract = data.extract || '詳細情報が見つかりませんでした';
        const url = data.content_urls?.desktop?.page || '#';
        
        item.innerHTML = `
            <a href="${url}" target="_blank" class="result-title">
                📖 ${title}
            </a>
            <div class="result-snippet">
                ${extract}
            </div>
            <a href="${url}" target="_blank" class="result-url">
                🔗 Wikipedia で詳細を見る
            </a>
        `;
        
        this.searchResults.appendChild(item);
    }
    
    createErrorItem(keyword) {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.style.opacity = '0.6';
        
        item.innerHTML = `
            <div class="result-title" style="color: #e53e3e;">
                ❌ ${keyword}
            </div>
            <div class="result-snippet">
                検索結果が見つかりませんでした
            </div>
        `;
        
        this.searchResults.appendChild(item);
    }
    
    markKeywordsAsSearched() {
        const tags = this.keywordTags.querySelectorAll('.keyword-tag');
        tags.forEach(tag => {
            tag.classList.remove('searching');
            tag.classList.add('searched');
        });
    }
    
    updateSearchStatus(message) {
        this.searchStatus.textContent = message;
        this.searchStatus.className = 'search-status';
        
        if (message.includes('中...')) {
            this.searchStatus.classList.add('loading');
        }
    }
    
    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
        this.lastUpdate.textContent = `最終更新: ${timeString}`;
    }
    
    updateSearchCount() {
        this.searchCountEl.textContent = `検索回数: ${this.searchCount}`;
    }
    
    clearAll() {
        this.inputText.value = '';
        this.keywordTags.innerHTML = '';
        this.searchResults.innerHTML = '';
        this.keywords.clear();
        this.updateSearchStatus('キーワードを入力して検索を開始してください');
        this.updateTimestamp();
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.liveReferenceInfo = new LiveReferenceInfo();
    
    // 初期メッセージ
    console.log('🎤 Live Reference Info MVP-1 が起動しました');
    console.log('📝 使用方法:');
    console.log('  1. テキストエリアに文章を入力');
    console.log('  2. 自動キーワード抽出（1秒後）');
    console.log('  3. Wikipedia検索結果を表示');
    console.log('  4. Ctrl+Enterで手動抽出');
}); 