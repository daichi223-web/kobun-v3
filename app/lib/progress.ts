/**
 * 古文読み v3 — localStorage ベースの進捗管理
 */

import type { ReadingProgress, LayerId } from "./types";

const STORAGE_KEY = "kobun-yomi-progress";

export function loadAllProgress(): Record<string, ReadingProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(all: Record<string, ReadingProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage full — silently fail
  }
}

export function getProgress(textId: string): ReadingProgress | null {
  return loadAllProgress()[textId] ?? null;
}

export function markTokenViewed(textId: string, tokenId: string): void {
  const all = loadAllProgress();
  const existing = all[textId];
  if (!existing) return;

  if (!existing.tokensViewed.includes(tokenId)) {
    existing.tokensViewed.push(tokenId);
    existing.lastReadAt = new Date().toISOString();
    saveAll(all);
  }
}

export function setCurrentLayer(textId: string, layer: LayerId): void {
  const all = loadAllProgress();
  if (!all[textId]) {
    all[textId] = {
      textId,
      completedLayers: [],
      currentLayer: layer,
      lastReadAt: new Date().toISOString(),
      tokensViewed: [],
    };
  } else {
    all[textId].currentLayer = layer;
    all[textId].lastReadAt = new Date().toISOString();
  }
  saveAll(all);
}

export function completeLayer(textId: string, layer: LayerId): void {
  const all = loadAllProgress();
  if (!all[textId]) {
    all[textId] = {
      textId,
      completedLayers: [layer],
      currentLayer: layer,
      lastReadAt: new Date().toISOString(),
      tokensViewed: [],
    };
  } else if (!all[textId].completedLayers.includes(layer)) {
    all[textId].completedLayers.push(layer);
    all[textId].lastReadAt = new Date().toISOString();
  }
  saveAll(all);
}

export function initProgress(textId: string): ReadingProgress {
  const all = loadAllProgress();
  if (!all[textId]) {
    all[textId] = {
      textId,
      completedLayers: [],
      currentLayer: 1,
      lastReadAt: new Date().toISOString(),
      tokensViewed: [],
    };
    saveAll(all);
  }
  return all[textId];
}
