import React from 'react';
import { ModelSelector } from './ModelSelector';
import { MenuIcon } from './IconComponents';
import type { Persona } from '../types';

interface HeaderProps {
    currentPersona: Persona;
    onPersonaChange: (persona: Persona) => void;
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPersona, onPersonaChange, onToggleSidebar }) => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-lg border-b border-[var(--border-color)] p-3 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-700/50 text-gray-300"
            aria-label="فتح/إغلاق الشريط الجانبي"
        >
            <MenuIcon className="w-6 h-6" />
        </button>
        
        <div className="flex-1 flex justify-center">
            <ModelSelector currentPersona={currentPersona} onPersonaChange={onPersonaChange} />
        </div>

        {/* This div acts as a spacer to balance the button on the left, keeping the model selector centered. */}
        <div className="w-10" aria-hidden="true"></div>
      </div>
    </header>
  );
};