"use client";

import { useState } from "react";
import type { LearningPoints, LayerId, SectionPriority } from "@/app/lib/types";

interface LearningPointsPanelProps {
  learningPoints: LearningPoints;
  currentLayer: LayerId;
}

const priorityLabel: Record<SectionPriority, string> = {
  essential: "必須",
  important: "重要",
  supplementary: "補足",
};

const priorityStyle: Record<SectionPriority, string> = {
  essential: "bg-shu/10 text-shu border-shu/30",
  important: "bg-kin/10 text-kin border-kin/30",
  supplementary: "bg-sumi/5 text-sumi/50 border-sumi/10",
};

export function LearningPointsPanel({
  learningPoints,
  currentLayer,
}: LearningPointsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  const layerPoints = learningPoints.byLayer.find(
    (lp) => lp.layer === currentLayer
  );

  // Sort points by priority
  const sortedPoints = layerPoints
    ? [...layerPoints.points].sort((a, b) => {
        const order: Record<SectionPriority, number> = {
          essential: 0,
          important: 1,
          supplementary: 2,
        };
        return order[a.priority] - order[b.priority];
      })
    : [];

  return (
    <div className="border border-sumi/15 rounded-lg bg-washi/80 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-sm font-bold hover:bg-sumi/5 transition-colors"
      >
        <span>
          学習のポイント
          {layerPoints && (
            <span className="ml-2 text-xs font-normal text-scaffold">
              — {layerPoints.label}
            </span>
          )}
        </span>
        <span
          className={`text-scaffold transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-sumi/10">
          {/* レイヤーの要点（1行サマリー） */}
          {layerPoints?.keyPoint && (
            <div className="pt-3 px-3 py-2 bg-shu/5 border border-shu/20 rounded-lg">
              <p className="text-xs font-bold text-shu leading-relaxed">
                {layerPoints.keyPoint}
              </p>
            </div>
          )}

          {/* 覚える手順 */}
          {layerPoints?.studySteps && layerPoints.studySteps.length > 0 && (
            <div className="px-3 py-2 bg-kin/5 border border-kin/20 rounded-lg">
              <h3 className="text-xs font-bold text-kin mb-1.5">覚える手順</h3>
              <ol className="space-y-1">
                {layerPoints.studySteps.map((step, i) => (
                  <li key={i} className="text-xs leading-relaxed flex gap-1.5">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-kin text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* レイヤーのポイント（軽重付き） */}
          {sortedPoints.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-scaffold pt-1">
                この単元のポイント
              </h3>
              {sortedPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex gap-2 items-start text-xs leading-relaxed"
                >
                  <span
                    className={`shrink-0 mt-0.5 px-1 py-0.5 text-[9px] font-bold rounded border ${priorityStyle[point.priority]}`}
                  >
                    {priorityLabel[point.priority]}
                  </span>
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* 単元の概要（折りたたみ） */}
          <div className="border-t border-sumi/10 pt-2">
            <button
              onClick={() => setShowOverview(!showOverview)}
              className="w-full flex items-center justify-between text-xs text-scaffold hover:text-sumi transition-colors"
            >
              <span className="font-bold">単元の概要</span>
              <span
                className={`transition-transform ${showOverview ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {showOverview && (
              <ul className="mt-1.5 space-y-1">
                {learningPoints.overview.map((point, i) => (
                  <li
                    key={i}
                    className="text-xs leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-sumi/30"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
