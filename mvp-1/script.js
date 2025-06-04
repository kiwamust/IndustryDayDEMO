// Live Reference Info - MVP-1 JavaScript

class LiveReferenceInfo {
    constructor() {
        this.searchCount = 0;
        this.keywords = new Set();
        this.searchHistory = [];
        
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
            }, 300); // 0.3秒のデバウンス（よりリアルタイム）
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
        this.searchKeywords(keywords);
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
            .slice(0, 5); // 上位5つまで
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
    
    async searchKeywords(keywords) {
        this.updateSearchStatus('🔍 検索中...');
        this.searchResults.innerHTML = '';
        
        try {
            const promises = keywords.map(keyword => this.searchWikipedia(keyword));
            const results = await Promise.allSettled(promises);
            
            this.displaySearchResults(results, keywords);
            this.markKeywordsAsSearched();
            this.searchCount++;
            this.updateSearchCount();
            this.updateSearchStatus(`${keywords.length}個のキーワードで検索完了`);
            
        } catch (error) {
            console.error('Search error:', error);
            this.updateSearchStatus('❌ 検索エラーが発生しました');
        }
    }
    
    async searchSingleKeyword(keyword) {
        this.updateSearchStatus(`"${keyword}" を検索中...`);
        
        try {
            const result = await this.searchWikipedia(keyword);
            this.displaySingleResult(result, keyword);
            this.updateSearchStatus(`"${keyword}" の検索完了`);
        } catch (error) {
            console.error('Single search error:', error);
            this.updateSearchStatus(`"${keyword}" の検索でエラーが発生しました`);
        }
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
    
    displaySearchResults(results, keywords) {
        results.forEach((result, index) => {
            const keyword = keywords[index];
            
            if (result.status === 'fulfilled' && result.value) {
                this.createResultItem(result.value, keyword);
            } else {
                this.createErrorItem(keyword);
            }
        });
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