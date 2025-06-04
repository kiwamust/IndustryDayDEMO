# シンプルキーワード抽出仕様 🔍

## 🎯 目標
10分で実装可能な、JavaScript による軽量キーワード抽出アルゴリズム

## 🔧 実装方式

### 1. 基本戦略
**「パターンマッチングベース」** - 複雑なNLP不要、正規表現中心

### 2. 抽出ルール

#### ✅ 抽出対象
- **カタカナ語**: AI、マシンラーニング、コンピュータ
- **英単語**: machine learning, artificial intelligence  
- **固有名詞パターン**: 〇〇システム、〇〇技術
- **専門用語**: 3文字以上のカタカナ語

#### ❌ 除外対象
- 一般的な助詞、動詞
- 短すぎる語（2文字以下）
- 数字のみ

### 3. JavaScript実装

```javascript
function extractKeywords(text) {
    const keywords = [];
    
    // 1. カタカナ語抽出（3文字以上）
    const katakana = text.match(/[ァ-ヴー]{3,}/g);
    if (katakana) keywords.push(...katakana);
    
    // 2. 英単語抽出（3文字以上）
    const english = text.match(/[a-zA-Z]{3,}/g);
    if (english) keywords.push(...english);
    
    // 3. 漢字熟語（専門用語っぽいもの）
    const kanji = text.match(/[一-龯]{2,4}[システム|技術|理論|方法]/g);
    if (kanji) keywords.push(...kanji);
    
    // 重複除去・優先度ソート
    return [...new Set(keywords)]
        .sort((a, b) => b.length - a.length) // 長い語を優先
        .slice(0, 5); // 上位5個まで
}
```

### 4. 優先度ルール
1. **長さ優先**: 長い語ほど高優先度
2. **種別優先**: カタカナ語 > 英語 > 漢字熟語
3. **最大件数**: 同時に5個まで検索

## 🚀 実装例

### 入力例
```
「今日はAIについて議論した。特に機械学習とディープラーニング技術の応用が興味深かった。」
```

### 抽出結果
```javascript
[
  "ディープラーニング",
  "機械学習", 
  "AI",
  "技術"
]
```

### 検索実行
各キーワードでWikipedia検索 → 結果統合表示

## ⚡ 時間効率化

### 使用しない技術
- 形態素解析ライブラリ
- 外部NLP API
- 複雑な機械学習

### 使用する技術
- JavaScript正規表現
- 配列操作メソッド
- シンプルなパターンマッチング

---

**実装時間**: 約2-3分  
**精度**: 70-80%（十分なデモレベル）  
**保守性**: 高い（ルール追加が容易） 