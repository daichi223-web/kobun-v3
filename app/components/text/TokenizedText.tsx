"use client";

import { useState } from "react";
import type { Sentence, LayerId, TextAnalysis, ReadingAnnotation } from "@/app/lib/types";
import { TokenSpan } from "./TokenSpan";
import { GrammarPopover } from "./GrammarPopover";

interface TokenizedTextProps {
  sentence: Sentence;
  currentLayer: LayerId;
  analysis: TextAnalysis | null;
  textTitle: string;
  onTokenView: (tokenId: string) => void;
  readingAnnotation?: ReadingAnnotation | null;
}

export function TokenizedText({
  sentence,
  currentLayer,
  analysis,
  textTitle,
  onTokenView,
  readingAnnotation,
}: TokenizedTextProps) {
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);

  const activeToken = activeTokenId
    ? sentence.tokens.find((t) => t.id === activeTokenId) ?? null
    : null;

  const activeAnalysis = activeTokenId && analysis
    ? analysis.tokenAnalyses.find((a) => a.tokenId === activeTokenId) ?? null
    : null;

  const handleTokenClick = (tokenId: string) => {
    if (activeTokenId === tokenId) {
      setActiveTokenId(null);
    } else {
      setActiveTokenId(tokenId);
      onTokenView(tokenId);
    }
  };

  return (
    <div className="relative leading-[2.2] text-lg">
      {sentence.tokens.map((token) => (
        <TokenSpan
          key={token.id}
          token={token}
          currentLayer={currentLayer}
          isActive={activeTokenId === token.id}
          onClick={() => handleTokenClick(token.id)}
        />
      ))}

      {/* 読解レイヤーのアノテーション */}
      {currentLayer === 0 && readingAnnotation && (
        <div className="mt-2 rounded-lg bg-layer-0/5 border border-layer-0/20 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            {readingAnnotation.scene && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-layer-0/15 text-layer-0">
                {readingAnnotation.scene}
              </span>
            )}
            <span className="text-xs font-bold text-layer-0">
              主語: {readingAnnotation.subject}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-sumi/70">
            {readingAnnotation.note}
          </p>
        </div>
      )}

      {activeToken && currentLayer !== 0 && (
        <GrammarPopover
          token={activeToken}
          currentLayer={currentLayer}
          analysis={activeAnalysis}
          textTitle={textTitle}
          sentenceText={sentence.originalText}
          onClose={() => setActiveTokenId(null)}
        />
      )}
    </div>
  );
}
