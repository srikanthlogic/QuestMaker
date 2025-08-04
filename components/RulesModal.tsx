import React from 'react';
import type { QuestConfig, FooterSection } from '../types';

interface RulesModalProps {
    questConfig: QuestConfig;
    onClose: () => void;
}

const findRulesSection = (sections: FooterSection[]): FooterSection => {
    // Find a section with "rules" or "how to play" in the title, case-insensitive
    const rulesSection = sections.find(s => 
        s.title.toLowerCase().includes('rules') || 
        s.title.toLowerCase().includes('how to play')
    );
    
    // Fallback to the first section or a default if nothing is found
    return rulesSection || sections[0] || { 
        title: 'Rules of the Game', 
        content: '<p>The goal of the game is to be the last player who is not bankrupt. You are eliminated if your primary resources drop to zero. On your turn, roll the dice and move your piece. Landing on a space will trigger an event. Good luck!</p>' 
    };
};

export const RulesModal: React.FC<RulesModalProps> = ({ questConfig, onClose }) => {
    const rulesSection = findRulesSection(questConfig.footerSections);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-2xl w-full max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <h2 className="text-3xl font-bold font-display text-orange-600 mb-4">{rulesSection.title}</h2>
                <div className="overflow-y-auto custom-scrollbar pr-4 text-gray-700 space-y-4">
                    <div dangerouslySetInnerHTML={{ __html: rulesSection.content }} />
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 text-right">
                    <button
                        onClick={onClose}
                        className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                        aria-label="Close modal"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};