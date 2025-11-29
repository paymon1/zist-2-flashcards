import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Brain, GraduationCap, CheckCircle2, RotateCcw, Shuffle, XCircle, Info, BookOpen } from 'lucide-react';
import { FLASHCARD_DATA } from './data';
import { Flashcard, StudyMode } from './types';
import { FlashcardCard } from './components/FlashcardCard';

// Storage Keys
const STORAGE_KEY_MASTERED = 'flashmaster_mastered_ids';

const App: React.FC = () => {
  // State
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<StudyMode>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [showMastered, setShowMastered] = useState(false);

  // Initialize Data & Storage
  useEffect(() => {
    // Load mastered status
    const savedMastered = localStorage.getItem(STORAGE_KEY_MASTERED);
    if (savedMastered) {
      try {
        setMasteredIds(JSON.parse(savedMastered));
      } catch (e) {
        console.error("Failed to parse mastered cards", e);
      }
    }

    // Initialize deck with smart shuffle
    const shuffled = [...FLASHCARD_DATA].sort(() => Math.random() - 0.5);
    setAllCards(shuffled);
  }, []);

  // Extract Categories
  const categories = useMemo(() => {
    const cats = new Set(allCards.map(c => c.category));
    return Array.from(cats).sort();
  }, [allCards]);

  // Filter Deck based on Search, Category, and Mastered status
  const activeDeck = useMemo(() => {
    let filtered = allCards;

    // Filter by Category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c => c.question.toLowerCase().includes(q) || 
             c.answer.toLowerCase().includes(q)
      );
    }

    // Filter out mastered unless explicitly shown
    if (!showMastered && searchQuery === '') {
      filtered = filtered.filter(c => !masteredIds.includes(c.id));
    }

    return filtered;
  }, [allCards, searchQuery, masteredIds, showMastered, selectedCategory]);

  const currentCard = activeDeck[currentIndex];

  // Handlers
  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % activeDeck.length);
    }, 200); // Wait for flip back if needed
  }, [activeDeck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + activeDeck.length) % activeDeck.length);
    }, 200);
  }, [activeDeck.length]);

  // Reset index when deck changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeDeck.length, selectedCategory]);

  const toggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;

    const isMastered = masteredIds.includes(currentCard.id);
    let newMastered;

    if (isMastered) {
      newMastered = masteredIds.filter(id => id !== currentCard.id);
    } else {
      newMastered = [...masteredIds, currentCard.id];
      // Auto advance if we just mastered it and aren't searching
      if (!searchQuery) {
        setTimeout(handleNext, 300);
      }
    }

    setMasteredIds(newMastered);
    localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify(newMastered));
  };

  const handleShuffle = () => {
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    setAllCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    if (confirm("Reset all learning progress?")) {
      setMasteredIds([]);
      localStorage.removeItem(STORAGE_KEY_MASTERED);
    }
  };

  // Guard for empty state
  if (FLASHCARD_DATA.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Flashcards Found</h2>
          <p className="text-slate-500 mb-6">The flashcard data file is currently empty.</p>
          <p className="text-xs text-slate-400">Please populate <code>FLASHCARD_DATA</code> in <code>data.ts</code>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[100dvh] bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between shrink-0 z-20 gap-3">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-slate-800 text-lg tracking-tight">FlashMaster</h1>
          </div>
          
          {/* Mobile mode toggle */}
          <button 
            onClick={() => setMode(prev => prev === 'browse' ? 'exam' : 'browse')}
            className={`md:hidden flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              mode === 'exam' 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            {mode === 'exam' ? 'Exam' : 'Browse'}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:min-w-[200px]">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="all">All Chapters</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Desktop mode toggle */}
          <button 
            onClick={() => setMode(prev => prev === 'browse' ? 'exam' : 'browse')}
            className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === 'exam' 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            {mode === 'exam' ? 'Exam Mode' : 'Browse Mode'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Search & Controls Bar */}
        <div className="px-4 py-4 max-w-3xl mx-auto w-full space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in selected chapter..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <span className="font-medium text-slate-700 whitespace-nowrap">
                Card {activeDeck.length > 0 ? currentIndex + 1 : 0} / {activeDeck.length}
              </span>
              {masteredIds.length > 0 && (
                <span className="text-green-600 flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3" />
                  {masteredIds.length} Learned
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 md:gap-2">
               <button 
                onClick={() => setShowMastered(!showMastered)}
                className={`px-2 py-1 rounded hover:bg-slate-100 transition-colors whitespace-nowrap ${showMastered ? 'text-blue-600 font-medium bg-blue-50' : ''}`}
              >
                {showMastered ? 'Hide Learned' : 'Show All'}
              </button>
              <button onClick={handleShuffle} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Shuffle Deck">
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={resetProgress} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-red-400 hover:text-red-500" title="Reset Progress">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden">
          {activeDeck.length > 0 ? (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <FlashcardCard 
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
                examMode={mode === 'exam'}
              />
              
              {/* Action Buttons */}
              <div className="mt-6 md:mt-8 flex items-center gap-4 w-full max-w-md justify-between">
                 <button 
                  onClick={handlePrev}
                  className="p-4 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-blue-600 hover:border-blue-200 active:scale-95 transition-all"
                  aria-label="Previous card"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                <button
                  onClick={toggleMastered}
                  className={`flex-1 mx-2 py-3 px-4 md:px-6 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    masteredIds.includes(currentCard.id)
                      ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {masteredIds.includes(currentCard.id) ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="hidden md:inline">Mastered</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-current opacity-40" />
                      <span className="hidden md:inline">Mark Learned</span>
                      <span className="md:hidden">Learn</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={handleNext}
                  className="p-4 rounded-full bg-blue-600 shadow-lg shadow-blue-200 text-white hover:bg-blue-700 active:scale-95 transition-all"
                  aria-label="Next card"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-sm animate-fade-in">
              <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No cards available</h3>
              <p className="text-slate-500 mb-6">
                {selectedCategory !== 'all' 
                  ? `No cards found in "${selectedCategory}" matching your filters.`
                  : "No cards match your search terms or filters."}
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowMastered(true);
                  setSelectedCategory('all');
                }}
                className="text-blue-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;