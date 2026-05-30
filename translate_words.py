import json
import time
import os
import anthropic

# ── Config ──────────────────────────────────────────────────────────────
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "YOUR_API_KEY_HERE")
INPUT_FILE = r"c:\Users\nijat.garayev.WE-19\Desktop\English\wordlist-app\public\oxford_wordlist.json"
OUTPUT_FILE = r"c:\Users\nijat.garayev.WE-19\Desktop\English\wordlist-app\public\oxford_wordlist.json"
PROGRESS_FILE = r"c:\Users\nijat.garayev.WE-19\Desktop\English\wordlist-app\translation_progress.json"
BATCH_SIZE = 50
DELAY_BETWEEN_BATCHES = 1  # seconds

client = anthropic.Anthropic(api_key=API_KEY)


def translate_batch(words_batch):
    """
    words_batch: list of {"word": str, "pos": str}
    Returns: dict of word -> {"az": str, "tr": str, "ru": str}
    """
    word_list = "\n".join(
        f'{i+1}. {item["word"]} ({item["pos"]})'
        for i, item in enumerate(words_batch)
    )

    prompt = f"""Translate each English word below into Azerbaijani, Turkish, and Russian.
Rules:
- Match the part of speech exactly (verb→verb form, noun→noun form, adjective→adjective form, adverb→adverb form)
- For "indefinite article", "definite article", "conjunction", "preposition", "pronoun", "exclamation", "number", "ordinal number" — translate the word itself as used in that grammatical role
- Give the most common/natural translation
- Return ONLY a JSON object, no explanation

Format:
{{
  "word1": {{"az": "...", "tr": "...", "ru": "..."}},
  "word2": {{"az": "...", "tr": "...", "ru": "..."}}
}}

Words to translate:
{word_list}"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()
    # Extract JSON block if wrapped in markdown
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_progress(progress):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def main():
    print(f"Loading {INPUT_FILE}...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        words = json.load(f)

    print(f"Total words: {len(words)}")

    # Load existing translations (for resume support)
    progress = load_progress()
    print(f"Already translated: {len(progress)} words")

    # Find words needing translation
    todo = [
        {"index": i, "word": w["word"], "pos": w.get("pos", "")}
        for i, w in enumerate(words)
        if w["word"] not in progress
    ]
    print(f"Remaining: {len(todo)} words")

    # Process in batches
    for batch_start in range(0, len(todo), BATCH_SIZE):
        batch = todo[batch_start: batch_start + BATCH_SIZE]
        batch_words = [{"word": b["word"], "pos": b["pos"]} for b in batch]

        print(f"Translating batch {batch_start // BATCH_SIZE + 1} / {(len(todo) + BATCH_SIZE - 1) // BATCH_SIZE} "
              f"(words {batch_start + 1}-{min(batch_start + BATCH_SIZE, len(todo))})...")

        try:
            translations = translate_batch(batch_words)
        except Exception as e:
            print(f"  ERROR: {e}")
            print("  Saving progress and stopping. Re-run to resume.")
            break

        # Merge into progress
        for item in batch:
            word = item["word"]
            if word in translations:
                progress[word] = translations[word]
            else:
                # fallback: mark as untranslated with empty strings
                progress[word] = {"az": "", "tr": "", "ru": ""}

        save_progress(progress)
        print(f"  Done. Progress saved ({len(progress)} total).")

        if batch_start + BATCH_SIZE < len(todo):
            time.sleep(DELAY_BETWEEN_BATCHES)

    # Apply translations to word list
    print("\nApplying translations to word list...")
    for entry in words:
        word = entry["word"]
        if word in progress:
            entry["az"] = progress[word].get("az", "")
            entry["tr"] = progress[word].get("tr", "")
            entry["ru"] = progress[word].get("ru", "")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

    print(f"Saved to {OUTPUT_FILE}")
    translated_count = sum(1 for w in words if w.get("az"))
    print(f"Words with translations: {translated_count} / {len(words)}")


if __name__ == "__main__":
    main()
