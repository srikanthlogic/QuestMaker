
import React, { useState, useCallback, useEffect } from 'react';
import type { QuestConfig, Player, GamePhase, ManagedScenario, Choice, ChanceCard, BoardLocation, ResourceChange, AppStats, LanguageCode } from './types';
import { BoardLocationType } from './types';
import { DEFAULT_QUESTS, DOC_LINKS, SettingsIcon } from './constants';
import GameBoard from './components/GameBoard';
import QuestMakerWizard from './components/QuestMakerWizard';
import { generateDynamicScenario } from './services/aiService';
import { statsService, STATS_UPDATED_EVENT } from './services/statsService';
import { aiConnectivityService, CONNECTIVITY_UPDATED_EVENT } from './services/aiConnectivityService';
import Drawer from './components/Drawer';
import DocsPage from './components/DocsPage';
import SettingsDrawer from './components/SettingsDrawer';
import PlayerDashboard from './components/PlayerDashboard';
import ActionPanel from './components/ActionPanel';
import AIAuditLogDrawer from './components/AIAuditLogDrawer';
import StatusBar from './components/StatusBar';
import { useTranslation } from './services/i18n';
import { getLocalizedString } from './utils/localization';

const CUSTOM_QUESTS_STORAGE_KEY = 'questcraft-custom-quests';

const getCustomQuestsFromStorage = (): QuestConfig[] => {
    try {
        const questsJson = localStorage.getItem(CUSTOM_QUESTS_STORAGE_KEY);
        return questsJson ? JSON.parse(questsJson) : [];
    } catch (e) {
        console.error("Failed to parse custom quests from localStorage", e);
        return [];
    }
};

const saveCustomQuestsToStorage = (quests: QuestConfig[]) => {
    try {
        localStorage.setItem(CUSTOM_QUESTS_STORAGE_KEY, JSON.stringify(quests));
    } catch (e) {
        console.error("Failed to save custom quests to localStorage", e);
    }
};

