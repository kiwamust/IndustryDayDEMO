// Live Reference Info - MVP-1 JavaScript with Enhanced AI Keyword Extraction & Voice Recognition

// Global Hotkey System for Fn+Space voice recording (Willow AI style)
class GlobalHotkey {
    constructor(onStartRecording, onStopRecording) {
        this.isRecording = false;
        this.fnKeyPressed = false;
        this.spaceKeyPressed = false;
        this.isEnabled = false;
        
        // Callbacks
        this.onStartRecording = onStartRecording;
        this.onStopRecording = onStopRecording;
        
        // Key state tracking
        this.keyStates = new Set();
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleWindowBlur = this.handleWindowBlur.bind(this);
        this.handleWindowFocus = this.handleWindowFocus.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }
    
    enable() {
        if (this.isEnabled) return;
        
        this.isEnabled = true;
        document.addEventListener('keydown', this.handleKeyDown, true);
        document.addEventListener('keyup', this.handleKeyUp, true);
        window.addEventListener('blur', this.handleWindowBlur);
        window.addEventListener('focus', this.handleWindowFocus);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        console.log('[GlobalHotkey] Enabled - Press Fn+Space (or Ctrl+Space) for voice recording');
    }
    
    disable() {
        if (!this.isEnabled) return;
        
        this.isEnabled = false;
        this.stopRecording();
        
        document.removeEventListener('keydown', this.handleKeyDown, true);
        document.removeEventListener('keyup', this.handleKeyUp, true);
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.handleWindowFocus);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        console.log('[GlobalHotkey] Disabled');
    }
    
    handleKeyDown(event) {
        if (!this.isEnabled) return;
        
        // Track key states
        this.keyStates.add(event.code);
        
        // Fn key detection (multiple possible codes and fallback)
        const fnKeyCodes = ['Fn', 'FnLock', 'OSLeft', 'OSRight', 'MetaLeft', 'MetaRight'];
        const isFnKey = fnKeyCodes.includes(event.code) || 
                       event.key === 'Fn' || 
                       (event.getModifierState && event.getModifierState('Fn')) ||
                       event.code === 'ControlLeft' || // Fallback: use Ctrl as Fn
                       event.ctrlKey; // Additional fallback
        
        if (isFnKey) {
            this.fnKeyPressed = true;
        }
        
        // Space key detection
        if (event.code === 'Space') {
            this.spaceKeyPressed = true;
        }
        
        // Start recording when both Fn and Space are pressed
        if (this.fnKeyPressed && this.spaceKeyPressed && !this.isRecording) {
            event.preventDefault();
            event.stopPropagation();
            this.startRecording();
        }
    }
    
    handleKeyUp(event) {
        if (!this.isEnabled) return;
        
        // Remove from key states
        this.keyStates.delete(event.code);
        
        // Fn key release detection
        const fnKeyCodes = ['Fn', 'FnLock', 'OSLeft', 'OSRight', 'MetaLeft', 'MetaRight'];
        const isFnKeyRelease = fnKeyCodes.includes(event.code) || 
                              event.key === 'Fn' ||
                              event.code === 'ControlLeft' || // Fallback: use Ctrl as Fn
                              (!event.ctrlKey && this.fnKeyPressed); // Ctrl release
        
        if (isFnKeyRelease) {
            this.fnKeyPressed = false;
        }
        
        // Space key release
        if (event.code === 'Space') {
            this.spaceKeyPressed = false;
        }
        
        // Stop recording when either key is released
        if ((!this.fnKeyPressed || !this.spaceKeyPressed) && this.isRecording) {
            this.stopRecording();
        }
    }
    
    handleWindowBlur() {
        // Reset key states when window loses focus
        this.fnKeyPressed = false;
        this.spaceKeyPressed = false;
        this.keyStates.clear();
        
        if (this.isRecording) {
            this.stopRecording();
        }
    }
    
    handleWindowFocus() {
        // Reset states on focus
        this.fnKeyPressed = false;
        this.spaceKeyPressed = false;
        this.keyStates.clear();
    }
    
    handleVisibilityChange() {
        if (document.hidden && this.isRecording) {
            this.stopRecording();
        }
    }
    
    startRecording() {
        if (this.isRecording) return;
        
        this.isRecording = true;
        console.log('[GlobalHotkey] Starting voice recording...');
        
        if (this.onStartRecording) {
            this.onStartRecording();
        }
    }
    
    stopRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        console.log('[GlobalHotkey] Stopping voice recording...');
        
        if (this.onStopRecording) {
            this.onStopRecording();
        }
    }
    
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isRecording: this.isRecording,
            fnPressed: this.fnKeyPressed,
            spacePressed: this.spaceKeyPressed
        };
    }
}

// Fn-Key Trigger Mode (Willow AI style)
class FnKeyMode {
    constructor(voiceEnhancement, searchFunction) {
        this.voiceEnhancement = voiceEnhancement;
        this.searchFunction = searchFunction;
        this.isActive = false;
        this.recognition = null;
        this.hotkey = null;
        this.overlay = null;
        
        // Setup global hotkey
        this.setupHotkey();
        this.createModeIndicator();
    }
    
    setupHotkey() {
        this.hotkey = new GlobalHotkey(
            () => this.startQuickCapture(),
            () => this.stopQuickCapture()
        );
    }
    
    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.hotkey.enable();
        this.showModeIndicator('fn-key-mode');
        this.enableQuickCapture();
        
        console.log('[FnKeyMode] Activated - Press Fn+Space (or Ctrl+Space) for quick voice search');
    }
    
    deactivate() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.hotkey.disable();
        this.hideModeIndicator();
        
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }
        
        console.log('[FnKeyMode] Deactivated');
    }
    
    enableQuickCapture() {
        // Setup speech recognition for quick capture
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('[FnKeyMode] Speech recognition not supported');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Quick capture settings
        this.recognition.continuous = false;  // Single phrase mode
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3;
        this.recognition.lang = 'ja-JP';
        
        this.recognition.onresult = (event) => {
            this.processQuickCapture(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('[FnKeyMode] Recognition error:', event.error);
            this.showQuickFeedback('❌ 音声認識エラー', 'error');
        };
        
        this.recognition.onend = () => {
            // Recognition ended
            this.showQuickFeedback('🔍 検索中...', 'processing');
        };
    }
    
    startQuickCapture() {
        if (!this.isActive || !this.recognition) return;
        
        try {
            this.recognition.start();
            this.showQuickFeedback('🎤 録音中... (Fn/Ctrlキーを離すと終了)', 'recording');
        } catch (error) {
            console.error('[FnKeyMode] Failed to start recognition:', error);
            this.showQuickFeedback('❌ 録音開始失敗', 'error');
        }
    }
    
    stopQuickCapture() {
        if (!this.recognition) return;
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('[FnKeyMode] Failed to stop recognition:', error);
        }
    }
    
    async processQuickCapture(event) {
        try {
            const results = Array.from(event.results[0]);
            
            // Use voice enhancement for better accuracy
            const filteredResults = this.voiceEnhancement.filterByConfidence(results, 0.6);
            
            let bestTranscript = '';
            if (filteredResults.length > 0) {
                bestTranscript = this.voiceEnhancement.correctTerminology(filteredResults[0].transcript);
            } else if (results.length > 0) {
                bestTranscript = this.voiceEnhancement.correctTerminology(results[0].transcript);
            }
            
            if (!bestTranscript.trim()) {
                this.showQuickFeedback('❌ 音声が認識できませんでした', 'error');
                return;
            }
            
            console.log('[FnKeyMode] Quick capture result:', bestTranscript);
            
            // Extract keywords and perform search
            await this.performQuickSearch(bestTranscript);
            
        } catch (error) {
            console.error('[FnKeyMode] Error processing quick capture:', error);
            this.showQuickFeedback('❌ 処理エラー', 'error');
        }
    }
    
    async performQuickSearch(query) {
        try {
            this.showQuickFeedback('🔍 検索中...', 'processing');
            
            // Use existing search function
            if (this.searchFunction) {
                await this.searchFunction(query);
                this.showQuickFeedback('✅ 検索完了', 'success');
            }
            
        } catch (error) {
            console.error('[FnKeyMode] Search error:', error);
            this.showQuickFeedback('❌ 検索エラー', 'error');
        }
    }
    
    createModeIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'fn-mode-indicator';
        indicator.className = 'mode-indicator fn-key';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 0.5rem 1rem;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 20px;
            font-size: 0.8rem;
            z-index: 10000;
            border-left: 4px solid #00ff00;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        document.body.appendChild(indicator);
        this.modeIndicator = indicator;
    }
    
    showModeIndicator(mode) {
        if (this.modeIndicator) {
            this.modeIndicator.textContent = 'Fn+Space (or Ctrl+Space): クイック音声検索';
            this.modeIndicator.style.display = 'block';
        }
    }
    
    hideModeIndicator() {
        if (this.modeIndicator) {
            this.modeIndicator.style.display = 'none';
        }
    }
    
    showQuickFeedback(message, type = 'info') {
        // Create or update feedback overlay
        let feedback = document.getElementById('fn-quick-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'fn-quick-feedback';
            feedback.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                font-size: 0.9rem;
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                min-width: 200px;
                text-align: center;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(feedback);
        }
        
        // Set styles based on type
        const styles = {
            recording: { bg: 'rgba(255, 0, 0, 0.9)', color: 'white' },
            processing: { bg: 'rgba(0, 123, 255, 0.9)', color: 'white' },
            success: { bg: 'rgba(40, 167, 69, 0.9)', color: 'white' },
            error: { bg: 'rgba(220, 53, 69, 0.9)', color: 'white' },
            info: { bg: 'rgba(108, 117, 125, 0.9)', color: 'white' }
        };
        
        const style = styles[type] || styles.info;
        feedback.style.background = style.bg;
        feedback.style.color = style.color;
        feedback.textContent = message;
        feedback.style.display = 'block';
        
        // Auto-hide after delay (except for recording state)
        if (type !== 'recording') {
            setTimeout(() => {
                if (feedback && feedback.parentNode) {
                    feedback.style.display = 'none';
                }
            }, type === 'error' ? 3000 : 2000);
        }
    }
    
    getStatus() {
        return {
            isActive: this.isActive,
            hotkey: this.hotkey ? this.hotkey.getStatus() : null,
            recognition: this.recognition ? 'ready' : 'not_ready'
        };
    }
}

