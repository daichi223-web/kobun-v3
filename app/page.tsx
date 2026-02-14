"use client";

import Link from "next/link";
import { loadAllProgress } from "./lib/progress";
import { getGemBaseUrl } from "./lib/gem";
import { useState, useEffect } from "react";
import type { ReadingProgress } from "./lib/types";

const texts = [
  {
    id: "chigo-no-sorane",
    title: "ちごのそらね",
    source: "宇治拾遺物語",
    difficulty: 1,
    totalLayers: 5,
  },
  {
    id: "ebutsu-shi-ryoshu",
    title: "絵仏師良秀",
    source: "宇治拾遺物語",
    difficulty: 2,
    totalLayers: 5,
  },
];

const grammarCategories = [
  { label: "用言", href: "/reference?cat=yougen", layer: 1 },
  { label: "助動詞", href: "/reference?cat=jodoshi", layer: 2 },
  { label: "助詞", href: "/reference?cat=joshi", layer: 3 },
  { label: "敬語", href: "/reference?cat=keigo", layer: 4 },
];

const layerBgColors: Record<number, string> = {
  1: "bg-layer-1",
  2: "bg-layer-2",
  3: "bg-layer-3",
  4: "bg-layer-4",
  5: "bg-layer-5",
};

export default function Home() {
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({});

  useEffect(() => {
    setProgress(loadAllProgress());
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center p-6">
      {/* ヘッダー */}
      <div className="text-center space-y-2 mb-10 mt-8">
        <h1 className="text-3xl font-bold tracking-wide">古文読み</h1>
        <p className="text-sm opacity-60">
          テキストから始まり、テキストに戻る
        </p>
      </div>

      {/* テキスト一覧 */}
      <section className="w-full max-w-lg space-y-3 mb-10">
        <h2 className="text-sm font-bold text-scaffold uppercase tracking-wider">
          テキスト
        </h2>
        {texts.map((t) => {
          const p = progress[t.id];
          const completedLayers = p?.completedLayers?.length ?? 0;
          const currentLayer = p?.currentLayer ?? 1;
          const isStarted = !!p;
          const linkLayer = isStarted ? currentLayer : 1;

          return (
            <div
              key={t.id}
              className="bg-white/60 backdrop-blur rounded-xl p-5 shadow-sm border border-sumi/5"
            >
              <Link
                href={`/texts/${t.id}?layer=${linkLayer}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{t.title}</h3>
                    <p className="text-xs opacity-50">{t.source}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {/* Layer進捗ドット */}
                      <div className="flex gap-1">
                        {Array.from({ length: t.totalLayers }, (_, i) => i + 1).map(
                          (layer) => (
                            <span
                              key={layer}
                              className={`h-5 rounded-full text-[10px] font-bold flex items-center justify-center
                                ${layer === 5 ? "px-1.5" : "w-5"}
                                ${
                                  p?.completedLayers?.includes(layer as 1|2|3|4|5)
                                    ? `${layerBgColors[layer]} text-white`
                                    : currentLayer === layer
                                    ? `border-2 border-current ${layerBgColors[layer]?.replace("bg-", "text-")}`
                                    : "bg-sumi/5 text-sumi/20"
                                }`}
                            >
                              {layer === 5 ? "読" : layer}
                            </span>
                          )
                        )}
                      </div>
                      <span className="text-xs text-scaffold">
                        {isStarted
                          ? `Layer ${currentLayer} / ${t.totalLayers}`
                          : "未着手"}
                      </span>
                    </div>
                  </div>
                  <span className="text-sumi/30 text-xl">&rsaquo;</span>
                </div>
              </Link>
              <div className="mt-3 pt-3 border-t border-sumi/5">
                <Link
                  href={`/texts/${t.id}/guide`}
                  className="text-xs font-bold text-scaffold hover:text-sumi transition-colors"
                >
                  解説を読む →
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      {/* 文法リファレンス */}
      <section className="w-full max-w-lg space-y-3 mb-10">
        <h2 className="text-sm font-bold text-scaffold uppercase tracking-wider">
          文法リファレンス
        </h2>
        <div className="flex gap-2 flex-wrap">
          {grammarCategories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-80 ${layerBgColors[cat.layer]}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 先生AIリンク */}
      <section className="w-full max-w-lg">
        <a
          href={getGemBaseUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-3 rounded-lg bg-shu text-white font-bold hover:bg-shu/90 transition-colors"
        >
          先生AIに聞く
        </a>
      </section>
    </div>
  );
}
