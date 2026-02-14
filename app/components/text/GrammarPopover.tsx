"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Token, LayerId, TokenAnalysis } from "@/app/lib/types";
import { buildGemUrl } from "@/app/lib/gem";

interface GrammarPopoverProps {
  token: Token;
  currentLayer: LayerId;
  analysis: TokenAnalysis | null;
  textTitle: string;
  sentenceText: string;
  onClose: () => void;
}

export function GrammarPopover({
  token,
  currentLayer,
  analysis,
  textTitle,
  sentenceText,
  onClose,
}: GrammarPopoverProps) {
  useEffect(() => {
    function handleClickOutside(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("[data-grammar-popover]")) return;
      onClose();
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [onClose]);

  const isScaffold = token.layer > currentLayer;
  const tag = token.grammarTag;

  return (
    <>
      {/* デスクトップ: ポップオーバー */}
      <div
        data-grammar-popover
        className="hidden sm:block absolute z-20 mt-1 left-0 right-0 max-w-xs mx-auto
                   bg-white rounded-lg shadow-lg border border-sumi/10 p-4
                   animate-popover-in"
      >
        <PopoverContent
          token={token}
          isScaffold={isScaffold}
          tag={tag}
          analysis={analysis}
          textTitle={textTitle}
          sentenceText={sentenceText}
          currentLayer={currentLayer}
          onClose={onClose}
        />
      </div>

      {/* モバイル: ボトムシート */}
      <div className="sm:hidden fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/20" onClick={onClose} />
        <div
          data-grammar-popover
          className="absolute bottom-0 left-0 right-0
                     bg-white rounded-t-2xl shadow-lg p-5 pb-8
                     animate-slide-up max-h-[70vh] overflow-y-auto"
        >
          <div className="w-10 h-1 bg-sumi/20 rounded-full mx-auto mb-4" />
          <PopoverContent
            token={token}
            isScaffold={isScaffold}
            tag={tag}
            analysis={analysis}
            textTitle={textTitle}
            sentenceText={sentenceText}
            currentLayer={currentLayer}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}

function PopoverContent({
  token,
  isScaffold,
  tag,
  analysis,
  textTitle,
  sentenceText,
  currentLayer,
  onClose,
}: {
  token: Token;
  isScaffold: boolean;
  tag: Token["grammarTag"];
  analysis: TokenAnalysis | null;
  textTitle: string;
  sentenceText: string;
  currentLayer: LayerId;
  onClose: () => void;
}) {
  const router = useRouter();
  const gemUrl = buildGemUrl({ textTitle, sentenceText, token, currentLayer });
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-lg font-bold">{token.text}</p>
        {tag.baseForm && tag.baseForm !== token.text && (
          <p className="text-sm text-scaffold">← {tag.baseForm}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-scaffold">品詞</span>
        <span>{tag.pos}</span>

        {tag.meaning && (
          <>
            <span className="text-scaffold">意味</span>
            <span>{tag.meaning}</span>
          </>
        )}

        {token.translation && (
          <>
            <span className="text-scaffold">訳</span>
            <span>{token.translation}</span>
          </>
        )}

        {!isScaffold && tag.conjugationType && (
          <>
            <span className="text-scaffold">活用型</span>
            <span>{tag.conjugationType}</span>
          </>
        )}

        {!isScaffold && tag.conjugationForm && (
          <>
            <span className="text-scaffold">活用形</span>
            <span>{tag.conjugationForm}</span>
          </>
        )}
      </div>

      {/* 判別の筋道（分析対象のみ） */}
      {!isScaffold && analysis && analysis.reasoning.length > 0 && (
        <div className="border-t border-sumi/10 pt-3 space-y-2">
          <p className="text-xs font-bold text-scaffold">判別の筋道</p>
          {analysis.reasoning.map((step, i) => (
            <div key={i} className="text-xs space-y-0.5">
              <p className="text-shu font-bold">Q: {step.question}</p>
              <p>A: {step.answer}</p>
              <p className="text-scaffold">{step.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {/* リファレンスリンク + 先生AI */}
      <div className="border-t border-sumi/10 pt-2 flex items-center justify-between">
        {token.grammarRefId ? (
          <button
            className="text-sm text-layer-1 hover:underline"
            onClick={() => {
              const href = `/reference/${token.grammarRefId}`;
              onClose();
              router.push(href);
            }}
          >
            詳しく見る →
          </button>
        ) : (
          <span />
        )}
        <button
          className="text-sm text-shu hover:text-shu/80 transition-colors"
          onClick={() => {
            window.open(gemUrl, "_blank", "noopener,noreferrer");
          }}
        >
          先生AIに聞く →
        </button>
      </div>
    </div>
  );
}
