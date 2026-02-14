"use client";

import { useState } from "react";
import type { LearningPoints, LayerId } from "@/app/lib/types";

interface LearningPointsPanelProps {
  learningPoints: LearningPoints;
  currentLayer: LayerId;
}

export function LearningPointsPanel({
  learningPoints,
  currentLayer,
}: LearningPointsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const layerPoints = learningPoints.byLayer.find(
    (lp) => lp.layer === currentLayer
  );

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
          {/* 単元のポイント */}
          <div className="pt-3">
            <h3 className="text-xs font-bold text-scaffold mb-1.5">
              単元のポイント
            </h3>
            <ul className="space-y-1">
              {learningPoints.overview.map((point, i) => (
                <li
                  key={i}
                  className="text-xs leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-shu"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* レイヤーのポイント */}
          {layerPoints && (
            <div className="pt-2 border-t border-sumi/10">
              <h3 className="text-xs font-bold text-shu mb-1.5">
                {layerPoints.label}のポイント
              </h3>
              <ul className="space-y-1">
                {layerPoints.points.map((point, i) => (
                  <li
                    key={i}
                    className="text-xs leading-relaxed pl-3 relative before:content-['◆'] before:absolute before:left-0 before:text-kin before:text-[10px]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