// Voice Enhancement Class for improved accuracy
class VoiceEnhancement {
    constructor() {
        this.terminologyCorrections = new Map([
            // AI・機械学習関連
            ['えーあい', 'AI'],
            ['あい', 'AI'],
            ['きかいがくしゅう', '機械学習'],
            ['でぃーぷらーにんぐ', 'ディープラーニング'],
            ['にゅーらるねっとわーく', 'ニューラルネットワーク'],
            ['じぇーぴーてぃー', 'GPT'],
            ['おーぷんえーあい', 'OpenAI'],
            
            // プログラミング関連
            ['じゃばすくりぷと', 'JavaScript'],
            ['ぱいそん', 'Python'],
            ['りあくと', 'React'],
            ['のーどじぇーえす', 'Node.js'],
            ['えいぴーあい', 'API'],
            ['でーたべーす', 'データベース'],
            
            // ビジネス・技術用語
            ['でじたるとらんすふぉーめーしょん', 'デジタルトランスフォーメーション'],
            ['でぃーえっくす', 'DX'],
            ['くらうど', 'クラウド'],
            ['あまぞんうぇぶさーびす', 'AWS'],
            ['ぐーぐるくらうど', 'Google Cloud']
        ]);
        
        this.confidenceThreshold = 0.7;
        this.contextWindow = [];
    }
    
    // 信頼度フィルタリング
    filterByConfidence(results, threshold = this.confidenceThreshold) {
        if (!results || !results.length) return [];
        return Array.from(results).filter(result => 
            result.confidence >= threshold
        );
    }
    
    // 専門用語補正
    correctTerminology(text) {
        if (!text) return text;
        
        let correctedText = text;
        
        // ひらがな→専門用語変換
        for (const [hiragana, term] of this.terminologyCorrections) {
            const regex = new RegExp(hiragana, 'gi');
            correctedText = correctedText.replace(regex, term);
        }
        
        // 英語の音声認識ミス修正
        correctedText = correctedText
            .replace(/エーピーアイ/g, 'API')
            .replace(/アイオーエス/g, 'iOS')
            .replace(/アンドロイド/g, 'Android')
            .replace(/ウィンドウズ/g, 'Windows')
            .replace(/マックオーエス/g, 'macOS');
        
        return correctedText;
    }
    
    // 文脈ベース補正（最高候補選択）
    selectBestCandidate(alternatives, context = '') {
        if (!alternatives || alternatives.length === 0) return '';
        
        // 単一候補の場合
        if (alternatives.length === 1) {
            return this.correctTerminology(alternatives[0].transcript);
        }
        
        // 複数候補から最適選択
        let bestCandidate = alternatives[0];
        let bestScore = this.calculateCandidateScore(alternatives[0], context);
        
        for (let i = 1; i < alternatives.length; i++) {
            const score = this.calculateCandidateScore(alternatives[i], context);
            if (score > bestScore) {
                bestCandidate = alternatives[i];
                bestScore = score;
            }
        }
        
        return this.correctTerminology(bestCandidate.transcript);
    }
    
    // 候補スコア算出（信頼度 + 文脈適合度）
    calculateCandidateScore(candidate, context) {
        let score = candidate.confidence || 0;
        
        // 文脈との適合度を加算
        if (context && candidate.transcript) {
            const transcript = candidate.transcript.toLowerCase();
            const contextLower = context.toLowerCase();
            
            // 技術用語の文脈チェック
            if (contextLower.includes('ai') || contextLower.includes('機械学習')) {
                if (transcript.includes('ai') || transcript.includes('機械学習') || 
                    transcript.includes('でぃーぷ') || transcript.includes('にゅーらる')) {
                    score += 0.2;
                }
            }
            
            if (contextLower.includes('プログラミング') || contextLower.includes('開発')) {
                if (transcript.includes('javascript') || transcript.includes('python') || 
                    transcript.includes('りあくと') || transcript.includes('えーぴーあい')) {
                    score += 0.2;
                }
            }
        }
        
        return score;
    }
    
    // 継続的学習用の文脈記録
    updateContext(text) {
        this.contextWindow.push(text);
        if (this.contextWindow.length > 10) {
            this.contextWindow.shift();
        }
    }
    
    // 現在の文脈取得
    getCurrentContext() {
        return this.contextWindow.join(' ');
    }
}

class LiveReferenceInfo {
    constructor() {
        this.searchCount = 0;
        this.keywords = new Set();
        this.searchHistory = [];
        this.keywordCategories = new Map(); // キーワードのカテゴリ分類
        this.relatedTerms = new Map(); // 関連語のマッピング
        this.searchedKeywords = new Set(); // 検索済みキーワード（重複防止）
        
        // OpenAI API設定（.env または config.js から取得）
        this.config = window.LIVE_REFERENCE_CONFIG || {};
        this.OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
        this.settings = this.config.SETTINGS || {};
        
        // DOM要素を最初に初期化
        this.initializeElements();
        
        // DOM要素が初期化された後でAPIキーを初期化
        this.initializeAPIKey();
        
        this.bindEvents();
        this.updateTimestamp();
        this.loadSearchHistory();
        
        // Initialize advanced voice features
        this.initializeFnKeyMode();
    }
    
    initializeElements() {
        this.inputText = document.getElementById('inputText');
        this.extractBtn = document.getElementById('extractBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.voiceBtn = document.getElementById('voiceBtn'); // 音声ボタン（存在しない場合はnull）
        this.fnKeyBtn = document.getElementById('fnKeyBtn'); // Fn-Key mode toggle button
        this.historyBtn = document.getElementById('historyBtn'); // 検索履歴ボタン
        this.keywordTags = document.getElementById('keywordTags');
        this.searchStatus = document.getElementById('searchStatus');
        this.searchResults = document.getElementById('searchResults');
        this.lastUpdate = document.getElementById('lastUpdate');
        this.searchCountEl = document.getElementById('searchCount');
        
        // モーダル要素
        this.historyModal = document.getElementById('historyModal');
        this.closeHistory = document.getElementById('closeHistory');
        this.historyList = document.getElementById('historyList');
        
        // 音声認識の初期化（voiceBtnが存在する場合のみ）
        if (this.voiceBtn) {
            this.initializeVoiceRecognition();
        } else {
            console.log('[INFO] 音声ボタンが見つかりません - 音声機能は無効化されました');
        }
    }
    
    bindEvents() {
        // リアルタイム処理（入力時）
        this.inputText.addEventListener('input', () => {
            // 即座に視覚フィードバック
            this.showTypingFeedback();
            
            // リアルタイム検索が有効な場合のみ自動実行
            if (this.settings.ENABLE_REALTIME_SEARCH !== false) {
                clearTimeout(this.inputTimeout);
                this.inputTimeout = setTimeout(() => {
                    const text = this.inputText.value.trim();
                    if (text.length >= 15) { // 15文字以上でリアルタイム検索
                        this.extractKeywordsEnhanced();
                    }
                }, this.settings.DEBOUNCE_TIME || 1000);
            }
        });
        
        // ボタンイベント
        this.extractBtn.addEventListener('click', () => {
            this.extractKeywordsEnhanced();
        });
        
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });
        
