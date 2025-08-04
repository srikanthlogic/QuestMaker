
import React, { useState, useEffect } from 'react';
import type { GameSettings, QuestConfig } from '../types';
import { PlayerToken, ArrowLeftIcon, KeyIcon } from './Icons';
import { saveApiKey, getApiKey, clearApiKey } from '../services/apiKeyService';

interface SettingsProps {
  initialSettings: GameSettings;
  questConfig: QuestConfig;
  onStartGame: (settings: GameSettings) => void;
  onCustomize: () => void;
  onBack: () => void;
  onKeyStatusChange: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ initialSettings, questConfig, onStartGame, onCustomize, onBack, onKeyStatusChange }) => {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [currentKey, setCurrentKey] = useState(() => getApiKey());

  useEffect(() => {
    // If the key is removed, and the user had "dynamic" selected,
    // fall back to "pregenerated" to prevent errors.
    if (!currentKey && settings.scenarioSource === 'dynamic') {
        setSettings(prev => ({ ...prev, scenarioSource: 'pregenerated' }));
    }
  }, [currentKey, settings.scenarioSource]);

  const handleSaveKey = () => {
    saveApiKey(apiKeyInput);
    setCurrentKey(apiKeyInput);
    setApiKeyInput('');
    onKeyStatusChange();
  };

  const handleClearKey = () => {
      if (window.confirm("Are you sure you want to clear your API key? AI-powered features will be disabled.")) {
        clearApiKey();
        setCurrentKey(null);
        setApiKeyInput('');
        onKeyStatusChange();
      }
  }

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...settings.playerNames];
    newPlayerNames[index] = name;
    setSettings(prev => ({ ...prev, playerNames: newPlayerNames }));
  };

  const handleNumPlayersChange = (num: number) => {
    setSettings(prev => ({ ...prev, numPlayers: num }));
  }

  const handleResourceChange = (resourceName: string, value: number) => {
    setSettings(prev => ({
        ...prev,
        initialResources: {
            ...prev.initialResources,
            [resourceName]: value,
        }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame(settings);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4 border-gray-200 animate-fade-in">
      <header className="text-center mb-6 relative">
        <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
            <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-5xl font-extrabold text-orange-600 font-display">Game Settings</h1>
        <p className="text-gray-500 mt-2">Configure your session of {questConfig.name}.</p>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Number of Players */}
        <div>
          <label className="block text-lg font-bold font-display text-gray-700 mb-2">Number of Players</label>
          <div className="flex justify-center space-x-4">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumPlayersChange(num)}
                className={`w-16 h-16 rounded-full text-2xl font-bold transition-all duration-200
                  ${settings.numPlayers === num 
                    ? 'bg-orange-500 text-white scale-110 shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                }
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Player Names */}
        <div>
          <label className="block text-lg font-bold font-display text-gray-700 mb-3">Player Names</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: settings.numPlayers }).map((_, index) => (
              <div key={index} className="flex items-center bg-gray-50 p-2 rounded-lg border-2 border-transparent focus-within:border-orange-400 transition-colors">
                 <PlayerToken className={`w-6 h-6 mr-3 flex-shrink-0 ${questConfig.playerColors[index]}`} />
                 <input
                    type="text"
                    value={settings.playerNames[index]}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    placeholder={`Player ${index + 1}`}
                    className="w-full bg-transparent text-gray-800 font-semibold focus:outline-none"
                    required
                 />
              </div>
            ))}
          </div>
        </div>
        
        {/* API Key */}
        <div>
          <label className="block text-lg font-bold font-display text-gray-700 mb-3">Gemini API Key</label>
          <div className="bg-gray-50 p-4 rounded-lg border">
            {currentKey ? (
              <div className="flex items-center justify-between">
                <p className="text-gray-700 font-medium">
                  Key stored: <code className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-md">****...{currentKey.slice(-4)}</code>
                </p>
                <button type="button" onClick={handleClearKey} className="text-sm bg-red-100 text-red-700 font-semibold py-1 px-3 rounded-md hover:bg-red-200">
                  Clear Key
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <KeyIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your Google Gemini API Key"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
                <button type="button" onClick={handleSaveKey} disabled={!apiKeyInput} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
                  Save
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Required for AI-powered features. Your key is stored in session storage and never sent to our servers.</p>
          </div>
        </div>


        {/* Scenario Generation */}
        <div>
            <label className="block text-lg font-bold font-display text-gray-700 mb-3">Scenario Engine</label>
            <div className={`relative flex w-full rounded-lg bg-gray-200 p-1 ${!currentKey ? 'opacity-60' : ''}`}>
                <div 
                  className={`absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-md transition-transform duration-300 ease-in-out ${settings.scenarioSource === 'pregenerated' ? 'translate-x-full' : 'translate-x-0'}`}
                  style={{ transform: `translateX(${settings.scenarioSource === 'pregenerated' ? '100%' : '0'})` }}
                ></div>
                <button
                    type="button"
                    onClick={() => setSettings(prev => ({...prev, scenarioSource: 'dynamic'}))}
                    className="relative w-1/2 py-2 text-center font-semibold text-sm z-10 disabled:cursor-not-allowed"
                    disabled={!currentKey}
                >
                    On-the-fly (AI)
                </button>
                <button
                    type="button"
                    onClick={() => setSettings(prev => ({...prev, scenarioSource: 'pregenerated'}))}
                    className="relative w-1/2 py-2 text-center font-semibold text-sm z-10"
                >
                    Use Pregenerated
                </button>
            </div>
             <div className="text-center mt-4">
                <button type="button" onClick={onCustomize} className="text-orange-600 hover:text-orange-800 font-semibold hover:underline">
                    Customize Scenarios...
                </button>
             </div>
        </div>

        {/* Initial Resources */}
        <div>
          <label className="block text-lg font-bold font-display text-gray-700 mb-3">Initial Resources</label>
          <div className="space-y-4">
            {questConfig.resources.map(resource => (
                <div key={resource.name} className="flex items-center space-x-4">
                   <label htmlFor={`initial-${resource.name}`} className="w-24 font-semibold text-gray-600">{resource.name}:</label>
                   <input
                     id={`initial-${resource.name}`}
                     type="range"
                     min="20"
                     max="200"
                     step="10"
                     value={settings.initialResources[resource.name]}
                     onChange={e => handleResourceChange(resource.name, parseInt(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                     style={{ accentColor: resource.barColor.startsWith('bg-') ? undefined : resource.barColor }}
                   />
                   <span className="font-bold text-lg w-12 text-right">{settings.initialResources[resource.name]}</span>
                </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
            <button
                type="submit"
                className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-lg shadow-lg text-xl
                           hover:bg-green-600 disabled:bg-gray-400
                           transition-all duration-300 transform hover:scale-105"
            >
                Start Game
            </button>
        </div>
      </form>
    </div>
  );
};
