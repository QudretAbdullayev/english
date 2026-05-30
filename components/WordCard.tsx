"use client";

import { useState } from "react";
import { Word } from "@/types";
import AudioButton from "./AudioButton";
import { ExternalLink, Eye, EyeOff } from "lucide-react";

const LEVEL_STYLES: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 border-emerald-200",
  A2: "bg-green-100 text-green-700 border-green-200",
  B1: "bg-sky-100 text-sky-700 border-sky-200",
  B2: "bg-blue-100 text-blue-700 border-blue-200",
  C1: "bg-violet-100 text-violet-700 border-violet-200",
  C2: "bg-rose-100 text-rose-700 border-rose-200",
};

const POS_STYLES: Record<string, string> = {
  noun: "bg-orange-50 text-orange-700",
  verb: "bg-blue-50 text-blue-700",
  adjective: "bg-purple-50 text-purple-700",
  adverb: "bg-teal-50 text-teal-700",
  preposition: "bg-yellow-50 text-yellow-700",
  conjunction: "bg-pink-50 text-pink-700",
  pronoun: "bg-indigo-50 text-indigo-700",
  determiner: "bg-amber-50 text-amber-700",
  number: "bg-cyan-50 text-cyan-700",
  exclamation: "bg-red-50 text-red-700",
};

interface Props {
  word: Word;
}

export default function WordCard({ word }: Props) {
  const [showTrans, setShowTrans] = useState(false);

  const levelClass = word.level
    ? (LEVEL_STYLES[word.level] ?? "bg-gray-100 text-gray-600 border-gray-200")
    : "";
  const posClass = POS_STYLES[word.pos] ?? "bg-gray-50 text-gray-600";
  const hasUkAudio = !!(word.audio_uk_mp3 || word.audio_uk_ogg);
  const hasUsAudio = !!(word.audio_us_mp3 || word.audio_us_ogg);
  const hasTrans = !!(word.az || word.tr);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200 group flex flex-col gap-2">
      {/* Word + level + eye + link */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-none">
            {word.word}
          </h2>
          {word.level && (
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded border leading-none ${levelClass}`}
            >
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

      {/* POS */}
      {word.pos && (
        <span className={`self-start text-xs px-2 py-0.5 rounded-full font-medium ${posClass}`}>
          {word.pos}
        </span>
      )}

      {/* IPA + Audio rows */}
      <div className="space-y-1 mt-1">
        {(word.ipa_uk || hasUkAudio) && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 w-6 flex-shrink-0">UK</span>
            {word.ipa_uk && (
              <span className="text-sm text-gray-600 font-mono tracking-wide">{word.ipa_uk}</span>
            )}
            {hasUkAudio && (
              <AudioButton
                mp3={word.audio_uk_mp3}
                ogg={word.audio_uk_ogg}
                label="UK pronunciation"
              />
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
              <AudioButton
                mp3={word.audio_us_mp3}
                ogg={word.audio_us_ogg}
                label="US pronunciation"
              />
            )}
          </div>
        )}
      </div>

      {/* Translations */}
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

      {/* Wordlist badges */}
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
