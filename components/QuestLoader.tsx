import React, { useState } from 'react';
import type { QuestConfig } from '../types';
import { LoadingSpinner, ChevronDownIcon, WandIcon } from './Icons';

interface QuestLoaderProps {
  onQuestLoaded: (config: QuestConfig) => void;
  onLaunchMaker: () => void;
  isApiKeySet: boolean;
  onNavigate: (path: string) => void;
}

const QuestButton: React.FC<{
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
}> = ({ title, description, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left p-4 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105"
    >
        <h3 className="font-bold text-xl font-display">{title}</h3>
        <p className="text-orange-100">{description}</p>
    </button>
);


export const QuestLoader: React.FC<QuestLoaderProps> = ({ onQuestLoaded, onLaunchMaker, isApiKeySet, onNavigate }) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadDefaultQuest = async (questId: string, path: string) => {
        setIsLoading(questId);
        setError(null);
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load quest: ${response.statusText}`);
            }
            const data: QuestConfig = await response.json();
            onQuestLoaded(data);
        } catch (e: any) {
            setError(e.message || "Could not load the quest file.");
            setIsLoading(null);
        }
    };

    const handleCustomQuestPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setError(null);
        const jsonString = e.target.value;
        if (jsonString.trim() === '') return;

        try {
            const data: QuestConfig = JSON.parse(jsonString);
            if (!data.name || !data.resources || !data.board) {
                throw new Error("JSON is missing required fields (name, resources, board).");
            }
            onQuestLoaded(data);
        } catch (e: any) {
            setError(`Invalid JSON: ${e.message}`);
        }
    };

    const handleDocLinkClick = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        onNavigate(path);
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4 border-gray-200 animate-fade-in">
            <header className="text-center mb-8">
                <h1 className="text-6xl font-extrabold text-orange-600 font-display">QuestCraft</h1>
                <p className="text-gray-500 mt-2 text-lg">An engine for creating interactive, educational board games.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* --- Left Column: Play --- */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold font-display text-gray-800 border-b-2 border-orange-200 pb-2">Play a Quest</h2>
                    
                    <QuestButton 
                        title="Digital Payments Quest"
                        description="Navigate the world of UPI, scams, and digital finance in India."
                        onClick={() => loadDefaultQuest('digital', '/quests/digital-payments-quest.json')}
                        disabled={!!isLoading}
                    />
                    
                    <QuestButton 
                        title="Aadhaar Quest"
                        description="Explore India's identity ecosystem, its challenges and benefits."
                        onClick={() => loadDefaultQuest('aadhaar', '/quests/aadhaar-quest.json')}
                        disabled={!!isLoading}
                    />

                    {isLoading && isLoading !== 'schema-validation' && (
                        <div className="flex justify-center items-center pt-4">
                            <LoadingSpinner className="h-8 w-8"/>
                            <p className="ml-4 text-gray-600 font-semibold">Loading Quest...</p>
                        </div>
                    )}

                </div>

                {/* --- Right Column: Create --- */}
                <div className="space-y-6">
                     <h2 className="text-3xl font-bold font-display text-gray-800 border-b-2 border-orange-200 pb-2">Create a Quest</h2>
                     
                     <button
                        onClick={onLaunchMaker}
                        disabled={!isApiKeySet}
                        className="w-full text-left p-4 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                     >
                        <WandIcon className="w-8 h-8 mr-4 flex-shrink-0"/>
                        <div>
                            <h3 className="font-bold text-xl font-display">Launch Quest Maker</h3>
                            <p className="text-blue-100">Create your own game with a step-by-step wizard.</p>
                        </div>
                     </button>
                     {!isApiKeySet && (
                        <p className="text-xs text-center text-gray-500 -mt-2">
                          To use the AI-powered Quest Maker, please load a quest, go to Settings, and add your Gemini API key.
                        </p>
                     )}


                     <div className="text-center text-gray-500 font-semibold">OR</div>

                      <div>
                        <label htmlFor="custom-quest-input" className="block text-sm font-semibold text-gray-700 mb-1">Load from JSON</label>
                        <textarea
                            id="custom-quest-input"
                            placeholder="Paste your quest.json content here..."
                            className="w-full h-24 p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                            onChange={handleCustomQuestPaste}
                        />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-8 pt-6 border-t border-gray-200">
                    <h2 className="text-2xl font-bold font-display text-gray-700 text-center mb-4">Documentation</h2>
                    <div className="flex justify-center flex-wrap gap-x-6 gap-y-2">
                        <a href="/docs/README.md" onClick={e => handleDocLinkClick(e, '/docs/README.md')} className="font-semibold text-orange-600 hover:underline">Overview</a>
                        <a href="/docs/QUEST-MAKER.md" onClick={e => handleDocLinkClick(e, '/docs/QUEST-MAKER.md')} className="font-semibold text-orange-600 hover:underline">Quest Maker Guide</a>
                        <a href="/docs/quest-schema.md" onClick={e => handleDocLinkClick(e, '/docs/quest-schema.md')} className="font-semibold text-orange-600 hover:underline">Quest Schema</a>
                        <a href="/docs/DEVELOP.md" onClick={e => handleDocLinkClick(e, '/docs/DEVELOP.md')} className="font-semibold text-orange-600 hover:underline">Developer Guide</a>
                        <a href="/docs/DESIGN.md" onClick={e => handleDocLinkClick(e, '/docs/DESIGN.md')} className="font-semibold text-orange-600 hover:underline">Design & Architecture</a>
                    </div>
                     <div className="pt-4 text-center">
                        <button
                            onClick={() => loadDefaultQuest('schema-validation', '/quests/schema-validation-quest.json')}
                            disabled={!!isLoading}
                            className="text-sm font-semibold text-gray-500 hover:text-orange-600 transition-colors disabled:text-gray-400"
                        >
                            {isLoading === 'schema-validation' ? 'Loading...' : 'Load Validation Quest (Dev)'}
                        </button>
                    </div>
                </div>
            </div>
             {error && <p className="text-center mt-6 text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        </div>
    );
};