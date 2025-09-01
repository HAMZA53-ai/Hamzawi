import React, { useState, useRef, useEffect } from 'react';
import type { Persona } from '../types';
import { ChevronDownIcon, GeminiIcon, GptIcon, DeepseekIcon, ClaudeIcon, CodeIcon, TeacherIcon } from './IconComponents';

interface ModelSelectorProps {
    currentPersona: Persona;
    onPersonaChange: (persona: Persona) => void;
}

type IconProps = {
    className?: string;
};

const personaDetails: Record<Persona, { name: string; themeClass: string; icon: React.FC<IconProps> }> = {
    'GEMINI': { name: 'حمزاوي 5.0', themeClass: 'theme-gemini', icon: GeminiIcon },
    'GPT': { name: 'حمزاوي 4.5', themeClass: 'theme-gpt', icon: GptIcon },
    'DEEPSEEK': { name: 'حمزاوي 4.0', themeClass: 'theme-deepseek', icon: DeepseekIcon },
    'CLAUDE': { name: 'حمزاوي 3.5', themeClass: 'theme-claude', icon: ClaudeIcon },
    'HAMZAWY_CODE': { name: 'حمزاوي كود', themeClass: 'theme-hamzawy-code', icon: CodeIcon },
    'TEACHER': { name: 'المعلم', themeClass: 'theme-teacher', icon: TeacherIcon }
};


export const ModelSelector: React.FC<ModelSelectorProps> = ({ currentPersona, onPersonaChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleSelect = (persona: Persona) => {
        onPersonaChange(persona);
        setIsOpen(false);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const SelectedIcon = personaDetails[currentPersona]?.icon;
    
    return (
        <div ref={wrapperRef} className="relative inline-block text-start">
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex w-full justify-center items-center gap-x-2.5 rounded-md bg-gray-800/80 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700/80"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    {SelectedIcon && <SelectedIcon className="w-4 h-4 text-[var(--accent-color)]" />}
                    {personaDetails[currentPersona]?.name || 'Select Persona'}
                    <ChevronDownIcon className={`-mr-1 h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div
                    className="absolute start-1/2 -translate-x-1/2 mt-2 w-56 origin-top rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        {(Object.keys(personaDetails) as Persona[]).map((persona) => {
                           const PersonaIcon = personaDetails[persona].icon;
                           return (
                               <button
                                    key={persona}
                                    onClick={() => handleSelect(persona)}
                                    className={`w-full text-start flex items-center gap-3 px-4 py-2 text-sm ${personaDetails[persona].themeClass} ${currentPersona === persona ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
                                    role="menuitem"
                                >
                                    <PersonaIcon className="w-4 h-4 text-[var(--accent-color)]" />
                                    {personaDetails[persona].name}
                               </button>
                           )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}