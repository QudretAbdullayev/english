"use client";

import { RotateCcw } from "lucide-react";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_ACTIVE: Record<string, string> = {
  A1: "bg-emerald-500 text-white",
  A2: "bg-green-500 text-white",
  B1: "bg-sky-500 text-white",
  B2: "bg-blue-500 text-white",
  C1: "bg-violet-500 text-white",
  C2: "bg-rose-500 text-white",
};

interface Props {
  posOptions: string[];
  selectedLevels: Set<string>;
  selectedPos: Set<string>;
  wordlist: "all" | "ox3000" | "ox5000";
  sortBy: "alpha" | "level";
  onToggleLevel: (lv: string) => void;
  onTogglePos: (pos: string) => void;
  onWordlistChange: (v: "all" | "ox3000" | "ox5000") => void;
  onSortChange: (v: "alpha" | "level") => void;
  onClear: () => void;
  hasFilters: boolean;
}

export default function FilterPanel({
  posOptions,
  selectedLevels,
  selectedPos,
  wordlist,
  sortBy,
  onToggleLevel,
  onTogglePos,
  onWordlistChange,
  onSortChange,
  onClear,
  hasFilters,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Wordlist */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Wordlist
        </h3>
        <div className="space-y-0.5">
          {(
            [
              { value: "all", label: "All words" },
              { value: "ox3000", label: "Oxford 3000" },
              { value: "ox5000", label: "Oxford 5000 only" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onWordlistChange(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                wordlist === opt.value
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Level */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Level
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {LEVELS.map((lv) => {
            const active = selectedLevels.has(lv);
            return (
              <button
                key={lv}
                onClick={() => onToggleLevel(lv)}
                className={`py-1.5 rounded-lg text-sm font-bold transition-all ${
                  active
                    ? (LEVEL_ACTIVE[lv] ?? "bg-gray-600 text-white") + " shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {lv}
              </button>
            );
          })}
        </div>
      </section>

      {/* Part of Speech */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Part of Speech
        </h3>
        <div className="space-y-0.5 max-h-56 overflow-y-auto scrollbar-thin pr-0.5">
          {posOptions.map((pos) => {
            const active = selectedPos.has(pos);
            return (
              <button
                key={pos}
                onClick={() => onTogglePos(pos)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    active ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
                {pos || "—"}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sort */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Sort by
        </h3>
        <div className="flex gap-2">
          {(
            [
              { value: "alpha", label: "A–Z" },
              { value: "level", label: "Level" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === opt.value
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <RotateCcw size={13} />
          Clear all
        </button>
      )}
    </div>
  );
}
