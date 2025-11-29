import React from 'react';
import { Flashcard } from '../types';

interface FlashcardCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  examMode: boolean;
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({ card, isFlipped, onFlip, examMode }) => {
  return (
    <div 
      className="w-full max-w-md aspect-[4/3] relative perspective-1000 cursor-pointer group"
      onClick={onFlip}
    >
      <div 
        className={`w-full h-full relative transition-all duration-500 transform-style-3d shadow-xl rounded-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of Card (Question) */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-2xl p-8 flex flex-col justify-between backface-hidden border-2 border-slate-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">
              {card.category}
            </span>
            <span className="text-xs text-slate-400">Question</span>
          </div>
          <div className="flex-grow flex items-center justify-center text-center">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
              {card.question}
            </h3>
          </div>
          <div className="text-center text-sm text-slate-400 font-medium">
            {examMode ? "Tap to reveal answer" : "Tap to flip"}
          </div>
        </div>

        {/* Back of Card (Answer) */}
        <div className="absolute inset-0 w-full h-full bg-blue-600 text-white rounded-2xl p-8 flex flex-col justify-between rotate-y-180 backface-hidden shadow-inner">
           <div className="flex justify-between items-start">
            <span className="text-xs font-semibold tracking-wider text-blue-100 uppercase bg-blue-500/30 px-2 py-1 rounded-md">
              Answer
            </span>
          </div>
          <div className="flex-grow flex items-center justify-center text-center overflow-y-auto no-scrollbar">
            <p className="text-lg md:text-xl font-medium leading-relaxed">
              {card.answer}
            </p>
          </div>
           <div className="text-center text-sm text-blue-200 font-medium">
            Tap to see question
          </div>
        </div>
      </div>
    </div>
  );
};