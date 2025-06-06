// Live Reference Info - MVP-1 JavaScript with Enhanced AI Keyword Extraction

class LiveReferenceInfo {
    constructor() {
        this.searchCount = 0;
        this.keywords = new Set();
        this.searchHistory = [];
        this.keywordCategories = new Map(); // キーワードのカテゴリ分類
        this.relatedTerms = new Map(); // 関連語のマッピング
        
        // OpenAI API設定（.env または config.js から取得）
        this.config = window.LIVE_REFERENCE_CONFIG || {};
        this.initializeAPIKey();
        this.OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
        this.settings = this.config.SETTINGS || {};
        
        this.initializeElements();
        this.bindEvents();
        this.updateTimestamp();
        this.loadSearchHistory();
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
                this.extractKeywordsEnhanced();
            }, this.settings.DEBOUNCE_TIME || 300); // 設定可能なデバウンス時間
        });
        
        // ボタンイベント
        this.extractBtn.addEventListener('click', () => {
            this.extractKeywordsEnhanced();
        });
        
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });
        
        // エンターキーで抽出実行
        this.inputText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.extractKeywordsEnhanced();
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
            this.updateSearchStatus('⌨️ 入力中... (AIキーワード解析準備)');
        } else if (text.length > 0) {
            this.updateSearchStatus('✏️ 入力中...');
        } else {
            this.updateSearchStatus('キーワードを入力して検索を開始してください');
        }
    }
    
    // 強化されたキーワード抽出（AIベース）
    async extractKeywordsEnhanced() {
        const text = this.inputText.value.trim();
        if (!text) {
            this.updateSearchStatus('テキストを入力してください');
            return;
        }
        
        this.updateSearchStatus('🤖 AIキーワード抽出中...');
        
        try {
            // AIベースのキーワード抽出とローカル抽出の組み合わせ
            const aiKeywords = await this.extractKeywordsWithAI(text);
            const localKeywords = this.performKeywordExtraction(text);
            
            // 重複除去と統合
            const allKeywords = [...new Set([...aiKeywords, ...localKeywords])]
                .slice(0, this.settings.MAX_KEYWORDS || 8);
            
            if (allKeywords.length === 0) {
                this.updateSearchStatus('キーワードが見つかりませんでした');
                return;
            }
            
            // カテゴリ分類
            await this.categorizeKeywords(allKeywords, text);
            
            this.displayKeywordsEnhanced(allKeywords);
            this.searchWithOpenAI(allKeywords, text);
            this.saveToHistory(text, allKeywords);
            this.updateTimestamp();
            
        } catch (error) {
            console.error('Enhanced keyword extraction error:', error);
            // フォールバック: ローカル抽出のみ
            const keywords = this.performKeywordExtraction(text);
            this.displayKeywords(keywords);
            this.searchWithOpenAI(keywords, text);
        }
    }
    
    // AIを使ったキーワード抽出
    async extractKeywordsWithAI(text) {
        if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            return [];
        }
        
        const prompt = `以下のテキストから、重要なキーワード（専門用語、固有名詞、技術用語、概念）を最大5個抽出してください。
各キーワードは1行に1つずつ、余計な説明なしで出力してください。

テキスト: "${text}"

キーワード:`;

        try {
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
                            content: 'あなたは専門的なキーワード抽出エキスパートです。テキストから最も重要で検索価値の高いキーワードを正確に抽出してください。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 200,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            // レスポンスから行ごとにキーワードを抽出
            return content.split('\n')
                .map(line => line.trim().replace(/^[-*•]?\s*/, ''))
                .filter(keyword => keyword.length > 0 && keyword.length < 50)
                .slice(0, 5);

        } catch (error) {
            console.error('AI keyword extraction error:', error);
            return [];
        }
    }
    
    // キーワードのカテゴリ分類
    async categorizeKeywords(keywords, context) {
        if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            // ローカルカテゴリ分類
            keywords.forEach(keyword => {
                this.keywordCategories.set(keyword, this.getLocalCategory(keyword));
            });
            return;
        }
        
        const prompt = `以下のキーワードを技術分野別にカテゴリ分類してください。
コンテキスト: "${context}"

キーワード: ${keywords.join(', ')}

各キーワードに対して「キーワード: カテゴリ」の形式で回答してください。
カテゴリは以下から選択: 技術, 科学, ビジネス, 学術, エンターテイメント, その他`;

        try {
            const response = await fetch(this.OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: this.settings.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 300,
                    temperature: 0.2
                })
            });

            if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            // カテゴリ情報を解析してマップに保存
            content.split('\n').forEach(line => {
                const match = line.match(/^(.+?):\s*(.+)$/);
                if (match) {
                    const [, keyword, category] = match;
                    this.keywordCategories.set(keyword.trim(), category.trim());
                }
            });

        } catch (error) {
            console.error('Category classification error:', error);
            // フォールバック: ローカル分類
            keywords.forEach(keyword => {
                this.keywordCategories.set(keyword, this.getLocalCategory(keyword));
            });
        }
    }
    
    // ローカルカテゴリ分類
    getLocalCategory(keyword) {
        const techTerms = ['AI', 'ML', 'API', 'JavaScript', 'Python', 'React', 'プログラミング', '機械学習', '人工知能'];
        const scienceTerms = ['アルゴリズム', 'データサイエンス', '統計', '数学', '物理'];
        const businessTerms = ['マーケティング', 'ビジネス', '経営', '戦略', '企業'];
        
        if (techTerms.some(term => keyword.includes(term))) return '技術';
        if (scienceTerms.some(term => keyword.includes(term))) return '科学';
        if (businessTerms.some(term => keyword.includes(term))) return 'ビジネス';
        return 'その他';
    }
    
    // 検索履歴の保存
    saveToHistory(text, keywords) {
        const historyItem = {
            timestamp: new Date().toISOString(),
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            keywords: keywords,
            searchCount: this.searchCount + 1
        };
        
        this.searchHistory.unshift(historyItem);
        this.searchHistory = this.searchHistory.slice(0, 10); // 最新10件まで保持
        
        // ローカルストレージに保存
        try {
            localStorage.setItem('liveReference_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to save history:', error);
        }
    }
    
    // 検索履歴の読み込み
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('liveReference_history');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load history:', error);
            this.searchHistory = [];
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
    
    // 強化されたキーワード表示（カテゴリ付き）
    displayKeywordsEnhanced(keywords) {
        this.keywordTags.innerHTML = '';
        
        // カテゴリ別にグループ化
        const categoryGroups = new Map();
        keywords.forEach(keyword => {
            const category = this.keywordCategories.get(keyword) || 'その他';
            if (!categoryGroups.has(category)) {
                categoryGroups.set(category, []);
            }
            categoryGroups.get(category).push(keyword);
        });
        
        // カテゴリごとに表示
        categoryGroups.forEach((categoryKeywords, category) => {
            // カテゴリヘッダー
            if (categoryGroups.size > 1) {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.innerHTML = `
                    <span class="category-icon">${this.getCategoryIcon(category)}</span>
                    <span class="category-name">${category}</span>
                `;
                this.keywordTags.appendChild(categoryHeader);
            }
            
            // キーワードタグ
            categoryKeywords.forEach(keyword => {
                const tag = document.createElement('span');
                tag.className = `keyword-tag searching category-${category.toLowerCase()}`;
                tag.innerHTML = `
                    <span class="keyword-text">${keyword}</span>
                    <span class="keyword-actions">
                        <button class="related-btn" title="関連語検索">🔗</button>
                        <button class="single-search-btn" title="単独検索">🔍</button>
                    </span>
                `;
                
                // イベントリスナー
                tag.querySelector('.single-search-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.searchSingleKeyword(keyword);
                });
                
                tag.querySelector('.related-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.searchRelatedTerms(keyword);
                });
                
                tag.addEventListener('click', () => {
                    this.searchSingleKeyword(keyword);
                });
                
                this.keywordTags.appendChild(tag);
                this.keywords.add(keyword);
            });
        });
        
        // 検索履歴ボタンを追加
        this.addHistoryButton();
    }
    
    // カテゴリアイコンの取得
    getCategoryIcon(category) {
        const icons = {
            '技術': '💻',
            '科学': '🔬',
            'ビジネス': '💼',
            '学術': '📚',
            'エンターテイメント': '🎭',
            'その他': '📝'
        };
        return icons[category] || '📝';
    }
    
    // 関連語検索
    async searchRelatedTerms(keyword) {
        this.updateSearchStatus(`🔗 "${keyword}" の関連語を検索中...`);
        
        if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            this.updateSearchStatus('❌ 関連語検索にはAPIキーが必要です');
            return;
        }
        
        const prompt = `"${keyword}"に関連する重要なキーワードを3-5個教えてください。
各キーワードは1行に1つずつ、簡潔に出力してください。`;

        try {
            const response = await fetch(this.OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: this.settings.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 150,
                    temperature: 0.5
                })
            });

            if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            const relatedTerms = content.split('\n')
                .map(line => line.trim().replace(/^[-*•]?\s*/, ''))
                .filter(term => term.length > 0 && term.length < 50)
                .slice(0, 5);
            
            this.relatedTerms.set(keyword, relatedTerms);
            this.displayRelatedTerms(keyword, relatedTerms);
            this.updateSearchStatus(`✨ "${keyword}" の関連語検索完了`);
            
        } catch (error) {
            console.error('Related terms search error:', error);
            this.updateSearchStatus(`❌ "${keyword}" の関連語検索でエラーが発生しました`);
        }
    }
    
    // 関連語の表示
    displayRelatedTerms(originalKeyword, relatedTerms) {
        const relatedContainer = document.createElement('div');
        relatedContainer.className = 'related-terms-container';
        relatedContainer.innerHTML = `
            <div class="related-header">
                <span class="related-icon">🔗</span>
                <span class="related-title">"${originalKeyword}" の関連語</span>
            </div>
            <div class="related-terms">
                ${relatedTerms.map(term => `
                    <span class="related-term" onclick="window.liveReferenceInfo.searchSingleKeyword('${term}')">
                        ${term}
                    </span>
                `).join('')}
            </div>
        `;
        
        // 既存の関連語コンテナを削除
        const existing = this.keywordTags.querySelector('.related-terms-container');
        if (existing) existing.remove();
        
        this.keywordTags.appendChild(relatedContainer);
    }
    
    // 検索履歴ボタンの追加
    addHistoryButton() {
        if (this.searchHistory.length === 0) return;
        
        const historyButton = document.createElement('button');
        historyButton.className = 'history-button';
        historyButton.innerHTML = `📚 履歴 (${this.searchHistory.length})`;
        historyButton.addEventListener('click', () => {
            this.showSearchHistory();
        });
        
        this.keywordTags.appendChild(historyButton);
    }
    
    // 検索履歴の表示
    showSearchHistory() {
        const historyModal = document.createElement('div');
        historyModal.className = 'history-modal';
        historyModal.innerHTML = `
            <div class="history-content">
                <div class="history-header">
                    <h3>🕒 検索履歴</h3>
                    <button class="close-history">✕</button>
                </div>
                <div class="history-list">
                    ${this.searchHistory.map((item, index) => `
                        <div class="history-item" data-index="${index}">
                            <div class="history-text">${item.text}</div>
                            <div class="history-keywords">
                                ${item.keywords.map(keyword => `
                                    <span class="history-keyword">${keyword}</span>
                                `).join('')}
                            </div>
                            <div class="history-meta">
                                ${new Date(item.timestamp).toLocaleString('ja-JP')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // イベントリスナー
        historyModal.querySelector('.close-history').addEventListener('click', () => {
            historyModal.remove();
        });
        
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) {
                historyModal.remove();
            }
        });
        
        // 履歴アイテムクリックで復元
        historyModal.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const historyItem = this.searchHistory[index];
                this.inputText.value = historyItem.text;
                this.extractKeywordsEnhanced();
                historyModal.remove();
            });
        });
        
        document.body.appendChild(historyModal);
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