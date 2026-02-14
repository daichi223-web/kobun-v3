/**
 * 古文読み v3 — 型定義
 */

/** 文法層の定義 */
export type LayerId = 0 | 1 | 2 | 3 | 4;
// 0=読解, 1=用言, 2=助動詞, 3=助詞, 4=敬語

export interface KobunText {
  id: string;
  title: string;
  source: string;
  genre: "説話" | "物語" | "日記" | "随筆" | "和歌";
  difficulty: 1 | 2 | 3;
  layers: LayerDefinition[];
  sentences: Sentence[];
}

export interface LayerDefinition {
  id: LayerId;
  label: string;
  description: string;
  prerequisite?: LayerId;
}

export interface Sentence {
  id: string;
  originalText: string;
  modernTranslation: string;
  tokens: Token[];
}

export interface Token {
  id: string;
  text: string;
  start: number;
  end: number;
  furigana?: string;
  layer: LayerId | 0;
  grammarTag: GrammarTag;
  translation?: string;
  grammarRefId?: string;
}

export interface GrammarTag {
  pos: string;
  conjugationType?: string;
  conjugationForm?: string;
  baseForm?: string;
  meaning?: string;
}

/** 分析データ（遅延読込） */
export interface TextAnalysis {
  textId: string;
  tokenAnalyses: TokenAnalysis[];
}

export interface TokenAnalysis {
  tokenId: string;
  reasoning: ReasoningStep[];
}

export interface ReasoningStep {
  question: string;
  answer: string;
  explanation: string;
}

/** 文法リファレンス */
export interface GrammarTopic {
  id: string;
  title: string;
  category: "用言" | "助動詞" | "助詞" | "敬語" | "識別";
  layer: LayerId;
  summary: string;
  sections: GrammarSection[];
  textExamples: TextExample[];
}

export interface GrammarSection {
  heading: string;
  content: string;
}

export interface TextExample {
  textId: string;
  sentenceId: string;
  tokenId: string;
  excerpt: string;
  explanation: string;
}

/** 読解アノテーション */
export interface ReadingGuide {
  textId: string;
  annotations: ReadingAnnotation[];
}

export interface ReadingAnnotation {
  sentenceId: string;
  subject: string;
  note: string;
  scene?: string;
}

/** 進捗データ（localStorage） */
export interface ReadingProgress {
  textId: string;
  completedLayers: LayerId[];
  currentLayer: LayerId;
  lastReadAt: string;
  tokensViewed: string[];
}