const App: React.FC = () => {
    const [view, setView] = useState<'welcome' | 'game' | 'maker' | 'docs'>('welcome');
    const [questConfig, setQuestConfig] = useState<QuestConfig | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [gamePhase, setGamePhase] = useState<GamePhase>('WELCOME');
    const [diceResult, setDiceResult] = useState<[number, number] | null>(null);
    const [activeScenario, setActiveScenario] = useState<ManagedScenario | null>(null);
    const [activeChoiceOutcome, setActiveChoiceOutcome] = useState<Choice['outcome'] | null>(null);
    const [activeCard, setActiveCard] = useState<ChanceCard | null>(null);
    const [activeLocation, setActiveLocation] = useState<BoardLocation | null>(null);
    const [jsonInput, setJsonInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [numPlayers, setNumPlayers] = useState(2);
    const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
    const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
    const [showAuditLogDrawer, setShowAuditLogDrawer] = useState(false);
    const [openDrawerContent, setOpenDrawerContent] = useState<{title: string, content: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [customQuests, setCustomQuests] = useState<QuestConfig[]>([]);
    const [appStats, setAppStats] = useState<AppStats>(statsService.getStats());
    const [isAiConnected, setIsAiConnected] = useState(aiConnectivityService.isConnected());
    const { t, language } = useTranslation();

     useEffect(() => {
        setCustomQuests(getCustomQuestsFromStorage());
        
        const handleStatsUpdate = () => setAppStats(statsService.getStats());
        const handleConnectivityUpdate = () => setIsAiConnected(aiConnectivityService.isConnected());

        window.addEventListener(STATS_UPDATED_EVENT, handleStatsUpdate);
        window.addEventListener(CONNECTIVITY_UPDATED_EVENT, handleConnectivityUpdate);
        return () => {
            window.removeEventListener(STATS_UPDATED_EVENT, handleStatsUpdate);
            window.removeEventListener(CONNECTIVITY_UPDATED_EVENT, handleConnectivityUpdate);
        };
    }, []);
    
    useEffect(() => {
        let timerId: number | undefined;
        const isGameActive = view === 'game' && gamePhase !== 'SETUP' && gamePhase !== 'WELCOME' && gamePhase !== 'GAME_OVER';

        if (isGameActive) {
            timerId = window.setInterval(() => {
                statsService.incrementTimePlayed();
            }, 1000);
        }

        return () => clearInterval(timerId);
    }, [view, gamePhase]);

    const resetGameState = () => {
        setQuestConfig(null);
        setPlayers([]);
        setCurrentPlayerIndex(0);
        setGamePhase('WELCOME');
        setView('welcome');
        setJsonError('');
        setJsonInput('');
        setUrlInput('');
    };

    const initializePlayers = useCallback((config: QuestConfig, count: number, names: string[]) => {
        const initialPlayers: Player[] = Array.from({ length: count }, (_, i) => ({
            id: i,
            name: names[i]?.trim() || `${t('player')} ${i + 1}`,
            color: config.playerColors[i % config.playerColors.length],
            position: 0,
            resources: config.resources.reduce((acc, resource) => {
                acc[getLocalizedString(resource.name, 'en').toLowerCase()] = resource.initialValue;
                return acc;
            }, {} as Record<string, number>),
            inJail: false,
            jailTurns: 0,
            isBankrupt: false,
        }));
        setPlayers(initialPlayers);
    }, [t]);

    const loadQuest = useCallback((config: QuestConfig, fromUserAction: boolean = false) => {
        if (fromUserAction) {
            const newQuests = getCustomQuestsFromStorage();
            const questName = getLocalizedString(config.name, 'en');
            const existingIndex = newQuests.findIndex(q => getLocalizedString(q.name, 'en') === questName);
            if (existingIndex > -1) {
                newQuests[existingIndex] = config;
            } else {
                newQuests.push(config);
            }
            saveCustomQuestsToStorage(newQuests);
            setCustomQuests(newQuests);
        }
        setQuestConfig(config);
        setGamePhase('SETUP');
        setView('game');
    }, []);

    const handleLoadFromUrl = useCallback(async () => {
        if (!urlInput) {
            setJsonError('Please paste a URL.');
            return;
        }
    
        setIsLoading(true);
        setJsonError('');
    
        try {
            let questConfigUrl = urlInput;
    
            // Check for Gist URL and resolve to raw URL if it is one
            const gistIdMatch = urlInput.match(/(?:https?:\/\/)?gist\.github\.com\/(?:[^\/]+\/)?([a-f0-9]+)/);
            if (gistIdMatch && gistIdMatch[1]) {
                const gistId = gistIdMatch[1];
                const apiResponse = await fetch(`https://api.github.com/gists/${gistId}`);
                if (!apiResponse.ok) {
                    throw new Error(`GitHub API error! status: ${apiResponse.status}`);
                }
                const gistData = await apiResponse.json();
                
                const jsonFile = Object.values(gistData.files).find((file: any) => file.filename.endsWith('.json')) as { raw_url: string } | undefined;
    
                if (!jsonFile || !jsonFile.raw_url) {
                    throw new Error('No .json file found in this Gist.');
                }
                questConfigUrl = jsonFile.raw_url;
            }
    
            // Fetch from either the direct URL or the resolved Gist raw URL
            const questResponse = await fetch(questConfigUrl);
            if (!questResponse.ok) {
                throw new Error(`Failed to fetch quest from URL: ${questResponse.status}`);
            }
            const config = await questResponse.json();
            
            if (config.name && config.board && config.resources) {
                loadQuest(config, true);
                setJsonError('');
            } else {
                throw new Error('Invalid quest format from URL. Missing required fields.');
            }
    
        } catch (e: any) {
            console.error(e);
            setJsonError(`Failed to load quest from URL: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [urlInput, loadQuest]);
    
    const handleStartGame = () => {
        if (questConfig) {
            initializePlayers(questConfig, numPlayers, playerNames);
            setGamePhase('TURN_START');
        }
    };

    const handleLoadQuestFromFile = async (filePath: string) => {
        setIsLoading(true);
        setJsonError('');
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const config = await response.json();
            loadQuest(config, false); // Not a user action, so don't save
        } catch (e) {
            console.error(e);
            setJsonError(`Failed to load quest from ${filePath}.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleJsonLoad = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (parsed.name && parsed.board && parsed.resources) {
                loadQuest(parsed, true);
                setJsonError('');
            } else {
                setJsonError('Invalid quest format. Missing required fields.');
            }
        } catch (error) {
            setJsonError('Invalid JSON. Please check the syntax.');
        }
    };
    
     const handleNumPlayersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const count = parseInt(e.target.value, 10);
        setNumPlayers(count);
        setPlayerNames(prev => {
            const newNames = Array.from({ length: count }, (_, i) => prev[i] || `${t('player')} ${i + 1}`);
            return newNames;
        });
    };

    const handlePlayerNameChange = (index: number, name: string) => {
        setPlayerNames(prev => {
            const newNames = [...prev];
            newNames[index] = name;
            return newNames;
        });
    };

    const nextTurn = useCallback(() => {
        setActiveScenario(null);
        setActiveChoiceOutcome(null);
        setActiveCard(null);
        setActiveLocation(null);

        const activePlayersCount = players.filter(p => !p.isBankrupt).length;
        if (activePlayersCount <= 1) {
            setGamePhase('GAME_OVER');
            return;
        }

        let nextIndex = (currentPlayerIndex + 1) % players.length;
        while (players[nextIndex]?.isBankrupt) {
            nextIndex = (nextIndex + 1) % players.length;
        }
        
        setCurrentPlayerIndex(nextIndex);
        setGamePhase('TURN_START');
    }, [currentPlayerIndex, players]);

    const applyResourceChanges = useCallback((changes: ResourceChange[]) => {
        setPlayers(prevPlayers => {
            const newPlayers = JSON.parse(JSON.stringify(prevPlayers));
            const player = newPlayers[currentPlayerIndex];
            if (!player || !questConfig) return newPlayers;

            let changesArray: ResourceChange[];

            if (Array.isArray(changes)) {
                changesArray = changes;
            } else if (changes && typeof changes === 'object') {
                const changesAsObject = changes as any;
                changesArray = Object.entries(changesAsObject).map(([name, value]) => ({
                    name: String(name),
                    value: Number(value),
                }));
            } else {
                console.error("Invalid resourceChanges format received:", changes);
                return newPlayers;
            }

            for (const change of changesArray) {
                const resourceName = change.name.toLowerCase();
                const resourceDef = questConfig.resources.find(r => getLocalizedString(r.name, 'en').toLowerCase() === resourceName);

                if (player.resources[resourceName] !== undefined && resourceDef) {
                    let newValue = player.resources[resourceName] + change.value;
                    
                    if (resourceDef.maximumValue !== undefined) {
                        newValue = Math.min(newValue, resourceDef.maximumValue);
                    }
                    player.resources[resourceName] = newValue;
                }
            }

            const isBankrupt = questConfig.resources.some(resourceDef => {
                const resourceName = getLocalizedString(resourceDef.name, 'en').toLowerCase();
                const playerResourceValue = player.resources[resourceName];
                const minimumValue = resourceDef.minimumValue ?? 0;
                return playerResourceValue <= minimumValue;
            });
            
            if (isBankrupt && !player.isBankrupt) {
                player.isBankrupt = true;
                const activePlayers = newPlayers.filter((p: Player) => !p.isBankrupt);
                if (activePlayers.length <= 1) {
                    setTimeout(() => setGamePhase('GAME_OVER'), 100);
                }
            }
            return newPlayers;
        });
    }, [currentPlayerIndex, questConfig]);
    
    const triggerDynamicScenario = useCallback(async (location: BoardLocation) => {
        if (!questConfig) return;
        setGamePhase('GENERATING_SCENARIO');
        try {
            const dynamicScenario = await generateDynamicScenario(questConfig, players[currentPlayerIndex], location);
            setActiveScenario(dynamicScenario);
            setGamePhase('SCENARIO_CHOICE');
        } catch (error) {
            console.error("Failed to generate dynamic scenario:", error);
            
            const locationNameEn = getLocalizedString(location.name, 'en');
            const pregenScenarios = questConfig.pregeneratedScenarios?.[locationNameEn];

            if (pregenScenarios && pregenScenarios.length > 0) {
                alert(`Failed to generate a dynamic event: ${error instanceof Error ? error.message : String(error)}. Falling back to a pre-written story scenario.`);
                const scenario = pregenScenarios[Math.floor(Math.random() * pregenScenarios.length)];
                setActiveScenario(scenario);
                setGamePhase('SCENARIO_CHOICE');
            } else {
                alert(`Failed to generate dynamic scenario: ${error instanceof Error ? error.message : String(error)}. No pre-written scenarios available for this location. Skipping turn.`);
                nextTurn();
            }
        }
    }, [questConfig, players, currentPlayerIndex, nextTurn]);

     const handleLocationAction = useCallback(async (location: BoardLocation) => {
        if (!questConfig) return;

        switch (location.type) {
            case BoardLocationType.PROPERTY:
            case BoardLocationType.UTILITY:
                const locationNameEn = getLocalizedString(location.name, 'en');
                const pregenScenarios = questConfig.pregeneratedScenarios?.[locationNameEn];
                const hasPregen = pregenScenarios && pregenScenarios.length > 0;
                
                if (questConfig.groundingInReality || !hasPregen) {
                    await triggerDynamicScenario(location);
                } else {
                    setActiveLocation(location);
                    setGamePhase('SCENARIO_SOURCE_SELECTION');
                }
                break;
            case BoardLocationType.CHANCE:
                 if (questConfig.chanceCards.length > 0) {
                    const card = questConfig.chanceCards[Math.floor(Math.random() * questConfig.chanceCards.length)];
                    setActiveCard(card);
                    if(card.resourceChanges) applyResourceChanges(card.resourceChanges);
                    setGamePhase('CHANCE_CARD');
                } else {
                     nextTurn();
                }
                break;
            case BoardLocationType.COMMUNITY_CHEST:
                if (questConfig.communityChestCards && questConfig.communityChestCards.length > 0) {
                    const card = questConfig.communityChestCards[Math.floor(Math.random() * questConfig.communityChestCards.length)];
                    setActiveCard(card);
                    if(card.resourceChanges) applyResourceChanges(card.resourceChanges);
                    setGamePhase('COMMUNITY_CHEST_CARD');
                } else {
                    nextTurn();
                }
                break;
            case BoardLocationType.GO_TO_JAIL:
                setPlayers(ps => ps.map((p, i) => i === currentPlayerIndex ? { ...p, position: questConfig.board.jailPosition, inJail: true, jailTurns: 0 } : p));
                 setTimeout(nextTurn, 500);
                break;
            case BoardLocationType.TAX:
                 applyResourceChanges([{ name: 'money', value: -100 }]); // This might need localization if 'money' is not always the resource name
                 setTimeout(nextTurn, 500);
                 break;
            default:
                setTimeout(nextTurn, 500);
        }
    }, [questConfig, applyResourceChanges, nextTurn, currentPlayerIndex, triggerDynamicScenario]);

    const handleRollDice = useCallback(() => {
        if (gamePhase !== 'TURN_START' || !questConfig) return;

        setGamePhase('DICE_ROLL');
        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;
        setDiceResult([roll1, roll2]);

        setTimeout(() => {
            setGamePhase('PLAYER_MOVE');
            const totalRoll = roll1 + roll2;
            const currentPlayer = players[currentPlayerIndex];
            const newPosition = (currentPlayer.position + totalRoll) % questConfig.board.locations.length;
            
            setPlayers(ps => ps.map((p, i) => i === currentPlayerIndex ? { ...p, position: newPosition } : p));
            
            setTimeout(() => {
                const location = questConfig.board.locations[newPosition];
                handleLocationAction(location);
            }, 500);
        }, 500);
    }, [gamePhase, players, currentPlayerIndex, questConfig, handleLocationAction]);
    
    const handleScenarioChoice = useCallback((choice: Choice) => {
        setActiveChoiceOutcome(choice.outcome);
        applyResourceChanges(choice.outcome.resourceChanges);
        setGamePhase('SCENARIO_OUTCOME');
    }, [applyResourceChanges]);

    const handleSelectScenarioSource = useCallback(async (source: 'pregen' | 'dynamic') => {
        if (!activeLocation || !questConfig) return;
        
        const locationNameEn = getLocalizedString(activeLocation.name, 'en');

        if (source === 'pregen') {
            const pregenScenarios = questConfig.pregeneratedScenarios?.[locationNameEn];
            if (pregenScenarios && pregenScenarios.length > 0) {
                const scenario = pregenScenarios[Math.floor(Math.random() * pregenScenarios.length)];
                setActiveScenario(scenario);
                setGamePhase('SCENARIO_CHOICE');
            } else {
                nextTurn(); // Fallback
            }
        } else if (source === 'dynamic') {
            await triggerDynamicScenario(activeLocation);
        }
        setActiveLocation(null);
    }, [activeLocation, questConfig, nextTurn, triggerDynamicScenario]);
    
    const handleDeleteQuest = (questName: string) => {
        if (window.confirm(`Are you sure you want to delete the quest "${questName}"? This cannot be undone.`)) {
            const newQuests = customQuests.filter(q => getLocalizedString(q.name, 'en') !== questName);
            saveCustomQuestsToStorage(newQuests);
            setCustomQuests(newQuests);
        }
    };

    const openQuestMaker = () => {
        setView('maker');
    };

    const renderWelcomeScreen = () => (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold text-orange-400 font-mono">{t('questCraftTitle')}</h1>
                <p className="text-gray-400 mt-2 max-w-2xl">{t('questCraftDescription')}</p>
            </div>

            <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 relative">
                 <button 
                    onClick={() => setShowSettingsDrawer(true)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label={t('openSettings')}
                >
                    <SettingsIcon className="w-6 h-6" />
                </button>
                 {isLoading && <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center rounded-2xl z-10"><p className="text-white text-lg animate-pulse">{t('loadingQuest')}</p></div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Side: Play */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-2xl font-bold text-white">{t('playAQuest')}</h2>
                        <div className="space-y-3 h-48 overflow-y-auto pr-2">
                             {customQuests.map(quest => (
                                <button key={getLocalizedString(quest.name, 'en')} onClick={() => loadQuest(quest, false)} className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">{getLocalizedString(quest.name, language)}</h3>
                                        <span className="text-xs font-medium bg-purple-600 text-white px-2 py-1 rounded-full">{t('custom')}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{getLocalizedString(quest.description, language)}</p>
                                </button>
                            ))}
                            {DEFAULT_QUESTS.map(quest => (
                                <button key={quest.id} onClick={() => handleLoadQuestFromFile(quest.filePath)} className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                                    <h3 className="font-semibold text-lg">{quest.name}</h3>
                                    <p className="text-sm text-gray-400">{quest.description}</p>
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-gray-700 pt-4 space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{t('loadFromUrl')}</h3>
                                <div className="flex gap-2">
                                     <input
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        className="flex-grow p-2 bg-gray-900 border border-gray-600 rounded-lg font-mono text-sm"
                                        placeholder={t('urlPlaceholder')}
                                    />
                                    <button onClick={handleLoadFromUrl} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{t('load')}</button>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{t('orPasteJson')}</h3>
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    className="w-full h-24 p-2 bg-gray-900 border border-gray-600 rounded-lg font-mono text-sm"
                                    placeholder={t('jsonPlaceholder')}
                                />
                                <button onClick={handleJsonLoad} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">{t('loadFromJson')}</button>
                            </div>
                             {jsonError && <p className="text-red-400 text-sm mt-1">{jsonError}</p>}
                        </div>
                    </div>
                    {/* Right Side: Create & Learn */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">{t('createAndLearn')}</h2>
                         <button onClick={openQuestMaker} className="w-full text-left p-4 bg-green-800/50 hover:bg-green-700/50 rounded-lg transition">
                            <h3 className="font-semibold text-lg">{t('createNewQuest')}</h3>
                            <p className="text-sm text-gray-400">{t('createNewQuestDescription')}</p>
                        </button>
                        <button onClick={() => setView('docs')} className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                            <h3 className="font-semibold text-lg">{t('readTheDocs')}</h3>
                            <p className="text-sm text-gray-400">{t('readTheDocsDescription')}</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderGameSetup = () => (
         <div className="min-h-screen flex items-center justify-center p-4">
             <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8">
                 <h2 className="text-3xl font-bold mb-2 text-center">{getLocalizedString(questConfig?.name, language)}</h2>
                 <p className="text-gray-400 mb-6 text-center">{getLocalizedString(questConfig?.description, language)}</p>
                 
                 <div className="mb-6">
                     <label htmlFor="numPlayers" className="block text-lg font-medium text-gray-300 mb-2">{t('howManyPlayers')}</label>
                     <select id="numPlayers" value={numPlayers} onChange={handleNumPlayersChange} className="bg-gray-700 text-white p-3 rounded-lg w-full">
                         <option value="2">{t('2players')}</option>
                         <option value="3">{t('3players')}</option>
                         <option value="4">{t('4players')}</option>
                     </select>
                 </div>

                 <div className="mb-8 space-y-3">
                    <h3 className="text-lg font-medium text-gray-300">{t('playerNames')}</h3>
                    {Array.from({ length: numPlayers }).map((_, i) => (
                        <input
                            key={i}
                            type="text"
                            value={playerNames[i] || ''}
                            onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                            placeholder={`${t('player')} ${i + 1}`}
                            className="bg-gray-700 text-white p-3 rounded-lg w-full"
                        />
                    ))}
                </div>

                 <button onClick={handleStartGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition">
                     {t('startGame')}
                 </button>
                 <button onClick={resetGameState} className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition">
                     {t('backToMainMenu')}
                 </button>
             </div>
         </div>
    );

    const renderGameView = () => {
        if (gamePhase === 'SETUP') return renderGameSetup();

        if (!questConfig || players.length === 0) return <div>Loading...</div>;

        const currentPlayer = players[currentPlayerIndex];

        return (
            <div className="min-h-screen bg-gray-900 text-white p-2 md:p-4 flex flex-col">
                 <header className="flex justify-between items-center mb-4 px-2 md:px-4 flex-shrink-0">
                    <h1 className="text-xl md:text-2xl font-bold truncate pr-2">{getLocalizedString(questConfig.name, language)}</h1>
                    <div className="flex items-center gap-2 md:gap-4">
                         {questConfig.footerSections.map(section => (
                             <button key={getLocalizedString(section.title, 'en')} onClick={() => setOpenDrawerContent({ title: getLocalizedString(section.title, language), content: getLocalizedString(section.content, language)})} className="text-gray-300 hover:text-white text-sm hover:underline">{getLocalizedString(section.title, language)}</button>
                         ))}
                         <button onClick={() => setShowSettingsDrawer(true)} className="text-gray-300 hover:text-white" aria-label={t('openSettings')}>
                            <SettingsIcon className="w-5 h-5 md:w-6 md:h-6" />
                         </button>
                        <button onClick={resetGameState} className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition">{t('exitGame')}</button>
                    </div>
                 </header>
                <main className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Left Panel: Player Info */}
                    <div className="lg:col-span-1">
                        <PlayerDashboard
                            players={players}
                            questConfig={questConfig}
                            currentPlayer={currentPlayer}
                            language={language}
                        />
                    </div>
                    {/* Center Panel: Game Board */}
                    <div className="lg:col-span-2 flex items-center justify-center">
                        <GameBoard board={questConfig.board} players={players} questName={getLocalizedString(questConfig.name, language)} language={language}/>
                    </div>
                    {/* Right Panel: Action/Scenario */}
                    <div className="lg:col-span-1">
                         <ActionPanel
                            players={players}
                            gamePhase={gamePhase}
                            diceResult={diceResult}
                            activeScenario={activeScenario}
                            activeChoiceOutcome={activeChoiceOutcome}
                            activeCard={activeCard}
                            onRollDice={handleRollDice}
                            onScenarioChoice={handleScenarioChoice}
                            onNextTurn={nextTurn}
                            onSelectScenarioSource={handleSelectScenarioSource}
                            language={language}
                        />
                    </div>
                </main>
            </div>
        );
    };

    const renderCurrentView = () => {
        switch (view) {
            case 'game':
                return renderGameView();
            case 'maker':
                return <QuestMakerWizard onLoadQuest={(config) => loadQuest(config, true)} onExit={resetGameState} />;
            case 'docs':
                return <DocsPage onExit={() => setView('welcome')} />;
            case 'welcome':
            default:
                return renderWelcomeScreen();
        }
    };

    return (
        <>
            {renderCurrentView()}
            <StatusBar 
                stats={appStats} 
                isAiConnected={isAiConnected}
                onNavigateToDocs={() => setView('docs')}
                onOpenSettings={() => setShowSettingsDrawer(true)}
            />
            <SettingsDrawer 
                show={showSettingsDrawer}
                onClose={() => setShowSettingsDrawer(false)}
                customQuests={customQuests}
                onDeleteQuest={handleDeleteQuest}
                onViewAuditLog={() => {
                    setShowSettingsDrawer(false);
                    setShowAuditLogDrawer(true);
                }}
            />
            <AIAuditLogDrawer
                show={showAuditLogDrawer}
                onClose={() => setShowAuditLogDrawer(false)}
            />
            <Drawer
                show={!!openDrawerContent}
                title={openDrawerContent?.title || ''}
                onClose={() => setOpenDrawerContent(null)}
            >
                <div className="prose prose-invert prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white max-w-none" dangerouslySetInnerHTML={{ __html: openDrawerContent?.content || '' }} />
            </Drawer>
        </>
    );
};

export default App;
