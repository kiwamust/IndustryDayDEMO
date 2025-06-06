# Voice Recognition Enhancement & Background Modes Design 🎤

## 🎯 目標
- 音声認識精度の大幅改善（誤認識率50%削減）
- バックグラウンドアプリケーション化
- Willow AI風のグローバルホットキー対応
- 継続的会話支援モードの実装

## 🔧 音声認識高精度化

### 1. Web Speech API設定最適化
```javascript
// Enhanced Speech Recognition Configuration
this.recognition.continuous = true;
this.recognition.interimResults = true;
this.recognition.maxAlternatives = 3;        // 複数候補取得
this.recognition.lang = 'ja-JP';
this.recognition.grammars = grammarList;     // 専門用語辞書

// Audio constraints for better quality
const audioConstraints = {
    audio: {
        echoCancellation: true,      // エコーキャンセル
        noiseSuppression: true,      // ノイズ抑制
        autoGainControl: true,       // 自動ゲイン調整
        sampleRate: 48000,           // 高音質
        channelCount: 1              // モノラル
    }
};
```

### 2. 認識結果後処理・補正
```javascript
// Post-processing pipeline
class VoiceEnhancement {
    // 1. 信頼度フィルタリング
    filterByConfidence(results, threshold = 0.7) {
        return results.filter(r => r.confidence >= threshold);
    }
    
    // 2. 専門用語辞書マッチング
    correctTerminology(text) {
        const corrections = {
            'えーあい': 'AI',
            'きかいがくしゅう': '機械学習',
            'でぃーぷらーにんぐ': 'ディープラーニング'
        };
        // 音声→正確な用語変換
    }
    
    // 3. 文脈ベース補正
    contextualCorrection(text, previousContext) {
        // GPT-4を使った文脈理解・補正
    }
}
```

### 3. リアルタイム音声品質監視
```javascript
// Audio quality monitoring
class AudioQualityMonitor {
    analyzeAudioLevel(stream) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        
        // 音量レベル・ノイズ検出
        // 品質が低い場合はユーザーに通知
    }
}
```

## 🌐 バックグラウンドアプリケーション化

### 1. Service Worker実装
```javascript
// sw.js - Background processing
self.addEventListener('message', (event) => {
    if (event.data.action === 'startVoiceRecognition') {
        // バックグラウンドでの音声認識処理
    }
});

// Persistent background operation
self.addEventListener('activate', () => {
    // Keep service worker alive
    self.clients.claim();
});
```

### 2. グローバルホットキーシステム
```javascript
// Global hotkey detection (Fn key combination)
class GlobalHotkey {
    constructor() {
        this.isRecording = false;
        this.fnKeyPressed = false;
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Browser tab focus handling
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
    }
    
    handleKeyDown(event) {
        // Fn + Space for voice recording (Willow AI style)
        if (event.code === 'Fn' || event.key === 'Fn') {
            this.fnKeyPressed = true;
        }
        
        if (this.fnKeyPressed && event.code === 'Space') {
            event.preventDefault();
            this.startVoiceRecording();
        }
    }
    
    handleKeyUp(event) {
        if (event.code === 'Fn' || event.key === 'Fn') {
            this.fnKeyPressed = false;
            if (this.isRecording) {
                this.stopVoiceRecording();
            }
        }
    }
}
```

### 3. Progressive Web App (PWA) 対応
```json
// manifest.json
{
    "name": "Live Reference Info",
    "short_name": "LiveRef",
    "start_url": "/",
    "display": "standalone",
    "background_sync": ["voice-processing"],
    "permissions": ["microphone", "background-sync"],
    "scope": "/",
    "theme_color": "#000000"
}
```

## 🗣️ 動作モード設計

