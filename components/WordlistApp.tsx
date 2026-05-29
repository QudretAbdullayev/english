"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Word } from "@/types";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import WordCard from "./WordCard";
import { BookOpen, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 48;

export default function WordlistApp() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set());
  const [selectedPos, setSelectedPos] = useState<Set<string>>(new Set());
  const [wordlist, setWordlist] = useState<"all" | "ox3000" | "ox5000">("all");
  const [sortBy, setSortBy] = useState<"alpha" | "level">("alpha");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const posOptions = useMemo(() => {
    const set = new Set<string>();
    words.forEach((w) => {
      if (w.pos) set.add(w.pos);
    });
    return Array.from(set).sort();
  }, [words]);

  const filtered = useMemo(() => {
    let result = words;

    if (wordlist === "ox3000") result = result.filter((w) => w.ox3000);
    else if (wordlist === "ox5000") result = result.filter((w) => w.ox5000 && !w.ox3000);

    if (selectedLevels.size > 0)
      result = result.filter((w) => w.level !== null && selectedLevels.has(w.level));

    if (selectedPos.size > 0) result = result.filter((w) => selectedPos.has(w.pos));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((w) => w.word.toLowerCase().includes(q));
    }

    const LV_ORDER: Record<string, number> = {
      A1: 0,
      A2: 1,
      B1: 2,
      B2: 3,
      C1: 4,
      C2: 5,
    };

    return [...result].sort((a, b) => {
      if (sortBy === "level") {
        const la = a.level ? (LV_ORDER[a.level] ?? 99) : 99;
        const lb = b.level ? (LV_ORDER[b.level] ?? 99) : 99;
        if (la !== lb) return la - lb;
      }
      return a.word.localeCompare(b.word);
    });
  }, [words, search, selectedLevels, selectedPos, wordlist, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = useCallback(
    (p: number) => {
      setPage(Math.min(Math.max(1, p), totalPages));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  const toggleLevel = useCallback((lv: string) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      next.has(lv) ? next.delete(lv) : next.add(lv);
      return next;
    });
    setPage(1);
  }, []);

  const togglePos = useCallback((pos: string) => {
    setSelectedPos((prev) => {
      const next = new Set(prev);
      next.has(pos) ? next.delete(pos) : next.add(pos);
      return next;
    });
    setPage(1);
  }, []);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const clearAll = useCallback(() => {
    setSearch("");
    setSelectedLevels(new Set());
    setSelectedPos(new Set());
    setWordlist("all");
    setSortBy("alpha");
    setPage(1);
  }, []);

  const hasFilters =
    !!search || selectedLevels.size > 0 || selectedPos.size > 0 || wordlist !== "all";

  const filterPanel = (
    <FilterPanel
      posOptions={posOptions}
      selectedLevels={selectedLevels}
      selectedPos={selectedPos}
      wordlist={wordlist}
      sortBy={sortBy}
      onToggleLevel={toggleLevel}
      onTogglePos={togglePos}
      onWordlistChange={(v) => {
        setWordlist(v);
        setPage(1);
        setDrawerOpen(false);
      }}
      onSortChange={(v) => {
        setSortBy(v);
        setPage(1);
      }}
      onClear={() => {
        clearAll();
        setDrawerOpen(false);
      }}
      hasFilters={hasFilters}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open filters"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <BookOpen size={20} className="text-blue-600" />
            <span className="font-bold text-gray-900 text-sm hidden sm:block">
              Oxford Wordlist
            </span>
          </div>

          <div className="flex-1 max-w-md">
            <SearchBar value={search} onChange={handleSearch} />
          </div>

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {!loading && !error && (
              <span className="text-xs text-gray-400 hidden sm:block tabular-nums">
                {filtered.length.toLocaleString()} words
              </span>
            )}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-900 text-sm">Filters</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">{filterPanel}</div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-20">{filterPanel}</div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin border-[3px]" />
              <p className="text-sm text-gray-400">Loading wordlist…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
              <BookOpen size={40} className="text-gray-200" />
              <p className="text-gray-500 font-medium">oxford_wordlist.json not found</p>
              <p className="text-sm text-gray-400 max-w-sm">
                Run the Python script to generate it, then copy{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                  oxford_wordlist.json
                </code>{" "}
                to{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                  wordlist-app/public/
                </code>
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Mobile word count */}
              <p className="text-xs text-gray-400 mb-4 lg:hidden">
                {filtered.length.toLocaleString()} words
              </p>

              {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                  <BookOpen size={40} className="text-gray-200" />
                  <p className="text-gray-500 font-medium">No words found</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {paginated.map((word) => (
                      <WordCard key={`${word.word}-${word.pos}-${word.slug}`} word={word} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-1 flex-wrap">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={page === 1}
                        className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="First page"
                      >
                        «
                      </button>
                      <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Page number pills */}
                      {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        let p: number;
                        if (totalPages <= 7) {
                          p = i + 1;
                        } else if (page <= 4) {
                          p = i + 1;
                        } else if (page >= totalPages - 3) {
                          p = totalPages - 6 + i;
                        } else {
                          p = page - 3 + i;
                        }
                        return (
                          <button
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                              p === page
                                ? "bg-blue-600 text-white font-semibold"
                                : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={page === totalPages}
                        className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Last page"
                      >
                        »
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
