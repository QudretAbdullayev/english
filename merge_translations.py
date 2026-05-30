import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from translations import translations

with open(os.path.join(os.path.dirname(__file__), "public", "oxford_wordlist.json"), encoding="utf-8") as f:
    wordlist = json.load(f)

matched = 0
unmatched = 0
unmatched_keys = []

for entry in wordlist:
    word = entry["word"]
    pos  = entry["pos"]

    # Try "word_pos" first, then just "word"
    key_with_pos = f"{word}_{pos}"
    key_plain    = word

    trans = translations.get(key_with_pos) or translations.get(key_plain)

    if trans:
        entry["az"] = trans.get("az", "")
        entry["tr"] = trans.get("tr", "")
        entry["ru"] = trans.get("ru", "")
        matched += 1
    else:
        entry["az"] = ""
        entry["tr"] = ""
        entry["ru"] = ""
        unmatched += 1
        unmatched_keys.append(key_with_pos)

out_path = os.path.join(os.path.dirname(__file__), "public", "oxford_wordlist.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(wordlist, f, ensure_ascii=False, indent=2)

print(f"Done. matched={matched}, unmatched={unmatched}")
if unmatched_keys[:20]:
    print("First unmatched:", unmatched_keys[:20])
