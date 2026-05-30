"use client";

import { useState, useMemo, useEffect } from "react";
import { Word } from "@/types";
import AudioButton from "./AudioButton";
import { Eye, EyeOff, ExternalLink, BookOpen, Home, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const LEVEL_STYLES: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 border-emerald-200",
  A2: "bg-green-100 text-green-700 border-green-200",
};

const DAY_SIZE = 25;

function DayWordCard({ word }: { word: Word }) {
  const [showTrans, setShowTrans] = useState(false);
  const levelClass = LEVEL_STYLES[word.level ?? ""] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const hasUkAudio = !!(word.audio_uk_mp3 || word.audio_uk_ogg);
  const hasUsAudio = !!(word.audio_us_mp3 || word.audio_us_ogg);
  const hasTrans = !!(word.az || word.tr);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200 group flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-none">
            {word.word}
          </h2>
          {word.level && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border leading-none ${levelClass}`}>
              {word.level}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          {hasTrans && (
            <button
              onClick={() => setShowTrans((v) => !v)}
              className="text-gray-300 hover:text-blue-500 transition-colors"
              aria-label="Toggle translations"
            >
              {showTrans ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          <a
            href={word.definition_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-blue-500 transition-colors"
            aria-label="Open Oxford definition"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <span className="self-start text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
        verb
      </span>

      <div className="space-y-1 mt-1">
        {(word.ipa_uk || hasUkAudio) && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 w-6 flex-shrink-0">UK</span>
            {word.ipa_uk && (
              <span className="text-sm text-gray-600 font-mono tracking-wide">{word.ipa_uk}</span>
            )}
            {hasUkAudio && (
              <AudioButton mp3={word.audio_uk_mp3} ogg={word.audio_uk_ogg} label="UK pronunciation" />
            )}
          </div>
        )}
        {(word.ipa_us || hasUsAudio) && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 w-6 flex-shrink-0">US</span>
            {word.ipa_us && (
              <span className="text-sm text-gray-600 font-mono tracking-wide">{word.ipa_us}</span>
            )}
            {hasUsAudio && (
              <AudioButton mp3={word.audio_us_mp3} ogg={word.audio_us_ogg} label="US pronunciation" />
            )}
          </div>
        )}
      </div>

      {showTrans && hasTrans && (
        <div className="mt-1 pt-2 border-t border-gray-100 flex flex-col gap-1">
          {word.az && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 w-6 flex-shrink-0">AZ</span>
              <span className="text-sm text-gray-700">{word.az}</span>
            </div>
          )}
          {word.tr && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 w-6 flex-shrink-0">TR</span>
              <span className="text-sm text-gray-700">{word.tr}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-1 mt-auto pt-1">
        {word.ox3000 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600 text-white font-semibold leading-none">
            OX3000
          </span>
        )}
        {word.ox5000 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-600 text-white font-semibold leading-none">
            OX5000
          </span>
        )}
      </div>
    </div>
  );
}

export default function DaysApp() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    fetch("/oxford_wordlist.json")
      .then((r) => {
        if (!r.ok) throw new Error("oxford_wordlist.json not found");
        return r.json();
      })
      .then((data: Word[]) => {
        setWords(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const verbs = useMemo(
    () =>
      words
        .filter((w) => w.pos === "verb" && (w.level === "A1" || w.level === "A2"))
        .sort((a, b) => a.word.localeCompare(b.word)),
    [words]
  );

  const days = useMemo(() => {
    const chunks: Word[][] = [];
    for (let i = 0; i < verbs.length; i += DAY_SIZE) {
      chunks.push(verbs.slice(i, i + DAY_SIZE));
    }
    return chunks;
  }, [verbs]);

  const totalDays = days.length;
  const dayWords = days[currentDay - 1] ?? [];

  const goDay = (d: number) => {
    setCurrentDay(Math.min(Math.max(1, d), totalDays));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
            aria-label="Home"
          >
            <Home size={18} />
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            <BookOpen size={20} className="text-blue-600" />
            <span className="font-bold text-gray-900 text-sm">Daily Verbs</span>
          </div>
          {!loading && !error && (
            <span className="text-xs text-gray-400 ml-auto tabular-nums">
              {verbs.length} verbs · {totalDays} days
            </span>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <BookOpen size={40} className="text-gray-200" />
            <p className="text-gray-500 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Day selector */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => goDay(currentDay - 1)}
                  disabled={currentDay === 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex flex-wrap gap-1.5 flex-1">
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      onClick={() => goDay(d)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        d === currentDay
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goDay(currentDay + 1)}
                  disabled={currentDay === totalDays}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">
                  Day {currentDay}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    A1–A2 verbs · words {(currentDay - 1) * DAY_SIZE + 1}–
                    {Math.min(currentDay * DAY_SIZE, verbs.length)}
                  </span>
                </h1>
                <span className="text-xs text-gray-400">{dayWords.length} words</span>
              </div>
            </div>

            {/* Word grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {dayWords.map((word) => (
                <DayWordCard key={`${word.word}-${word.pos}-${word.slug}`} word={word} />
              ))}
            </div>

            {/* Bottom nav */}
            {totalDays > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => goDay(currentDay - 1)}
                  disabled={currentDay === 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} /> Day {currentDay - 1}
                </button>
                <span className="text-sm text-gray-400">
                  {currentDay} / {totalDays}
                </span>
                <button
                  onClick={() => goDay(currentDay + 1)}
                  disabled={currentDay === totalDays}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Day {currentDay + 1} <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
