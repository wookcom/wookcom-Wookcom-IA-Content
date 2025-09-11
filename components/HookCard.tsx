import React, { useState, useCallback } from 'react';
import { Bookmark, Check, Copy, LoaderCircle, Pencil } from 'lucide-react';

interface HookCardProps {
  text: string;
  onSelect: (text: string) => void;
  isSelected: boolean;
  isLoading: boolean;
  onSave: (text: string) => void;
  isSaved: boolean;
}

export const HookCard: React.FC<HookCardProps> = ({ text, onSelect, isSelected, isLoading, onSave, isSaved }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <div className={`bg-brand-surface bg-clip-padding backdrop-blur-lg rounded-2xl p-5 flex justify-between items-start shadow-lg border transition-all duration-300 ${isSelected ? 'border-brand-primary shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'border-slate-700/50 hover:border-slate-600 hover:shadow-brand-primary/10'}`}>
      <p className="text-brand-text text-lg leading-relaxed mr-4 flex-1">{text}</p>
      <div className="flex flex-col items-center space-y-3 flex-shrink-0">
        <button
          onClick={() => onSave(text)}
          className={`p-2 rounded-full transition-colors duration-300 ${
            isSaved 
              ? 'bg-yellow-400/20 text-yellow-400 cursor-default' 
              : 'bg-slate-700/50 text-brand-subtle hover:bg-slate-600/50 hover:text-white'
          }`}
          aria-label={isSaved ? "Hook guardado" : "Guardar hook"}
          disabled={isSaved}
        >
          <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-full transition-colors duration-300 ${
            copied 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-slate-700/50 text-brand-subtle hover:bg-slate-600/50 hover:text-white'
          }`}
          aria-label="Copy hook"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
        <button
          onClick={() => onSelect(text)}
          disabled={isLoading}
          className="p-2 rounded-full bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/40 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Create script for this hook"
        >
          {isSelected && isLoading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Pencil className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};