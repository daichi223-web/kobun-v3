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

const sectionBorders: Record<SectionKey, string> = {
  introduction: "border-shu",
  significance: "border-layer-2",
  background: "border-layer-3",
  author: "border-layer-4",
  reading: "border-kin",
};

export default function GuidePage() {
  const params = useParams();
  const textId = params.textId as string;

  const [guide, setGuide] = useState<GuideData | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("introduction");
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(["introduction"]));
  const [openPoints, setOpenPoints] = useState<Set<number>>(new Set());
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
    if (!openSections.has(key)) {
      setOpenSections((prev) => new Set(prev).add(key));
    }
    setTimeout(() => {
      sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const togglePoint = (index: number) => {
    setOpenPoints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (!guide) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-scaffold">読み込み中...</p>
      </div>
    );
  }

  const renderSectionContent = (key: SectionKey) => {
    const section = guide.sections[key];
    const isOpen = openSections.has(key);

    return (
      <section
        key={key}
        ref={(el) => { sectionRefs.current[key] = el; }}
        data-section={key}
        className="scroll-mt-28"
      >
        <button
          onClick={() => toggleSection(key)}
          className="w-full flex items-center gap-3 text-left py-3"
        >
          <div className={`w-1 h-6 rounded-full ${sectionBorders[key]} border-l-4`} />
          <h2 className="text-xl font-bold flex-1">{section.heading}</h2>
          <span className={`text-sm text-sumi/40 transition-transform ${isOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="pl-4 pb-4 space-y-4">
            {section.content?.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-sumi/80">
                {p}
              </p>
            ))}

            {key === "background" && section.glossary && section.glossary.length > 0 && (
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
                      {section.glossary.map((entry, i) => (
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

            {key === "reading" && section.points && (
              <div className="space-y-2">
                {section.points.map((point, i) => {
                  const isPointOpen = openPoints.has(i);
                  return (
                    <div
                      key={i}
                      className="bg-white/60 backdrop-blur rounded-xl shadow-sm border border-sumi/5 overflow-hidden"
                    >
                      <button
                        onClick={() => togglePoint(i)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sumi/[0.02] transition-colors"
                      >
                        <span className="shrink-0 w-7 h-7 rounded-full bg-kin text-white text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h3 className="font-bold text-sm flex-1">{point.title}</h3>
                        <span className={`text-[10px] text-sumi/40 transition-transform ${isPointOpen ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </button>
                      {isPointOpen && (
                        <div className="px-4 pb-3 pl-14">
                          <p className="text-sm leading-relaxed text-sumi/70">
                            {point.detail}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

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
      <main className="flex-1 px-4 py-6 space-y-2">
        {sectionKeys.map((key) => renderSectionContent(key))}
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
