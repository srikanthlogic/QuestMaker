
import React, { useState, useCallback, useEffect } from 'react';
import type { QuestConfig, ResourceDefinition, BoardLocation, ScenariosByLocation, AiProviderSettings } from '../types';
import { enhanceQuestIdea, generateQuestOutline, generatePregeneratedScenarios } from '../services/aiService';
import { BoardLocationType } from '../types';
import { settingsService } from '../services/settingsService';
import { useTranslation } from '../services/i18n';
import { getLocalizedString } from '../utils/localization';

interface QuestMakerWizardProps {
    onLoadQuest: (questConfig: QuestConfig) => void;
    onExit: () => void;
}

type WizardStep = 1 | 2 | 3 | 'GENERATING_SCENARIOS' | 4;

const QuestMakerWizard: React.FC<QuestMakerWizardProps> = ({ onLoadQuest, onExit }) => {
    const { t, language } = useTranslation();
    const [step, setStep] = useState<WizardStep>(1);
    const [idea, setIdea] = useState('');
    const [numLocations, setNumLocations] = useState(20);
    const [numScenarios, setNumScenarios] = useState(1);
    const [positivity, setPositivity] = useState(0.5);
    const [groundingInReality, setGroundingInReality] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);
    const [scenarioProgress, setScenarioProgress] = useState(0);
    const [currentScenarioGen, setCurrentScenarioGen] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [draftQuest, setDraftQuest] = useState<QuestConfig | null>(null);
    const [aiSettings, setAiSettings] = useState<AiProviderSettings | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const settings = settingsService.getAiSettings();
        setAiSettings(settings);
    }, []);

    const handleEnhanceIdea = useCallback(async () => {
        if (!idea) {
            setError('Please enter an idea to enhance.');
            return;
        }
        setIsEnhancing(true);
        setError(null);
        try {
            const enhancedIdea = await enhanceQuestIdea(idea);
            setIdea(enhancedIdea);
        } catch (e: any) {
            console.error(e);
            setError(`Failed to enhance idea. An API error occurred: ${e.message}. Please check your API settings and see console for details.`);
        } finally {
            setIsEnhancing(false);
        }
    }, [idea]);

    const handleGenerateOutline = useCallback(async () => {
        if (!idea) {
            setError('Please enter an idea for your quest.');
            return;
        }
        if (numLocations % 4 !== 0 || numLocations < 8) {
            setError('Number of locations must be a multiple of 4 and at least 8.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const quest = await generateQuestOutline(idea, numLocations, positivity, groundingInReality);
            setDraftQuest(quest);
            setStep(2);
        } catch (e: any) {
            console.error(e);
            setError(`Failed to generate quest. An API error occurred: ${e.message}. Please check your API settings and see console for details.`);
        } finally {
            setIsLoading(false);
        }
    }, [idea, numLocations, positivity, groundingInReality]);

    const handleGenerateScenarios = async () => {
        if (!draftQuest || numScenarios < 1) {
            setStep(4);
            return;
        }
        
        setIsLoadingScenarios(true);
        setScenarioProgress(0);
        setError(null);
        setStep('GENERATING_SCENARIOS');

        const locationsToGenerateFor = draftQuest.board.locations.filter(
            loc => loc.type === BoardLocationType.PROPERTY || loc.type === BoardLocationType.UTILITY
        );
        const total = locationsToGenerateFor.length;
        let generatedCount = 0;
        const allGeneratedScenarios: ScenariosByLocation = {...(draftQuest.pregeneratedScenarios || {})};

        for (const location of locationsToGenerateFor) {
            const locationName = getLocalizedString(location.name, language);
            setCurrentScenarioGen(locationName);
            try {
                const scenarios = await generatePregeneratedScenarios(draftQuest, location, numScenarios);
                if (scenarios.length > 0) {
                    allGeneratedScenarios[location.name.en] = scenarios;
                }
            } catch(e: any) {
                console.error(`Failed to generate scenarios for ${locationName}`, e);
                setError(`Could not generate scenarios for "${locationName}": ${e.message}. Skipping.`);
            }
            generatedCount++;
            setScenarioProgress(Math.round((generatedCount / total) * 100));
        }

        setDraftQuest(prev => prev ? ({ ...prev, pregeneratedScenarios: allGeneratedScenarios }) : null);
        setIsLoadingScenarios(false);
        setCurrentScenarioGen('');
        setStep(4);
    };

    const handleUpdateField = <T extends keyof QuestConfig>(field: T, value: QuestConfig[T]) => {
        if (draftQuest) {
            setDraftQuest({ ...draftQuest, [field]: value });
        }
    };

    const handleUpdateResource = (index: number, value: ResourceDefinition) => {
        if (draftQuest) {
            const newResources = [...draftQuest.resources];
            newResources[index] = value;
            handleUpdateField('resources', newResources);
        }
    };
    
    const handleUpdateLocation = (index: number, value: BoardLocation) => {
         if (draftQuest && draftQuest.board) {
            const newLocations = [...draftQuest.board.locations];
            newLocations[index] = value;
            handleUpdateField('board', {...draftQuest.board, locations: newLocations});
        }
    };

    const handleNumberChange = (value: string): number | undefined => {
        if (value === '') return undefined;
        const num = parseInt(value, 10);
        return isNaN(num) ? undefined : num;
    };

    const downloadJson = () => {
        if (!draftQuest) return;
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(draftQuest, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `${getLocalizedString(draftQuest.name, 'en').toLowerCase().replace(/\s/g, '-')}-quest.json`;
        link.click();
    };

    const handleCopyJson = () => {
        if (!draftQuest) return;
        const jsonString = JSON.stringify(draftQuest, null, 2);
        navigator.clipboard.writeText(jsonString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }, (err) => {
            console.error('Failed to copy text: ', err);
            setError('Could not copy JSON to clipboard. See console for details.');
        });
    };
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-orange-400 mb-2">{t('step1Title')}</h2>
                        <p className="text-gray-400 mb-4">{t('step1Description')}</p>
                        <div className="relative">
                            <textarea
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                className="w-full h-40 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition pr-28"
                                placeholder={t('ideaPlaceholder')}
                            />
                            <button 
                                onClick={handleEnhanceIdea}
                                disabled={isEnhancing || isLoading}
                                className="absolute top-3 right-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg text-sm transition flex items-center gap-2"
                                title={t('enhanceTooltip')}
                            >
                                {isEnhancing ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                )}
                                <span>{t('enhance')}</span>
                            </button>
                        </div>
                         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="num-locations" className="block text-sm font-medium text-gray-400">{t('boardLocations')}</label>
                                <input type="number" id="num-locations" value={numLocations} onChange={(e) => setNumLocations(parseInt(e.target.value, 10) || 0)}
                                    className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md" placeholder="e.g., 20" step="4" min="8" />
                                <p className="text-xs text-gray-500 mt-1">{t('boardLocationsHint')}</p>
                            </div>
                            <div>
                                <label htmlFor="num-scenarios" className="block text-sm font-medium text-gray-400">{t('scenariosPerLocation')}</label>
                                <input type="number" id="num-scenarios" value={numScenarios} onChange={(e) => setNumScenarios(parseInt(e.target.value, 10) || 0)}
                                    className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md" min="0" max="3" />
                                <p className="text-xs text-gray-500 mt-1">{t('scenariosPerLocationHint')}</p>
                            </div>
                        </div>
                         <div className="mt-4">
                            <label htmlFor="positivity" className="block text-sm font-medium text-gray-400">{t('positivityTone')} ({positivity})</label>
                            <input type="range" id="positivity" min="0" max="1" step="0.1" value={positivity} onChange={e => setPositivity(parseFloat(e.target.value))}
                                className="mt-1 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{t('dystopian')}</span>
                                <span>{t('optimistic')}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center space-x-3 bg-gray-900 p-3 rounded-md">
                            <input
                                id="grounding"
                                type="checkbox"
                                checked={groundingInReality}
                                onChange={(e) => setGroundingInReality(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                                <label htmlFor="grounding" className="font-medium text-gray-200">{t('groundInReality')}</label>
                                <p className="text-xs text-gray-400">{t('groundInRealityHint')}</p>
                                <p className="text-xs text-gray-500 mt-1">{t('groundInRealityModelHint')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleGenerateOutline}
                            disabled={isLoading || isEnhancing}
                            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition"
                        >
                            {isLoading ? t('generating') : t('generateOutline')}
                        </button>
                    </div>
                );
            case 2:
                if (!draftQuest) return null;
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-orange-400 mb-4">{t('step2Title')}</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">{t('questName')}</label>
                                <input type="text" value={getLocalizedString(draftQuest.name, language)} onChange={(e) => handleUpdateField('name', {...draftQuest.name, [language]: e.target.value })} className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">{t('description')}</label>
                                <input type="text" value={getLocalizedString(draftQuest.description, language)} onChange={(e) => handleUpdateField('description', {...draftQuest.description, [language]: e.target.value })} className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400">{t('positivityTone')} ({draftQuest.positivity?.toFixed(1)})</label>
                                <input type="range" min="0" max="1" step="0.1" value={draftQuest.positivity || 0.5} 
                                    onChange={e => handleUpdateField('positivity', parseFloat(e.target.value))}
                                    className="mt-1 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{t('dystopian')}</span>
                                    <span>{t('optimistic')}</span>
                                </div>
                            </div>

                             <div className="flex items-center space-x-3 bg-gray-900 p-3 rounded-md">
                                <input
                                    id="grounding-refine"
                                    type="checkbox"
                                    checked={!!draftQuest.groundingInReality}
                                    onChange={(e) => handleUpdateField('groundingInReality', e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <label htmlFor="grounding-refine" className="font-medium text-gray-200">{t('groundInReality')}</label>
                                    <p className="text-xs text-gray-400">{t('groundInRealityHint')}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('resources')}</h3>
                                <div className="space-y-4">
                                    {draftQuest.resources.map((res, i) => (
                                        <div key={i} className="p-3 bg-gray-800 rounded-md space-y-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <input type="text" value={getLocalizedString(res.name, language)} onChange={e => handleUpdateResource(i, {...res, name: {...res.name, [language]: e.target.value}})} className="p-2 bg-gray-900 border border-gray-600 rounded-md" placeholder={t('resourceName')} />
                                                <input type="text" value={res.barColor} onChange={e => handleUpdateResource(i, {...res, barColor: e.target.value})} className="p-2 bg-gray-900 border border-gray-600 rounded-md" placeholder={t('barColor')}/>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-400">{t('min')}</label>
                                                    <input type="number" value={res.minimumValue ?? ''} onChange={e => handleUpdateResource(i, {...res, minimumValue: handleNumberChange(e.target.value)})} className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">{t('initial')}</label>
                                                    <input type="number" value={res.initialValue} onChange={e => handleUpdateResource(i, {...res, initialValue: parseInt(e.target.value, 10) || 0})} className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">{t('max')}</label>
                                                    <input type="number" value={res.maximumValue ?? ''} onChange={e => handleUpdateResource(i, {...res, maximumValue: handleNumberChange(e.target.value)})} className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setStep(3)} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg">{t('nextEditBoard')}</button>
                    </div>
                );
            case 3:
                if (!draftQuest) return null;
                 return (
                    <div>
                        <h2 className="text-2xl font-bold text-orange-400 mb-4">{t('step3Title')}</h2>
                        <div className="space-y-2 h-[50vh] overflow-y-auto pr-2">
                             {draftQuest.board.locations.map((loc, i) => (
                                <div key={i} className="p-3 bg-gray-800 rounded-md">
                                    <p className="font-bold">{i}: {loc.type}</p>
                                    <input type="text" value={getLocalizedString(loc.name, language)} onChange={e => handleUpdateLocation(i, {...loc, name: {...loc.name, [language]: e.target.value}})} className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md" placeholder={t('locationName')} />
                                </div>
                            ))}
                        </div>
                        <button onClick={handleGenerateScenarios} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg">{t('nextGenerateScenarios')}</button>
                    </div>
                 );
            case 'GENERATING_SCENARIOS':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-orange-400 mb-4 animate-pulse">{t('writingStories')}</h2>
                        <p className="text-gray-400 mb-4">{t('writingStoriesDescription', { numScenarios: numScenarios })}</p>
                        <div className="w-full bg-gray-700 rounded-full h-4 my-4">
                            <div className="bg-green-500 h-4 rounded-full transition-all duration-500" style={{ width: `${scenarioProgress}%` }}></div>
                        </div>
                        <p className="text-center text-gray-300">{scenarioProgress}{t('percentComplete')}</p>
                        {currentScenarioGen && <p className="text-center text-sm text-gray-500 mt-2">{t('craftingStoriesFor', { locationName: currentScenarioGen })}</p>}
                    </div>
                );
            case 4:
                if (!draftQuest) return null;
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-orange-400 mb-4">{t('step4Title')}</h2>
                        <textarea
                            readOnly
                            value={JSON.stringify(draftQuest, null, 2)}
                            className="w-full h-64 p-3 bg-gray-900 border border-gray-600 rounded-lg font-mono text-sm"
                        />
                        <div className="mt-4 flex flex-col sm:flex-row gap-4">
                            <button onClick={downloadJson} className="w-full sm:w-auto flex-grow bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition">{t('downloadJson')}</button>
                             <button onClick={handleCopyJson} className="w-full sm:w-auto flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
                                {isCopied ? t('copied') : t('copyJson')}
                             </button>
                            <button onClick={() => onLoadQuest(draftQuest)} className="w-full sm:w-auto flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition">{t('loadAndPlay')}</button>
                        </div>
                    </div>
                );
        }
    };
    
    const getPreviousStep = () => {
        if (step === 4) return 3;
        if (step === 3) return 2;
        if (step === 2) return 1;
        return 1;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold">{t('wizardTitle')}</h1>
                    <button onClick={onExit} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md mb-4">{error}</div>}
                    {renderStep()}
                </div>
                 {typeof step === 'number' && step > 1 && (
                    <div className="p-4 border-t border-gray-700 mt-auto">
                        <button onClick={() => setStep(getPreviousStep())} className="text-sm text-gray-400 hover:text-white">{t('back')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestMakerWizard;
