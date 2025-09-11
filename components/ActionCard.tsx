import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group bg-brand-surface backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-left w-full transition-all duration-300 hover:border-brand-primary hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-text">{title}</h3>
            <p className="text-brand-subtle mt-1">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-brand-subtle transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-primary" />
      </div>
    </button>
  );
};
