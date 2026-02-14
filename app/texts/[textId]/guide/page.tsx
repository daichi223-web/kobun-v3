"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface GlossaryEntry {
  term: string;
  reading: string;
  meaning: string;
}

interface GuideSection {
  heading: string;
  content?: string[];
  points?: { title: string; detail: string }[];
  glossary?: GlossaryEntry[];
}

interface GuideData {
  textId: string;
  title: string;
  source: string;
  sections: {
    introduction: GuideSection;
    significance: GuideSection;
    background: GuideSection;
    author: GuideSection;
    reading: GuideSection;
  };
}

const sectionKeys = [
  "introduction",
  "significance",
  "background",
  "author",
  "reading",
] as const;

type SectionKey = (typeof sectionKeys)[number];

const sectionLabels: Record<SectionKey, string> = {
  introduction: "作品紹介",
  significance: "文学的意義",
  background: "背景",
  author: "作者",
  reading: "読み方",
};

export default function GuidePage() {
  const params = useParams();
  const textId = params.textId as string;

  const [guide, setGuide] = useState<GuideData | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("introduction");
  const sectionRefs = useRef<Record<SectionKey, HTMLElement | null>>({
    introduction: null,
    significance: null,
    background: null,
    author: null,
    reading: null,
  });

  useEffect(() => {
    import(`@/app/data/guides/${textId}.json`)
      .then((mod) => setGuide(mod.default))
      .catch(() => setGuide(null));
  }, [textId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-section") as SectionKey;
          if (id) setActiveSection(id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const refs = sectionRefs.current;
    sectionKeys.forEach((key) => {
      const el = refs[key];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [guide]);

  const scrollTo = (key: SectionKey) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!guide) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-scaffold">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col max-w-2xl mx-auto">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 bg-washi/95 backdrop-blur border-b border-sumi/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link
            href={`/texts/${textId}?layer=1`}
            className="text-sm text-scaffold hover:text-sumi transition-colors"
          >
            ← 本文へ
          </Link>
          <div className="text-center">
            <h1 className="text-base font-bold">{guide.title}</h1>
            <p className="text-xs text-scaffold">{guide.source} — 解説</p>
          </div>
          <Link
            href="/"
            className="text-sm text-scaffold hover:text-sumi transition-colors"
          >
            トップ
          </Link>
        </div>

        {/* セクションナビ */}
        <nav className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {sectionKeys.map((key) => (
            <button
              key={key}
              onClick={() => scrollTo(key)}
              className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-full transition-all
                ${
                  activeSection === key
                    ? "bg-sumi text-washi"
                    : "bg-sumi/5 text-sumi/60 hover:bg-sumi/10"
                }`}
            >
              {sectionLabels[key]}
            </button>
          ))}
        </nav>
      </header>

      {/* コンテンツ */}
      <main className="flex-1 px-4 py-6 space-y-10">
        {/* 作品紹介 */}
        <section
          ref={(el) => { sectionRefs.current.introduction = el; }}
          data-section="introduction"
          className="scroll-mt-28 space-y-4"
        >
          <h2 className="text-xl font-bold border-l-4 border-shu pl-3">
            {guide.sections.introduction.heading}
          </h2>
          {guide.sections.introduction.content?.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-sumi/80">
              {p}
            </p>
          ))}
        </section>

        {/* 文学的意義 */}
        <section
          ref={(el) => { sectionRefs.current.significance = el; }}
          data-section="significance"
          className="scroll-mt-28 space-y-4"
        >
          <h2 className="text-xl font-bold border-l-4 border-layer-2 pl-3">
            {guide.sections.significance.heading}
          </h2>
          {guide.sections.significance.content?.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-sumi/80">
              {p}
            </p>
          ))}
        </section>

        {/* 背景 */}
        <section
          ref={(el) => { sectionRefs.current.background = el; }}
          data-section="background"
          className="scroll-mt-28 space-y-4"
        >
          <h2 className="text-xl font-bold border-l-4 border-layer-3 pl-3">
            {guide.sections.background.heading}
          </h2>
          {guide.sections.background.content?.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-sumi/80">
              {p}
            </p>
          ))}
          {guide.sections.background.glossary &&
            guide.sections.background.glossary.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold mb-2">用語解説</h3>
                <div className="overflow-x-auto rounded-lg border border-sumi/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-sumi/5">
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">語</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">読み</th>
                        <th className="text-left px-3 py-2 font-bold">意味</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guide.sections.background.glossary.map((entry, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 1 ? "bg-sumi/[0.02]" : ""}
                        >
                          <td className="px-3 py-2 font-bold whitespace-nowrap">
                            {entry.term}
                          </td>
                          <td className="px-3 py-2 text-scaffold whitespace-nowrap">
                            {entry.reading}
                          </td>
                          <td className="px-3 py-2 text-sumi/70">
                            {entry.meaning}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </section>

        {/* 作者について */}
        <section
          ref={(el) => { sectionRefs.current.author = el; }}
          data-section="author"
          className="scroll-mt-28 space-y-4"
        >
          <h2 className="text-xl font-bold border-l-4 border-layer-4 pl-3">
            {guide.sections.author.heading}
          </h2>
          {guide.sections.author.content?.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-sumi/80">
              {p}
            </p>
          ))}
        </section>

        {/* 読み方のポイント */}
        <section
          ref={(el) => { sectionRefs.current.reading = el; }}
          data-section="reading"
          className="scroll-mt-28 space-y-5"
        >
          <h2 className="text-xl font-bold border-l-4 border-kin pl-3">
            {guide.sections.reading.heading}
          </h2>
          <div className="space-y-4">
            {guide.sections.reading.points?.map((point, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur rounded-xl p-4 shadow-sm border border-sumi/5"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-kin text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm">{point.title}</h3>
                    <p className="text-sm leading-relaxed text-sumi/70">
                      {point.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="sticky bottom-0 bg-washi/95 backdrop-blur border-t border-sumi/10 px-4 py-3">
        <div className="flex gap-3 justify-center">
          <Link
            href={`/texts/${textId}?layer=1`}
            className="px-4 py-2 text-sm rounded-lg bg-shu text-white hover:bg-shu/90 transition-colors font-bold"
          >
            本文を読む
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-sm rounded-lg border border-sumi/20 hover:bg-sumi/5 transition-colors"
          >
            テキスト一覧へ
          </Link>
        </div>
      </footer>
    </div>
  );
}
