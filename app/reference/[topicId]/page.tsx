"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { GrammarTopic } from "@/app/lib/types";
import { TextExampleCard } from "@/app/components/reference/TextExampleCard";
import { getGemBaseUrl, getNotebookLmUrl } from "@/app/lib/gem";
import Link from "next/link";

export default function ReferenceTopicPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<GrammarTopic | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    import(`@/app/data/grammar/${topicId}.json`)
      .then((mod) => setTopic(mod.default))
      .catch(() => setError(true));
  }, [topicId]);

  if (error) {
    return (
      <div className="min-h-dvh max-w-2xl mx-auto p-6">
        <Link href="/reference" className="text-sm text-scaffold hover:text-sumi">
          ← 文法リファレンス
        </Link>
        <div className="mt-10 text-center">
          <p className="text-lg font-bold">準備中</p>
          <p className="text-sm text-scaffold mt-2">
            このトピックのデータはまだ用意されていません。
          </p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-scaffold">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh max-w-2xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/reference"
          className="text-sm text-scaffold hover:text-sumi transition-colors"
        >
          ← 文法リファレンス
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
      <p className="text-sm text-scaffold mb-6">{topic.summary}</p>

      {/* セクション */}
      <div className="space-y-8">
        {topic.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-lg font-bold border-b border-sumi/10 pb-1 mb-3">
              {section.heading}
            </h2>
            <div className="prose-sm prose-table:text-sm">
              <MarkdownContent content={section.content} />
            </div>
          </section>
        ))}
      </div>

      {/* テキスト用例 */}
      {topic.textExamples.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold border-b border-sumi/10 pb-1 mb-3">
            テキスト用例
          </h2>
          <div className="space-y-3">
            {topic.textExamples.map((example, i) => (
              <TextExampleCard key={i} example={example} />
            ))}
          </div>
        </section>
      )}

      {/* 先生AIに聞く / NotebookLM */}
      <div className="mt-10 pt-6 border-t border-sumi/10 flex gap-3 justify-center">
        <a
          href={getGemBaseUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 text-sm rounded-lg bg-shu text-white hover:bg-shu/90 transition-colors"
        >
          先生AIに聞く
        </a>
        <a
          href={getNotebookLmUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 text-sm rounded-lg border border-sumi/20 hover:bg-sumi/5 transition-colors"
        >
          NotebookLM
        </a>
      </div>
    </div>
  );
}

/** 簡易Markdownレンダラ（表・太字・改行対応） */
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // テーブル検出
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1]?.includes("--")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<MarkdownTable key={`table-${i}`} lines={tableLines} />);
      continue;
    }

    // 空行
    if (line.trim() === "") {
      i++;
      continue;
    }

    // リスト
    if (line.trim().startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className="list-disc pl-5 space-y-1">
          {listItems.map((item, j) => (
            <li key={j}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 番号付きリスト
    if (/^\d+\.\s/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`olist-${i}`} className="list-decimal pl-5 space-y-1">
          {listItems.map((item, j) => (
            <li key={j}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 通常の段落
    elements.push(
      <p key={`p-${i}`}>
        <InlineMarkdown text={line} />
      </p>
    );
    i++;
  }

  return <div className="space-y-3 text-sm leading-relaxed">{elements}</div>;
}

function InlineMarkdown({ text }: { text: string }) {
  // **bold** のみ対応
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const parseRow = (line: string) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);

  const headers = parseRow(lines[0]);
  // Skip separator (lines[1])
  const rows = lines.slice(2).map(parseRow);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b-2 border-sumi/20 px-2 py-1 text-left font-bold"
              >
                <InlineMarkdown text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-sumi/5">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1">
                  <InlineMarkdown text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
