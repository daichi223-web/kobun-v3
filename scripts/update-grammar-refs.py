#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
update-grammar-refs.py

Updates grammarRefId fields in text JSON files to point to more specific
grammar reference pages instead of generic category pages.

Usage:
    python -X utf8 update-grammar-refs.py
"""

import json
import os
from collections import defaultdict

# Paths to the JSON files (relative to script location)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(SCRIPT_DIR, "..", "app", "data", "texts")

FILES = [
    os.path.join(BASE_DIR, "chigo-no-sorane.json"),
    os.path.join(BASE_DIR, "ebutsu-shi-ryoshu.json"),
]


def get_new_ref_id(token):
    """
    Determine the new grammarRefId for a token based on the mapping rules.
    Returns the new ref id, or None if no mapping applies.
    """
    ref_id = token.get("grammarRefId")
    if not ref_id:
        return None

    tag = token.get("grammarTag", {})
    pos = tag.get("pos", "")
    conj_type = tag.get("conjugationType", "")
    base_form = tag.get("baseForm", "")
    meaning = tag.get("meaning", "")
    text = token.get("text", "")

    # --- doushi-katsuyo -> specific conjugation type ---
    if ref_id == "doushi-katsuyo":
        if "\u56db\u6bb5\u6d3b\u7528" in conj_type:  # 四段活用
            return "doushi-yodan"
        if "\u4e0b\u4e8c\u6bb5\u6d3b\u7528" in conj_type:  # 下二段活用
            return "doushi-shimo-nidan"
        if "\u4e0a\u4e00\u6bb5\u6d3b\u7528" in conj_type:  # 上一段活用
            return "doushi-kami-ichidan"
        if "\u30ab\u884c\u5909\u683c\u6d3b\u7528" in conj_type:  # カ行変格活用
            return "doushi-kahen"
        if "\u30b5\u884c\u5909\u683c\u6d3b\u7528" in conj_type:  # サ行変格活用
            return "doushi-sahen"
        if "\u30e9\u884c\u5909\u683c\u6d3b\u7528" in conj_type:  # ラ行変格活用
            return "doushi-rahen"
        return None

    # --- keiyoshi-katsuyo -> specific type ---
    if ref_id == "keiyoshi-katsuyo":
        if "\u30af\u6d3b\u7528" == conj_type:  # ク活用
            return "keiyoshi-ku"
        if "\u30b7\u30af\u6d3b\u7528" == conj_type:  # シク活用
            return "keiyoshi-shiku"
        return None

    # --- jodoshi-jisei -> specific word ---
    if ref_id == "jodoshi-jisei":
        if base_form == "\u3051\u308a":  # けり
            return "jodoshi-keri"
        if base_form == "\u305f\u308a":  # たり
            return "jodoshi-tari"
        if base_form == "\u306c":  # ぬ
            return "jodoshi-nu"
        if base_form == "\u3064":  # つ
            return "jodoshi-tsu"
        if base_form == "\u306a\u308a":  # なり
            return "jodoshi-nari"
        if base_form == "\u308a":  # り
            return "jodoshi-ri"
        return None

    # --- jodoshi-suiryo -> specific word ---
    if ref_id == "jodoshi-suiryo":
        if base_form == "\u3080" or text == "\u3080":  # む
            return "jodoshi-mu"
        if base_form == "\u3079\u3057":  # べし
            return "jodoshi-beshi"
        return None

    # --- jodoshi-hitei -> jodoshi-zu ---
    if ref_id == "jodoshi-hitei":
        return "jodoshi-zu"

    # --- jodoshi-ukemi-shieki-sonkei -> specific ---
    if ref_id == "jodoshi-ukemi-shieki-sonkei":
        if base_form == "\u308b" or base_form == "\u3089\u308b":  # る / らる
            return "jodoshi-ru"
        if pos == "\u52a9\u52d5\u8a5e" and (base_form == "\u3059" or base_form == "\u3055\u3059"):  # す / さす (助動詞)
            return "jodoshi-su"
        return None

    # --- keigo -> specific type ---
    if ref_id == "keigo":
        if "\u5c0a\u656c\u8a9e" in meaning:  # 尊敬語
            return "keigo-sonkei"
        if "\u8b19\u8b72\u8a9e" in meaning:  # 謙譲語
            return "keigo-kenjou"
        if "\u4e01\u5be7\u8a9e" in meaning:  # 丁寧語
            return "keigo-teinei"
        return None

    return None


def process_file(filepath):
    """Process a single JSON file and return change statistics."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    changes = defaultdict(int)
    total_tokens = 0
    changed_tokens = 0

    for sentence in data.get("sentences", []):
        for token in sentence.get("tokens", []):
            total_tokens += 1
            old_ref = token.get("grammarRefId")
            if not old_ref:
                continue

            new_ref = get_new_ref_id(token)
            if new_ref and new_ref != old_ref:
                change_key = "%s -> %s" % (old_ref, new_ref)
                changes[change_key] += 1
                token["grammarRefId"] = new_ref
                changed_tokens += 1

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    return total_tokens, changed_tokens, changes


def main():
    print("=" * 60)
    print("Grammar Reference ID Updater")
    print("=" * 60)

    grand_total_tokens = 0
    grand_changed = 0

    for filepath in FILES:
        abs_path = os.path.abspath(filepath)
        filename = os.path.basename(filepath)

        if not os.path.exists(abs_path):
            print("\n[SKIP] File not found: %s" % abs_path)
            continue

        print("\n--- Processing: %s ---" % filename)
        total, changed, changes = process_file(abs_path)
        grand_total_tokens += total
        grand_changed += changed

        print("  Total tokens scanned: %d" % total)
        print("  Tokens updated:       %d" % changed)
        if changes:
            print("  Changes breakdown:")
            for change_key in sorted(changes.keys()):
                print("    %-50s x%d" % (change_key, changes[change_key]))
        else:
            print("  No changes needed.")

    print("\n" + "=" * 60)
    print("GRAND TOTAL")
    print("  Tokens scanned: %d" % grand_total_tokens)
    print("  Tokens updated: %d" % grand_changed)
    print("=" * 60)


if __name__ == "__main__":
    main()
