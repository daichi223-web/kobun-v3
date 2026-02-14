"use client";

import Link from "next/link";
import type { TextExample } from "@/app/lib/types";

interface TextExampleCardProps {
  example: TextExample;
}

const textTitles: Record<string, string> = {
  "chigo-no-sorane": "ちごのそらね",
  "ebutsu-shi-ryoshu": "絵仏師良秀",
};

export function TextExampleCard({ example }: TextExampleCardProps) {
  const title = textTitles[example.textId] ?? example.textId;

  return (
    <Link
      href={`/texts/${example.textId}?layer=2`}
      className="block bg-white/50 rounded-lg p-3 border border-sumi/5
                 hover:bg-white/80 hover:shadow-sm transition-all"
    >
      <p className="text-sm">
        <ExcerptMarkdown text={example.excerpt} />
      </p>
      <p className="text-xs text-scaffold mt-1">
        {title} — {example.explanation}
      </p>
    </Link>
  );
}

/** excerpt 中の **bold** を表示 */
function ExcerptMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-shu">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