        // 音声入力ボタンイベント（ボタンが存在する場合のみ）
        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => {
                this.toggleVoiceRecognition();
            });
        }
        
        // 検索履歴ボタンイベント
        if (this.historyBtn) {
            this.historyBtn.addEventListener('click', () => {
                this.showSearchHistory();
            });
        }
        
        // Fn-Key Mode toggle button event
        if (this.fnKeyBtn) {
            this.fnKeyBtn.addEventListener('click', () => {
                this.toggleFnKeyMode();
                this.updateFnKeyButtonState();
            });
        }
        
        // モーダル閉じるボタン
        if (this.closeHistory) {
            this.closeHistory.addEventListener('click', () => {
                this.hideSearchHistory();
            });
        }
        
        // モーダル背景クリックで閉じる
        if (this.historyModal) {
            this.historyModal.addEventListener('click', (e) => {
                if (e.target === this.historyModal) {
                    this.hideSearchHistory();
                }
            });
        }
        
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
        // 設定の優先順位: 1. .env → 2. config.js
        
        // まず.envファイルから取得を試行
        const envKey = window.EnvLoader?.OPENAI_API_KEY;
        if (envKey && envKey !== '' && envKey !== 'your_openai_api_key_here') {
            this.OPENAI_API_KEY = envKey;
            this.OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
            console.log('[SUCCESS] OpenAI API key loaded from .env file');
            if (this.searchStatus) {
                this.updateSearchStatus('System ready - AI features enabled (.env)');
            }
            return;
        }
        
        // .envが利用できない場合はconfig.jsから取得
        const config = window.LIVE_REFERENCE_CONFIG;
        if (config) {
            this.OPENAI_API_KEY = config.OPENAI_API_KEY;
            this.OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
            this.settings = { ...this.settings, ...config.SETTINGS };
            
            // APIキーの状態を確認して表示
            const isValidKey = this.OPENAI_API_KEY && 
                              this.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY' && 
                              this.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE' &&
                              this.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                              this.OPENAI_API_KEY.startsWith('sk-');
            
            if (isValidKey) {
                console.log('[SUCCESS] OpenAI API key loaded from config.js');
                if (this.searchStatus) {
                    this.updateSearchStatus('System ready - AI features enabled');
                }
            } else {
                console.warn('[WARNING] OpenAI API key not configured - Wikipedia search only');
                console.log('[INFO] Configure API key in .env or config.js to enable AI features');
                if (this.searchStatus) {
                    this.updateSearchStatus('System ready - Wikipedia search mode');
                }
            }
        } else {
            console.error('[ERROR] Configuration file config.js not found');
            if (this.searchStatus) {
                this.updateSearchStatus('Configuration error - check config.js');
            }
        }
    }

    // タイピング中の視覚フィードバック
    showTypingFeedback() {
        const text = this.inputText.value.trim();
        if (text.length > 10) {
            this.updateSearchStatus('Typing... (AI keyword analysis ready)');
        } else if (text.length > 0) {
            this.updateSearchStatus('Typing...');
        } else {
            this.updateSearchStatus('Enter keywords to begin searching');
        }
    }
    
    // 強化されたキーワード抽出（AIベース）
    async extractKeywordsEnhanced() {
        const text = this.inputText.value.trim();
        console.log('[SEARCH] Starting keyword extraction:', text);
        
        if (text.length < 10) {
            this.updateSearchStatus('Please enter longer text (10+ characters)');
            return;
        }
        
        try {
            this.updateSearchStatus('Extracting keywords...');
            
            let keywords = [];
            
            // OpenAI APIキーの有効性チェック
            const isValidAPIKey = this.OPENAI_API_KEY && 
                                 this.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY' && 
                                 this.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE' &&
                                 this.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                                 this.OPENAI_API_KEY.startsWith('sk-');
            
            console.log('[API] OpenAI API key available:', isValidAPIKey);
            
            // AI抽出を優先（有効なAPIキーがある場合のみ）
            if (isValidAPIKey) {
                console.log('[AI] AIキーワード抽出を試行');
                try {
                    keywords = await this.extractKeywordsWithAI(text);
                } catch (apiError) {
                    console.warn('[FALLBACK] AI抽出失敗、統計的抽出にフォールバック:', apiError.message);
                    keywords = [];
                }
            } else {
                console.log('[WARNING] OpenAI APIキー未設定、統計的抽出のみ使用');
            }
            
            // AI抽出が失敗した場合やキーワードが少ない場合は統計的抽出を併用
            if (keywords.length < 3) {
                console.log('[STATS] 統計的キーワード抽出を実行');
                const statisticalKeywords = this.performKeywordExtraction(text);
                keywords = [...keywords, ...statisticalKeywords].slice(0, 5);
            }
            
            // 重複除去と無効キーワードの除外
            keywords = [...new Set(keywords)]
                .filter(keyword => this.isReasonableKeyword(keyword))
                .slice(0, 5);
            
            console.log('[RESULT] 最終キーワード結果:', keywords);
            
            if (keywords.length === 0) {
                this.updateSearchStatus('キーワードを抽出できませんでした。より具体的なテキストを入力してください。');
                return;
            }
            
            // キーワードを保存
            this.keywords.clear();
            keywords.forEach(keyword => this.keywords.add(keyword));
            
            // キーワードをカテゴリ分類（APIキーがある場合のみ）
            if (isValidAPIKey) {
                await this.categorizeKeywords(keywords, text);
            }
            
            // キーワードの表示
            this.displayKeywordsEnhanced(keywords);
            
            // キーワードをハイライト
            this.highlightKeywordsInInput(keywords);
            
            // 検索履歴に保存
            this.saveToHistory(text, keywords);
            
            // 自動検索を実行
            this.updateSearchStatus(`Extracted ${keywords.length} keywords`);
            this.updateTimestamp();
            
            // Wikipedia検索を実行（OpenAI無効時はWikipediaのみ）
            if (isValidAPIKey) {
                await this.searchWithOpenAI(keywords, text);
            } else {
                await this.searchWithWikipediaOnly(keywords);
            }
            
        } catch (error) {
            console.error('[ERROR] Keyword extraction error:', error);
            this.updateSearchStatus('Error occurred during keyword extraction');
        }
    }
    
    // 妥当なキーワードかどうかを判定（追加チェック）
    isReasonableKeyword(keyword) {
        // スコア表示を除去
        const cleanKeyword = keyword.replace(/\s*\([^)]+\)$/, '').trim();
        
        // HTTPメソッドや一般的なエラー用語を除外
        const invalidTerms = [
            'GET', 'POST', 'PUT', 'DELETE', 'HTTP', 'HTTPS',
            'load', 'file', 'not', 'found', 'error', 'undefined',
            'null', 'true', 'false', 'console', 'log', 'warn'
        ];
        
        if (invalidTerms.includes(cleanKeyword.toUpperCase())) {
            console.warn(`[WARNING] 無効なキーワードを除外: "${cleanKeyword}"`);
            return false;
        }
        
        // 最小条件チェック
        return cleanKeyword.length >= 2 && cleanKeyword.length <= 30;
    }
    
    // Wikipedia専用検索（OpenAI無効時）
    async searchWithWikipediaOnly(keywords) {
        this.updateSearchStatus('Searching Wikipedia...');
        this.searchResults.innerHTML = '';
        
        try {
            const promises = keywords.map(keyword => this.searchWikipedia(keyword));
            const results = await Promise.allSettled(promises);
            
            results.forEach((result, index) => {
                const keyword = keywords[index];
                if (result.status === 'fulfilled' && result.value) {
                    this.createResultItem(result.value, keyword);
                } else {
                    this.createErrorItem(keyword);
                }
            });
            
            this.markKeywordsAsSearched();
            this.searchCount++;
            this.updateSearchCount();
            this.updateSearchStatus(`Wikipedia search completed: ${keywords.length} keywords`);
            
        } catch (error) {
            console.error('Wikipedia Search error:', error);
            this.updateSearchStatus('Wikipedia search error occurred');
        }
    }
    
    // AIを使ったキーワード抽出
    async extractKeywordsWithAI(text) {
        if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            return [];
        }
        
        // 改良されたプロンプト（簡潔で的確な抽出）
        const prompt = `以下のテキストから、検索に最適なキーワードを抽出してください。

重要な基準：
- 固有名詞（製品名、会社名、技術名など）
- 専門用語・技術用語
- 文章の核心となる概念
- 一般的すぎる語は避ける

テキスト: "${text}"

最重要なキーワードを5個以内で、1行に1つずつシンプルに出力してください：`;

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
                            content: 'あなたは専門的なキーワード抽出エキスパートです。文脈を理解し、検索価値の高いキーワードを精密に抽出してください。固有名詞、専門用語、複合語を特に重視してください。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.2
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            // シンプルな解析（1行1キーワード）
            const keywords = content.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => line.replace(/^[-*•\d\.]\s*/, '')) // 箇条書き記号を除去
                .filter(keyword => keyword.length > 1 && keyword.length < 20)
                .filter(keyword => !keyword.includes('：') && !keyword.includes('、'))
                .slice(0, 5);
            
            return keywords;

        } catch (error) {
            console.error('AI keyword extraction error:', error);
            return [];
        }
    }
    
    // 新しい統計的キーワード抽出（辞書不要）
    performKeywordExtraction(text) {
        console.log('[SEARCH] 統計的キーワード抽出開始:', text);
        
        // 1. 候補語の抽出（パターンベース）
        const candidates = this.extractCandidateTerms(text);
        console.log('[CANDIDATES] 候補語:', candidates);
        
        // 2. 統計的スコアリング
        const scoredCandidates = this.calculateStatisticalScores(candidates, text);
        console.log('[SCORES] スコア付き候補:', scoredCandidates);
        
        // 3. フィルタリングと最終選択（厳格版）
        const result = scoredCandidates
            .filter(item => this.isValidKeyword(item.keyword, text))
            .filter(item => item.score >= 2.0) // 最低スコア閾値
            .slice(0, 5) // キーワード数を5個に制限
            .map(item => this.settings.SHOW_KEYWORD_SCORES 
                ? `${item.keyword} (${item.score.toFixed(1)})` 
                : item.keyword);
        
        console.log('[FINAL] 最終キーワード:', result);
        return result;
    }
    
    // 候補語の抽出（改良版：より厳格なフィルタリング）
    extractCandidateTerms(text) {
        const candidates = new Set();
        
        // プログラミング・システム用語を除外
        const excludeTerms = new Set([
            'GET', 'POST', 'PUT', 'DELETE', 'HTTP', 'HTTPS', 'API', 'URL',
            'load', 'file', 'not', 'found', 'error', 'undefined', 'null',
            'true', 'false', 'console', 'log', 'warn', 'debug', 'info',
            'script', 'js', 'css', 'html', 'json', 'xml', 'config',
            'localhost', 'server', 'client', 'request', 'response'
        ]);
        
        // 1. 明確な固有名詞・専門用語（優先度高）
        
        // カタカナ語（3文字以上、意味のある語のみ）
        const katakana = text.match(/[ァ-ヴー]{3,}/g) || [];
        katakana.forEach(term => {
            if (this.isMeaningfulTerm(term) && 
                this.exactExistsInText(term, text) && 
                !excludeTerms.has(term.toUpperCase())) {
                candidates.add(term);
            }
        });
        
        // 英単語（3文字以上、略語は2文字以上）- システム用語を除外
        const english = text.match(/\b[A-Za-z]{2,}\b/g) || [];
        english.forEach(term => {
            if ((term.length >= 3) || (term.length >= 2 && /^[A-Z]+$/.test(term))) {
                if (this.exactExistsInText(term, text) && 
                    !excludeTerms.has(term.toUpperCase()) &&
                    this.isRealEnglishWord(term)) {
                    candidates.add(term);
                }
            }
        });
        
        // 漢字のみの語（2文字以上、完全な語のみ）
        const kanjiOnly = text.match(/[一-龯]{2,}/g) || [];
        kanjiOnly.forEach(term => {
            if (term.length >= 2 && term.length <= 6 && 
                this.exactExistsInText(term, text) &&
                this.isMeaningfulJapaneseWord(term)) {
                candidates.add(term);
            }
        });
        
        // 2. 特定パターンの専門用語（システム用語以外）
        const specialTerms = text.match(/[A-Za-z]+[システム|サービス|プラットフォーム|ツール|アプリ|技術]/g) || [];
        specialTerms.forEach(term => {
            if (this.exactExistsInText(term, text) && 
                !excludeTerms.has(term.split(/[システム|サービス|プラットフォーム|ツール|アプリ|技術]/)[0].toUpperCase())) {
                candidates.add(term);
            }
        });
        
        const filteredCandidates = Array.from(candidates).filter(term => 
            this.isValidCandidate(term, text)
        );
        
        console.log(`[EXTRACT] 候補語抽出結果: ${filteredCandidates.length}個の候補を抽出`);
        return filteredCandidates;
    }
    
    // テキスト内に正確に存在するかチェック（新しいヘルパー関数）
    exactExistsInText(term, text) {
        // 大文字小文字を区別しない完全一致チェック
        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase();
        const exists = lowerText.includes(lowerTerm);
        
        if (!exists) {
            console.warn(`[WARNING] 候補語 "${term}" はテキスト内に存在しないため除外`);
        }
        
        return exists;
    }
    
    // 意味のある語かどうかを判定（厳格版）
    isMeaningfulTerm(term) {
        // 一般的すぎる語を除外
        const meaninglessPatterns = [
            /^(する|した|です|ます|から|まで|について|による|として|では|なる|ある|いる|もの|こと|ため|よう)$/,
            /^(の|が|を|に|で|は|も|と|や|か|な|だ|た|て|り|ら|れ|ろ)/, // 助詞・語尾
            /^[ぁ-ん]{1,2}$/, // 短いひらがなのみ
        ];
        
        return !meaninglessPatterns.some(pattern => pattern.test(term));
    }
    
    // 候補語の妥当性チェック（厳格版）
    isValidCandidate(candidate, text) {
        // 長さチェック
        if (candidate.length < 2 || candidate.length > 15) return false;
        
        // 単一文字種のチェック
        if (/^[ぁ-ん]+$/.test(candidate) && candidate.length < 4) return false;
        
        // 助詞・接続詞で始まる/終わる語を除外
        if (/^(の|が|を|に|で|は|も|と|や|から|まで|について|による|として|では)/.test(candidate)) return false;
        if (/(の|が|を|に|で|は|も|と|や|から|まで|について|による|として|では)$/.test(candidate)) return false;
        
        // 数字のみ、記号のみは除外
        if (/^\d+$/.test(candidate) || /^[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/.test(candidate)) return false;
        
        // 文の一部分すぎる語を除外（助詞を含む）
        if (/[のがをにではもとや]/.test(candidate) && candidate.length > 5) return false;
        
        return true;
    }
    
    // 改良された統計的スコアリング（意味のある語を優先）
    calculateStatisticalScores(candidates, text) {
        const textLength = text.length;
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim().length > 0);
        
        const scoredCandidates = candidates.map(candidate => {
            // まず、テキスト内に実際に存在するかチェック
            if (!this.exactExistsInText(candidate, text)) {
                return { keyword: candidate, score: 0 }; // 存在しない場合はスコア0
            }
            
            let score = 0;
            
            // 基本スコア：語の特徴度
            score += this.calculateIntrinsicScore(candidate);
            
            // 頻度スコア（少ない出現回数を優遇）
            let occurrences = 0;
            try {
                const escapedCandidate = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                occurrences = (text.match(new RegExp(escapedCandidate, 'gi')) || []).length;
            } catch (regexError) {
                console.warn(`[WARNING] 正規表現エラー for "${candidate}":`, regexError);
                // フォールバック: 単純な文字列検索
                const lowerText = text.toLowerCase();
                const lowerCandidate = candidate.toLowerCase();
                let count = 0;
                let pos = 0;
                while ((pos = lowerText.indexOf(lowerCandidate, pos)) !== -1) {
                    count++;
                    pos += lowerCandidate.length;
                }
                occurrences = count;
            }
            score += occurrences === 1 ? 2 : occurrences === 2 ? 1 : 0.5;
            
            // 位置スコア（前半に出現）
            const firstPosition = text.indexOf(candidate);
            const positionRatio = firstPosition / textLength;
            score += positionRatio <= 0.3 ? 1 : 0.5;
            
            // 独立性スコア（完全な語として存在）
            const isIndependent = this.isIndependentWord(candidate, text);
            if (isIndependent) score += 2;
            
            return { keyword: candidate, score };
        }).filter(item => item.score > 0); // スコア0（存在しない語）を除外
        
        const sortedCandidates = scoredCandidates.sort((a, b) => b.score - a.score);
        console.log(`[SCORING] スコアリング結果: ${sortedCandidates.length}個の有効候補`);
        
        return sortedCandidates;
    }
    
    // 語の内在的な重要度を計算
    calculateIntrinsicScore(word) {
        let score = 0;
        
        // 英語の略語・専門用語
        if (/^[A-Z]{2,}$/.test(word)) score += 3;
        
        // カタカナ語（外来語・専門用語）
        if (/^[ァ-ヴー]+$/.test(word) && word.length >= 3) score += 2;
        
        // 漢字のみの専門用語
        if (/^[一-龯]+$/.test(word) && word.length >= 2) score += 1.5;
        
        // 長さボーナス（適度な長さを優遇）
        if (word.length >= 3 && word.length <= 8) score += 1;
        
        // 特定の専門用語パターン
        if (word.includes('システム') || word.includes('サービス') || word.includes('技術')) score += 1;
        
        return score;
    }
    
    // 独立した語かどうかを判定
    isIndependentWord(word, text) {
        try {
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(?<![ぁ-んァ-ヴー一-龯A-Za-z])${escapedWord}(?![ぁ-んァ-ヴー一-龯A-Za-z])`, 'g');
            return regex.test(text);
        } catch (regexError) {
            console.warn(`[WARNING] 独立性チェックの正規表現エラー for "${word}":`, regexError);
            // フォールバック: 単純な包含チェック
            return text.toLowerCase().includes(word.toLowerCase());
        }
    }
    
    // キーワードの妥当性チェック（辞書不要）
    isValidKeyword(keyword, text) {
        // 最小長チェック
        if (keyword.length < 2) return false;
        
        // 最大長チェック
        if (keyword.length > 30) return false;
        
        // 数字のみは除外
        if (/^\d+$/.test(keyword)) return false;
        
        // 記号のみは除外
        if (/^[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/.test(keyword)) return false;
        
        // 単一のひらがな・カタカナは除外
        if (/^[ぁ-んァ-ヴー]$/.test(keyword)) return false;
        
        // よくある語尾のみは除外
        if (/^(する|です|ます|だ|である|でした|ました)$/.test(keyword)) return false;
        
        // 一般的すぎる語は除外
        const tooCommon = [
            'こと', 'もの', 'ため', 'とき', 'ところ', 'ように', 'など',
            'that', 'this', 'with', 'from', 'they', 'have', 'will'
        ];
        if (tooCommon.includes(keyword.toLowerCase())) return false;
        
        // 【重要】実際のテキスト内に完全一致で存在するかチェック（大文字小文字区別なし）
        const keywordExists = text.toLowerCase().includes(keyword.toLowerCase());
        if (!keywordExists) {
            console.warn(`[ERROR] キーワード "${keyword}" はテキスト内に存在しません`);
            return false;
        }
        
        return true;
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
                        <button class="keyword-action-btn related-btn" title="関連語検索">関連</button>
                        <button class="keyword-action-btn single-search-btn" title="単独検索">検索</button>
                    </span>
                `;
                
                // イベントリスナー
                const singleSearchBtn = tag.querySelector('.single-search-btn');
                const relatedBtn = tag.querySelector('.related-btn');
                
                if (singleSearchBtn) {
                    singleSearchBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.searchSingleKeyword(keyword);
                    });
                }
                
                if (relatedBtn) {
                    relatedBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.searchRelatedTerms(keyword);
                    });
                }
                
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
            '技術': '[技術]',
            '科学': '[科学]',
            'ビジネス': '[ビジネス]',
            '学術': '[学術]',
            'エンターテイメント': '[エンターテイメント]',
            'その他': '[その他]'
        };
        return icons[category] || '[その他]';
    }
    
    // 関連語検索
    async searchRelatedTerms(keyword) {
        this.updateSearchStatus(`"${keyword}" の関連語を検索中...`);
        
        if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            this.updateSearchStatus('関連語検索にはAPIキーが必要です');
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
            this.updateSearchStatus(`"${keyword}" の関連語検索完了`);
            
        } catch (error) {
            console.error('Related terms search error:', error);
            this.updateSearchStatus(`"${keyword}" の関連語検索でエラーが発生しました`);
        }
    }
    
    // 関連語の表示
    displayRelatedTerms(originalKeyword, relatedTerms) {
        const relatedContainer = document.createElement('div');
        relatedContainer.className = 'related-terms-container';
        relatedContainer.innerHTML = `
            <div class="related-header">
                <span class="related-icon">[関連]</span>
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
        historyButton.innerHTML = `履歴 (${this.searchHistory.length})`;
        historyButton.addEventListener('click', () => {
            this.showSearchHistory();
        });
        
        this.keywordTags.appendChild(historyButton);
    }
    
    // 検索履歴の表示
    showSearchHistory() {
        if (!this.historyModal || !this.historyList) {
            console.warn('検索履歴モーダルが見つかりません');
            return;
        }
        
        // 履歴リストを更新
        this.historyList.innerHTML = this.searchHistory.map((item, index) => `
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
        `).join('');
        
        // 履歴アイテムクリックで復元
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const historyItem = this.searchHistory[index];
                this.inputText.value = historyItem.text;
                this.extractKeywordsEnhanced();
                this.hideSearchHistory();
            });
        });
        
        // モーダルを表示
        this.historyModal.style.display = 'flex';
    }
    
    // 検索履歴の非表示
    hideSearchHistory() {
        if (this.historyModal) {
            this.historyModal.style.display = 'none';
        }
    }
    
    // OpenAI APIを使ったリアルタイム検索
    async searchWithOpenAI(keywords, fullText) {
        this.updateSearchStatus('AI searching... (OpenAI Realtime API)');
        this.searchResults.innerHTML = '';
        
        try {
            // 各キーワードに対してOpenAI APIで検索風の回答を生成
            const promises = keywords.map(keyword => this.searchWithOpenAIKeyword(keyword, fullText));
            const results = await Promise.allSettled(promises);
            
            this.displayOpenAIResults(results, keywords);
            this.markKeywordsAsSearched();
            this.searchCount++;
            this.updateSearchCount();
            this.updateSearchStatus(`AI search completed: ${keywords.length} keywords`);
            
        } catch (error) {
            console.error('OpenAI Search error:', error);
            this.updateSearchStatus('AI search error occurred');
        }
    }
    
    // 単一キーワードでOpenAI検索
    async searchWithOpenAIKeyword(keyword, context = '') {
        // APIキーの有効性を厳密にチェック
        if (!this.OPENAI_API_KEY || 
            this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY' ||
            this.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE' ||
            this.OPENAI_API_KEY === 'your_openai_api_key_here' ||
            !this.OPENAI_API_KEY.startsWith('sk-')) {
            
            console.warn('OpenAI API Key not set, falling back to Wikipedia');
            return await this.searchWikipedia(keyword);
        }
        
        try {
            const prompt = `Provide concise and useful information about "${keyword}" including:

1. Basic explanation (about 100 words)
2. Main features and applications
3. Current trends or latest information

${context ? `\nContext: "${context}"` : ''}

Please respond concisely and clearly.`;

            const response = await fetch(this.OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: this.settings.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: this.settings.OPENAI_MAX_TOKENS || 300,
                    temperature: this.settings.OPENAI_TEMPERATURE || 0.2
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`OpenAI API error (${response.status}):`, errorText);
                
                if (response.status === 401) {
                    console.warn('[API] Invalid API key. Check .env file or config.js.');
                } else if (response.status === 429) {
                    console.warn('[RATE] API rate limit reached. Please wait and try again.');
                } else if (response.status === 403) {
                    console.warn('[ACCESS] API access denied. Check your account settings.');
                }
                
                // エラー時はWikipediaにフォールバック
                return await this.searchWikipedia(keyword);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || 'Could not retrieve information';
            
            return {
                title: `AI: ${keyword}`,
                extract: content,
                source: 'OpenAI',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`OpenAI search error for "${keyword}":`, error);
            // ネットワークエラー等の場合もWikipediaにフォールバック
            return await this.searchWikipedia(keyword);
        }
    }
    
    async searchSingleKeyword(keyword) {
        this.updateSearchStatus(`"${keyword}" をAI検索中...`);
        
        try {
            const result = await this.searchWithOpenAIKeyword(keyword, this.inputText.value);
            this.displaySingleOpenAIResult(result, keyword);
            this.updateSearchStatus(`"${keyword}" のAI検索完了`);
        } catch (error) {
            console.error('Single search error:', error);
            this.updateSearchStatus(`"${keyword}" の検索でエラーが発生しました`);
        }
    }
    
    displaySingleOpenAIResult(result, keyword) {
        // 新しい結果を上に追加（既存の結果は保持）
        this.createOpenAIResultItem(result, keyword);
        
        // 検索回数を増やす
        this.searchCount++;
        this.updateSearchCount();
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
        // 結果を逆順で追加（最新が上に来るように）
        results.reverse().forEach((result, index) => {
            const keyword = keywords[keywords.length - 1 - index];
            
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
        
        const title = data.title || `AI: ${keyword}`;
        const extract = data.extract || '情報が見つかりませんでした';
        const source = data.source || 'AI';
        
        // OpenAI結果の場合は改行を保持
        const formattedExtract = extract.replace(/\n/g, '<br>');
        
        // タイムスタンプを追加
        const timestamp = new Date().toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        item.innerHTML = `
            <div class="result-header">
                <div class="result-title-openai">
                    ${title}
                </div>
                <div class="result-meta">
                    <span class="result-source">[${source}]</span>
                    <span class="result-timestamp">${timestamp}</span>
                </div>
            </div>
            <div class="result-snippet openai-content">
                ${formattedExtract}
            </div>
            <div class="result-actions">
                <button class="search-more-btn" onclick="window.liveReferenceInfo.searchSingleKeyword('${keyword}')">
                    再検索
                </button>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${extract.replace(/`/g, '\\`')}\`)">
                    コピー
                </button>
            </div>
        `;
        
        // 最新の結果を上部に追加（フィード的表示）
        this.searchResults.insertBefore(item, this.searchResults.firstChild);
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
                ${title}
            </a>
            <div class="result-snippet">
                ${extract}
            </div>
            <a href="${url}" target="_blank" class="result-url">
                Wikipedia で詳細を見る
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
                ${keyword}
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
        this.lastUpdate.textContent = `Last update: ${timeString}`;
    }
    
    updateSearchCount() {
        this.searchCountEl.textContent = `Search count: ${this.searchCount}`;
    }
    
    // 入力テキスト内のキーワードをハイライト
    highlightKeywordsInInput(keywords) {
        const text = this.inputText.value;
        if (!text || keywords.length === 0) return;
        
        // 実際にテキスト内に存在するキーワードのみをフィルタリング
        const validKeywords = keywords.filter(keyword => {
            // スコア表示付きの場合はスコア部分を除去
            const cleanKeyword = keyword.replace(/\s*\([^)]+\)$/, '').trim();
            const exists = text.toLowerCase().includes(cleanKeyword.toLowerCase());
            if (!exists) {
                console.warn(`[WARNING] ハイライト対象外: "${cleanKeyword}" はテキスト内に存在しません`);
            }
            return exists;
        });
        
        if (validKeywords.length === 0) {
            console.warn('[WARNING] ハイライト可能なキーワードが見つかりませんでした');
            return;
        }
        
        // ハイライト表示用のオーバーレイを作成
        const inputRect = this.inputText.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.className = 'input-highlight-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: ${inputRect.top + window.scrollY}px;
            left: ${inputRect.left + window.scrollX}px;
            width: ${inputRect.width}px;
            height: ${inputRect.height}px;
            pointer-events: none;
            overflow: hidden;
            z-index: 10;
            padding: 1rem;
            font-family: inherit;
            font-size: 1rem;
            line-height: 1.6;
            white-space: pre-wrap;
            color: transparent;
        `;
        
        // テキストをキーワードでハイライト（正確なマッチングで）
        let highlightedText = text;
        validKeywords.forEach(keyword => {
            // スコア表示付きの場合はスコア部分を除去
            const cleanKeyword = keyword.replace(/\s*\([^)]+\)$/, '').trim();
            
            // 特殊文字をエスケープして正確なマッチングを行う
            try {
                const escapedKeyword = cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // 大文字小文字を区別しない正規表現でマッチング
                const regex = new RegExp(`(${escapedKeyword})`, 'gi');
                highlightedText = highlightedText.replace(regex, '<mark class="keyword-highlight">$1</mark>');
            } catch (regexError) {
                console.warn(`[WARNING] ハイライト用正規表現エラー for "${cleanKeyword}":`, regexError);
                // フォールバック: 単純な文字列置換（大文字小文字区別なし）
                const lowerText = highlightedText.toLowerCase();
                const lowerKeyword = cleanKeyword.toLowerCase();
                const index = lowerText.indexOf(lowerKeyword);
                if (index !== -1) {
                    const originalMatch = highlightedText.substring(index, index + cleanKeyword.length);
                    highlightedText = highlightedText.replace(originalMatch, `<mark class="keyword-highlight">${originalMatch}</mark>`);
                }
            }
        });
        
        overlay.innerHTML = highlightedText;
        
        // 既存のオーバーレイを削除
        const existingOverlay = document.querySelector('.input-highlight-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        // 新しいオーバーレイを追加
        document.body.appendChild(overlay);
        
        // テキストエリアのスクロールと同期
        this.inputText.addEventListener('scroll', () => {
            overlay.scrollTop = this.inputText.scrollTop;
            overlay.scrollLeft = this.inputText.scrollLeft;
        });
        
        // テキストエリアのリサイズ時に削除
        this.inputText.addEventListener('input', () => {
            if (overlay) overlay.remove();
        });
        
        console.log(`[HIGHLIGHT] ${validKeywords.length}個のキーワードをハイライトしました:`, validKeywords);
    }
    
    clearAll() {
        this.inputText.value = '';
        this.keywordTags.innerHTML = '';
        this.searchResults.innerHTML = '';
        this.keywords.clear();
        this.updateSearchStatus('Enter keywords to begin searching');
        this.updateTimestamp();
        
        // ハイライトオーバーレイを削除
        const overlay = document.querySelector('.input-highlight-overlay');
        if (overlay) overlay.remove();
    }
    
    // 実際の英単語かどうかをチェック（プログラミング用語を除外）
    isRealEnglishWord(word) {
        // プログラミング・システム関連の用語を除外
        const programmingTerms = [
            'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH',
            'HTTP', 'HTTPS', 'API', 'REST', 'JSON', 'XML', 'HTML', 'CSS', 'JS',
            'URL', 'URI', 'DOM', 'SQL', 'PHP', 'ASP', 'JSP',
            'load', 'file', 'error', 'debug', 'info', 'warn', 'log',
            'config', 'script', 'style', 'class', 'function', 'var', 'let', 'const'
        ];
        
        if (programmingTerms.includes(word.toUpperCase())) {
            return false;
        }
        
        // 英語の一般的な文字パターンをチェック
        return /^[A-Za-z]+$/.test(word) && word.length >= 3;
    }
    
    // 意味のある日本語単語かどうかをチェック
    isMeaningfulJapaneseWord(word) {
        // 一般的すぎる語や意味のない組み合わせを除外
        const meaninglessWords = [
            'する', 'した', 'なる', 'ある', 'いる', 'です', 'ます', 'だった',
            'こと', 'もの', 'ため', 'とき', 'ところ', 'など', 'まで'
        ];
        
        return !meaninglessWords.includes(word) && word.length >= 2;
    }
    
    // ローカル統計的キーワード抽出（リアルタイム用）
    extractKeywordsLocal(text, maxKeywords = 5) {
        if (!text || text.length < 8) {
            return [];
        }
        
        const keywords = new Set();
        
        try {
            // 1. カタカナ語（3文字以上）
            const katakanaPattern = /[ァ-ヴー]{3,}/g;
            const katakanaMatches = text.match(katakanaPattern) || [];
            katakanaMatches.forEach(word => {
                if (word.length >= 3 && word.length <= 15) {
                    keywords.add(word);
                }
            });
            
            // 2. 英単語（3文字以上、プログラミング用語除外）
            const englishPattern = /[A-Za-z]{3,}/g;
            const englishMatches = text.match(englishPattern) || [];
            englishMatches.forEach(word => {
                if (this.isRealEnglishWord(word)) {
                    keywords.add(word);
                }
            });
            
            // 3. 漢字のみの語（2-6文字）
            const kanjiPattern = /[一-龯]{2,6}/g;
            const kanjiMatches = text.match(kanjiPattern) || [];
            kanjiMatches.forEach(word => {
                if (word.length >= 2 && word.length <= 6) {
                    keywords.add(word);
                }
            });
            
            // 4. ひらがな・漢字混合の専門用語（3-8文字）
            const mixedPattern = /[ひ-ゖ一-龯]{3,8}/g;
            const mixedMatches = text.match(mixedPattern) || [];
            mixedMatches.forEach(word => {
                if (this.isMeaningfulJapaneseWord(word) && word.length >= 3) {
                    keywords.add(word);
                }
            });
            
            // 5. 数字を含む専門用語（例：5G、AI、IoT）
            const techPattern = /[A-Za-z0-9]{2,}[A-Za-z][A-Za-z0-9]*/g;
            const techMatches = text.match(techPattern) || [];
            techMatches.forEach(word => {
                if (word.length >= 2 && word.length <= 10 && /[A-Za-z]/.test(word)) {
                    keywords.add(word);
                }
            });
            
        } catch (error) {
            console.warn('ローカルキーワード抽出エラー:', error);
        }
        
        // 重要度によるフィルタリングとソート
        const filteredKeywords = Array.from(keywords)
            .filter(keyword => keyword.length >= 2 && keyword.length <= 20)
            .sort((a, b) => {
                // 長い単語を優先
                if (a.length !== b.length) {
                    return b.length - a.length;
                }
                // アルファベット順
                return a.localeCompare(b);
            })
            .slice(0, maxKeywords);
        
        return filteredKeywords;
    }
    
    // 音声認識機能の初期化
    initializeVoiceRecognition() {
        this.isListening = false;
        this.recognition = null;
        this.audioContext = null;
        this.voiceEnhancement = new VoiceEnhancement();
        
        // Web Speech API対応チェック
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ このブラウザは音声認識に対応していません');
            this.voiceBtn.disabled = true;
            this.voiceBtn.title = 'このブラウザは音声認識に対応していません';
            return;
        }
        
        // 音声認識オブジェクトの作成
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // 高精度音声認識設定
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;          // 複数候補取得
        this.recognition.lang = 'ja-JP';
        
        // 専門用語グラマー設定
        this.setupVoiceGrammar();
        
        // 音声品質向上のためのオーディオ制約
        this.setupAudioConstraints();
        
        // イベントリスナーの設定
        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceBtn.classList.add('listening');
            this.voiceBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <span>Stop</span>
            `;
            this.updateSearchStatus('Voice recognition active...');
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.voiceBtn.classList.remove('listening');
            this.voiceBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <span>Voice Input</span>
            `;
            this.updateSearchStatus('Voice recognition stopped');
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                
                if (result.isFinal) {
                    // 高精度処理：複数候補から最適選択
                    const context = this.voiceEnhancement.getCurrentContext();
                    const alternatives = Array.from(result).map(alt => ({
                        transcript: alt.transcript,
                        confidence: alt.confidence
                    }));
                    
                    const enhancedText = this.voiceEnhancement.selectBestCandidate(alternatives, context);
                    finalTranscript += enhancedText;
                    
                    // 文脈更新
                    this.voiceEnhancement.updateContext(enhancedText);
                    
                    console.log('🎤 Enhanced final:', enhancedText, 'confidence:', result[0].confidence);
                } else {
                    // 中間結果は基本的な補正のみ
                    const basicText = this.voiceEnhancement.correctTerminology(result[0].transcript);
                    interimTranscript += basicText;
                }
            }
            
            // リアルタイム処理：中間結果でもキーワード抽出
            const combinedText = this.inputText.value + ' ' + interimTranscript + ' ' + finalTranscript;
            console.log('🎤 Voice recognition - interim:', interimTranscript, 'final:', finalTranscript);
            
            // 中間結果をリアルタイム表示（薄い表示）
            if (interimTranscript) {
                this.showInterimTranscript(interimTranscript);
                
                // 5文字以上の中間結果でリアルタイムキーワード抽出
                if (combinedText.length >= 8) {
                    console.log('⏱️ リアルタイム抽出をスケジュール:', combinedText.length, '文字');
                    clearTimeout(this.realtimeTimeout);
                    this.realtimeTimeout = setTimeout(() => {
                        this.extractKeywordsRealtime(combinedText);
                    }, 200); // 高速応答
                }
            }
            
            // 確定した音声をテキストエリアに追加
            if (finalTranscript) {
                const currentText = this.inputText.value;
                const newText = currentText + (currentText ? ' ' : '') + finalTranscript;
                this.inputText.value = newText;
                this.clearInterimTranscript();
                
                // 確定したテキストでフル抽出・検索
                clearTimeout(this.inputTimeout);
                this.inputTimeout = setTimeout(() => {
                    this.extractKeywordsEnhanced();
                }, 300);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('音声認識エラー:', event.error);
            this.showStatus(`音声認識エラー: ${event.error}`, 'error');
            this.isListening = false;
            this.voiceBtn.classList.remove('listening');
        };
    }
    
    // 音声認識の開始/停止
    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.showStatus('音声認識機能が利用できません', 'error');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('音声認識開始エラー:', error);
                this.showStatus('音声認識を開始できませんでした', 'error');
            }
        }
    }
    
    // 中間結果の表示（音声認識中）
    showInterimTranscript(interimText) {
        // 中間結果表示エリアを作成または取得
        let interimDisplay = document.getElementById('interimTranscript');
        if (!interimDisplay) {
            interimDisplay = document.createElement('div');
            interimDisplay.id = 'interimTranscript';
            interimDisplay.className = 'interim-transcript';
            this.inputText.parentNode.insertBefore(interimDisplay, this.inputText.nextSibling);
        }
        
        interimDisplay.textContent = '🎤 ' + interimText;
        interimDisplay.style.display = 'block';
    }
    
    // 中間結果表示をクリア
    clearInterimTranscript() {
        const interimDisplay = document.getElementById('interimTranscript');
        if (interimDisplay) {
            interimDisplay.style.display = 'none';
        }
    }
    
    // リアルタイムキーワード抽出（軽量版）
    async extractKeywordsRealtime(text) {
        console.log('🔍 リアルタイム抽出実行:', text.substring(0, 50) + '...');
        
        if (!text || text.length < 8) {
            console.log('❌ テキストが短すぎます:', text.length);
            return;
        }
        
        try {
            // 高速統計的抽出のみ使用（API不使用）
            const quickKeywords = this.extractKeywordsLocal(text, 5); // 最大5個
            console.log('✅ 抽出キーワード:', quickKeywords);
            
            if (quickKeywords.length > 0) {
                // リアルタイムキーワード表示
                this.displayRealtimeKeywords(quickKeywords);
                
                // 新しいキーワードがあれば即座に検索開始
                const newKeywords = quickKeywords.filter(kw => !this.searchedKeywords.has(kw));
                console.log('🆕 新しいキーワード:', newKeywords);
                
                if (newKeywords.length > 0) {
                    this.searchMultipleKeywordsStream(newKeywords);
                }
            } else {
                console.log('⚠️ キーワードが抽出されませんでした');
            }
        } catch (error) {
            console.error('❌ リアルタイム抽出エラー:', error);
        }
    }
    
    // リアルタイムキーワード表示
    displayRealtimeKeywords(keywords) {
        // リアルタイム表示エリアを作成または取得
        let realtimeContainer = document.getElementById('realtimeKeywords');
        if (!realtimeContainer) {
            realtimeContainer = document.createElement('div');
            realtimeContainer.id = 'realtimeKeywords';
            realtimeContainer.className = 'realtime-keywords';
            
            const title = document.createElement('h4');
            title.textContent = '🔴 リアルタイム検出';
            title.className = 'realtime-title';
            realtimeContainer.appendChild(title);
            
            const container = document.createElement('div');
            container.className = 'realtime-tags-container';
            realtimeContainer.appendChild(container);
            
            this.keywordTags.parentNode.insertBefore(realtimeContainer, this.keywordTags);
        }
        
        const container = realtimeContainer.querySelector('.realtime-tags-container');
        container.innerHTML = '';
        
        keywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag realtime-tag';
            tag.textContent = keyword;
            tag.addEventListener('click', () => this.searchKeyword(keyword));
            container.appendChild(tag);
        });
        
        realtimeContainer.style.display = 'block';
    }
    
    // ストリーミング検索（複数キーワード同時処理）
    async searchMultipleKeywordsStream(keywords) {
        if (!this.searchedKeywords) {
            this.searchedKeywords = new Set();
        }
        
        // 検索状態の初期化
        this.showStatus(`🔍 ${keywords.length}個のキーワードを検索中...`, 'loading');
        
        // 並列検索開始
        const searchPromises = keywords.map(keyword => 
            this.searchKeywordStream(keyword)
        );
        
        try {
            await Promise.allSettled(searchPromises);
            this.showStatus(`✅ ${keywords.length}個のキーワードの検索完了`, 'success');
        } catch (error) {
            console.error('ストリーミング検索エラー:', error);
            this.showStatus('検索中にエラーが発生しました', 'error');
        }
    }
    
    // 単一キーワードのストリーミング検索
    async searchKeywordStream(keyword) {
        if (this.searchedKeywords.has(keyword)) return;
        
        this.searchedKeywords.add(keyword);
        
        try {
            // 検索結果コンテナを準備
            const resultContainer = this.createStreamResultContainer(keyword);
            
            // Wikipedia検索（高速）
            const wikiPromise = this.searchWikipediaStream(keyword, resultContainer);
            
            // AI検索（APIキーがある場合のみ）
            const aiPromise = this.OPENAI_API_KEY && this.OPENAI_API_KEY !== 'your_openai_api_key_here' ? 
                this.searchAIStream(keyword, resultContainer) : 
                Promise.resolve();
            
            // 並列実行
            await Promise.allSettled([wikiPromise, aiPromise]);
            
        } catch (error) {
            console.error(`${keyword}の検索エラー:`, error);
        }
    }
    
    // ストリーミング検索結果コンテナ作成
    createStreamResultContainer(keyword) {
        const container = document.createElement('div');
        container.className = 'stream-result-container';
        container.id = `stream-${keyword.replace(/\s+/g, '-')}`;
        
        const header = document.createElement('div');
        header.className = 'stream-result-header';
        header.innerHTML = `
            <h3 class="stream-keyword">${keyword}</h3>
            <div class="stream-status">🔍 検索中...</div>
        `;
        
        const content = document.createElement('div');
        content.className = 'stream-result-content';
        
        container.appendChild(header);
        container.appendChild(content);
        
        // 検索結果エリアの先頭に追加（新しい結果が上に）
        this.searchResults.insertBefore(container, this.searchResults.firstChild);
        
        return container;
    }
    
    // Wikipediaストリーミング検索
    async searchWikipediaStream(keyword, container) {
        try {
            const wikiSection = document.createElement('div');
            wikiSection.className = 'stream-wiki-section';
            wikiSection.innerHTML = '<h4>📚 Wikipedia</h4><div class="stream-loading">読み込み中...</div>';
            container.querySelector('.stream-result-content').appendChild(wikiSection);
            
            const response = await fetch(`https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`);
            
            if (response.ok) {
                const data = await response.json();
                wikiSection.innerHTML = `
                    <h4>📚 Wikipedia</h4>
                    <div class="wiki-summary">
                        <p>${data.extract || '情報が見つかりませんでした'}</p>
                        ${data.content_urls ? `<a href="${data.content_urls.desktop.page}" target="_blank" class="wiki-link">詳しく見る →</a>` : ''}
                    </div>
                `;
            } else {
                wikiSection.innerHTML = '<h4>📚 Wikipedia</h4><p class="no-result">該当する記事が見つかりませんでした</p>';
            }
            
            this.updateStreamStatus(container, '✅ Wikipedia完了');
            
        } catch (error) {
            console.error('Wikipedia検索エラー:', error);
            const wikiSection = container.querySelector('.stream-wiki-section');
            if (wikiSection) {
                wikiSection.innerHTML = '<h4>📚 Wikipedia</h4><p class="error-result">検索エラーが発生しました</p>';
            }
        }
    }
    
    // AIストリーミング検索
    async searchAIStream(keyword, container) {
        try {
            const aiSection = document.createElement('div');
            aiSection.className = 'stream-ai-section';
            aiSection.innerHTML = '<h4>🤖 AI情報</h4><div class="stream-loading">AI分析中...</div>';
            container.querySelector('.stream-result-content').appendChild(aiSection);
            
            const response = await fetch(this.OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: this.settings.OPENAI_MODEL,
                    messages: [{
                        role: 'user',
                        content: `「${keyword}」について簡潔に説明してください（100文字以内）`
                    }],
                    max_tokens: 150,
                    temperature: 0.3
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content || 'AI分析結果を取得できませんでした';
                
                aiSection.innerHTML = `
                    <h4>🤖 AI情報</h4>
                    <div class="ai-summary">
                        <p>${content}</p>
                    </div>
                `;
            } else {
                aiSection.innerHTML = '<h4>🤖 AI情報</h4><p class="no-result">AI分析を実行できませんでした</p>';
            }
            
            this.updateStreamStatus(container, '✅ AI分析完了');
            
        } catch (error) {
            console.error('AI検索エラー:', error);
            const aiSection = container.querySelector('.stream-ai-section');
            if (aiSection) {
                aiSection.innerHTML = '<h4>🤖 AI情報</h4><p class="error-result">AI分析エラーが発生しました</p>';
            }
        }
    }
    
    // ストリーミング状態更新
    updateStreamStatus(container, status) {
        const statusEl = container.querySelector('.stream-status');
        if (statusEl) {
            statusEl.textContent = status;
        }
    }
    
    // 専門用語グラマー設定
    setupVoiceGrammar() {
        try {
            if ('webkitSpeechGrammarList' in window || 'SpeechGrammarList' in window) {
                const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
                const grammarList = new SpeechGrammarList();
                
                // JSGF (Java Speech Grammar Format) で専門用語を定義
                const grammar = `
                    #JSGF V1.0;
                    grammar technicalTerms;
                    public <term> = 
                        AI | 機械学習 | ディープラーニング | ニューラルネットワーク |
                        JavaScript | Python | React | API | データベース |
                        クラウド | AWS | Google Cloud | Azure |
                        プログラミング | 開発 | システム | アルゴリズム |
                        デジタルトランスフォーメーション | DX | IoT | ブロックチェーン;
                `;
                
                grammarList.addFromString(grammar, 1);
                this.recognition.grammars = grammarList;
                
                console.log('[VOICE] Technical terminology grammar configured');
            }
        } catch (error) {
            console.warn('[VOICE] Grammar setup skipped:', error.message);
        }
    }
    
    // 音声品質向上設定
    async setupAudioConstraints() {
        try {
            // 高品質音声制約
            const audioConstraints = {
                audio: {
                    echoCancellation: true,          // エコーキャンセレーション
                    noiseSuppression: true,          // ノイズ抑制
                    autoGainControl: true,           // 自動ゲイン調整
                    sampleRate: { ideal: 48000 },    // 高サンプリングレート
                    channelCount: { ideal: 1 },      // モノラル
                    volume: { ideal: 1.0 }           // 最大音量
                }
            };
            
            // マイクアクセス許可確認（設定確認用）
            const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
            
            // Audio Context で品質監視準備
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(stream);
            const analyser = this.audioContext.createAnalyser();
            
            analyser.fftSize = 256;
            source.connect(analyser);
            
            // 音声レベル監視
            this.startAudioLevelMonitoring(analyser);
            
            console.log('[VOICE] High-quality audio settings applied');
            
            // ストリームを停止（設定確認のみ）
            stream.getTracks().forEach(track => track.stop());
            
        } catch (error) {
            console.warn('[VOICE] Audio constraint setup skipped:', error.message);
        }
    }
    
    // 音声レベル監視
    startAudioLevelMonitoring(analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const checkLevel = () => {
            if (!this.isListening) return;
            
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            
            // 音声レベルが低すぎる場合の警告
            if (average < 10) {
                console.warn('[VOICE] Audio level too low. Please speak closer to the microphone.');
            }
            
            // 継続監視
            requestAnimationFrame(checkLevel);
        };
        
        if (this.isListening) {
            requestAnimationFrame(checkLevel);
        }
    }
    
    // Fn-Key Mode initialization
    initializeFnKeyMode() {
        try {
            // Initialize voice enhancement for better accuracy
            this.voiceEnhancement = new VoiceEnhancement();
            
            // Create FnKeyMode with search function binding
            this.fnKeyMode = new FnKeyMode(
                this.voiceEnhancement,
                (query) => this.performQuickSearch(query)
            );
            
            // Activate FnKeyMode by default
            this.fnKeyMode.activate();
            
            // Update button state
            this.updateFnKeyButtonState();
            
            console.log('[INIT] Fn-Key Mode initialized - Press Fn+Space (or Ctrl+Space) for quick voice search');
            
        } catch (error) {
            console.error('[INIT] Failed to initialize Fn-Key Mode:', error);
        }
    }
    
    // Quick search function for FnKeyMode
    async performQuickSearch(query) {
        try {
            console.log('[QUICK_SEARCH] Processing query:', query);
            
            // Clear current input and set the voice query
            if (this.inputText) {
                this.inputText.value = query;
                this.inputText.dispatchEvent(new Event('input'));
            }
            
            // Extract keywords and perform search
            await this.extractKeywordsEnhanced();
            
            // Scroll to results
            const resultsSection = document.getElementById('results');
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
        } catch (error) {
            console.error('[QUICK_SEARCH] Error:', error);
            throw error;
        }
    }
    
    // Toggle FnKeyMode on/off
    toggleFnKeyMode() {
        if (!this.fnKeyMode) return;
        
        if (this.fnKeyMode.getStatus().isActive) {
            this.fnKeyMode.deactivate();
            console.log('[TOGGLE] Fn-Key Mode deactivated');
        } else {
            this.fnKeyMode.activate();
            console.log('[TOGGLE] Fn-Key Mode activated');
        }
    }
    
    // Update Fn-Key button visual state
    updateFnKeyButtonState() {
        if (!this.fnKeyBtn || !this.fnKeyMode) return;
        
        const isActive = this.fnKeyMode.getStatus().isActive;
        
        if (isActive) {
            this.fnKeyBtn.classList.add('active');
            this.fnKeyBtn.title = 'Fn+Space (or Ctrl+Space) Quick Voice Search (Active)';
        } else {
            this.fnKeyBtn.classList.remove('active');
            this.fnKeyBtn.title = 'Fn+Space (or Ctrl+Space) Quick Voice Search (Disabled)';
        }
    }
    
    // Get FnKeyMode status for debugging
    getFnKeyModeStatus() {
        return this.fnKeyMode ? this.fnKeyMode.getStatus() : null;
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.liveReferenceInfo = new LiveReferenceInfo();
    
    // 初期メッセージ
    console.log('[INIT] Live Reference Info MVP-1 が起動しました');
    console.log('[USAGE] 使用方法:');
    console.log('     1. テキストエリアに文章を入力（10文字以上）');
    console.log('     2. 自動キーワード抽出（1秒後）');
    console.log('     3. Wikipedia/AI検索結果を表示');
    console.log('     4. Ctrl+Enterで手動抽出');
    
    // 設定状況の確認
    const config = window.LIVE_REFERENCE_CONFIG;
    const isValidKey = config?.OPENAI_API_KEY && 
                      config.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY' && 
                      config.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE' &&
                      config.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                      config.OPENAI_API_KEY.startsWith('sk-');
    
    if (!isValidKey) {
        console.log('');
        console.log('[CONFIG] AI機能を有効にするには:');
        console.log('     1. プロジェクトルートの .env ファイルでAPIキーを設定（推奨）');
        console.log('     2. または mvp-1/config.js ファイルを編集');
        console.log('     3. OPENAI_API_KEY に有効なAPIキーを設定');
        console.log('     4. ページをリロード');
        console.log('');
        console.log('[INFO] 現在はWikipedia検索のみ利用可能です');
    }
}); 