### Mode 1: Fn-Key Trigger Mode (Willow AI風)
```javascript
class FnKeyMode {
    // Press & Hold Fn+Space to record
    // Release to process & search
    // Quick, contextual responses
    
    activate() {
        this.hotkey.enable();
        this.showModeIndicator('fn-key-mode');
        this.enableQuickCapture();
    }
    
    async processQuickCapture(audioData) {
        // 1. High-accuracy transcription
        // 2. Immediate keyword extraction  
        // 3. Contextual search
        // 4. Display overlay results
    }
}
```

### Mode 2: Continuous Conversation Support Mode
```javascript
class ConversationMode {
    constructor() {
        this.conversationBuffer = [];
        this.contextWindow = 300; // seconds
        this.isActive = false;
    }
    
    activate() {
        this.isActive = true;
        this.startContinuousListening();
        this.enableSpeakerDetection();
        this.showConversationInterface();
    }
    
    async processContinuousAudio() {
        // 1. Voice Activity Detection (VAD)
        // 2. Speaker diarization
        // 3. Context-aware keyword extraction
        // 4. Real-time reference suggestions
        // 5. Conversation summary generation
    }
    
    // Advanced features
    detectSpeakerChange() {
        // 話者変更検出で文脈リセット
    }
    
    generateConversationSummary() {
        // 会話の要約とアクションアイテム抽出
    }
}
```

## 🎨 UX Enhancement

### 1. Floating Interface
```javascript
// Minimal floating widget for background operation
class FloatingWidget {
    create() {
        const widget = document.createElement('div');
        widget.className = 'floating-widget';
        widget.innerHTML = `
            <div class="mode-indicator"></div>
            <div class="voice-level-meter"></div>
            <div class="quick-results"></div>
        `;
        
        // Draggable, always on top
        this.makeDraggable(widget);
        document.body.appendChild(widget);
    }
}
```

### 2. Mode Switching UI
```css
/* Mode indicator styles */
.mode-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 20px;
    font-size: 0.8rem;
    z-index: 10000;
}

.mode-indicator.fn-key { border-left: 4px solid #00ff00; }
.mode-indicator.conversation { border-left: 4px solid #0099ff; }
```

### 3. Quick Results Overlay
```javascript
// Non-intrusive results display
class QuickOverlay {
    show(results) {
        const overlay = this.createOverlay();
        overlay.innerHTML = `
            <div class="quick-results">
                ${results.map(r => `
                    <div class="result-card">
                        <h4>${r.title}</h4>
                        <p>${r.summary}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => overlay.remove(), 5000);
    }
}
```

## 🔧 技術実装計画

### Phase 1: Enhanced Voice Recognition (1週間)
- [x] 音声品質設定最適化
- [ ] 認識結果後処理パイプライン
- [ ] 専門用語辞書・補正システム
- [ ] リアルタイム品質監視

### Phase 2: Background Operation (1週間) 
- [ ] Service Worker実装
- [ ] PWA対応
- [ ] グローバルホットキーシステム
- [ ] Floating widget UI

### Phase 3: Advanced Modes (1週間)
- [ ] Fn-Key Trigger Mode
- [ ] Continuous Conversation Mode
- [ ] Speaker detection
- [ ] Context management

### Phase 4: UX Polish (3日)
- [ ] Mode switching interface
- [ ] Quick results overlay
- [ ] Settings & preferences
- [ ] Performance optimization

## 📊 成功指標

### 音声認識精度
- **Before**: ~70-80% accuracy
- **Target**: >90% accuracy
- **Measurement**: Word Error Rate (WER)

### UX Metrics
- **Response time**: <500ms for Fn-key mode
- **Context retention**: 5-minute conversation memory
- **Battery impact**: <5% additional drain

### User Experience
- **Learning curve**: <5 minutes to master
- **Error recovery**: Automatic correction suggestions
- **Accessibility**: Full keyboard navigation support

---

**Implementation Priority**: 
1. 🔥 Voice accuracy enhancement
2. 🔥 Fn-key trigger mode  
3. 🔶 Continuous conversation mode
4. 🔵 Advanced features