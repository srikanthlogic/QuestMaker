import React, { useState, useCallback, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { PlayerDashboard } from './components/PlayerDashboard';
import { ScenarioCard, ChanceCard, CommunityChestCard } from './components/ScenarioCard';
import { Settings } from './components/Settings';
import { ScenarioCustomizer } from './components/ScenarioCustomizer';
import { QuestLoader } from './components/QuestLoader';
import { QuestMaker } from './components/QuestMaker';
import { Footer } from './components/Footer';
import { RulesModal } from './components/RulesModal';
import { DocsPage } from './components/DocsPage';
import { generateScenario } from './services/geminiService';
import { getApiKey } from './services/apiKeyService';
import type { Player, Scenario, GamePhase, ChoiceOutcome, ChanceCard as ChanceCardType, GameSettings, ScenariosByLocation, QuestConfig } from './types';
import { GamePhaseEnum } from './constants';
import { LoadingSpinner, WinnerIcon, CogIcon, RestartIcon, BookOpenIcon } from './components/Icons';

type View = 'loader' | 'setup' | 'customize' | 'game' | 'maker';
const LOCAL_STORAGE_KEY_PREFIX = 'questCraftCustomScenarios_';

interface AppProps {
  onNavigate: (path: string) => void;
}

const App: React.FC<AppProps> = ({ onNavigate }) => {
  const [questConfig, setQuestConfig] = useState<QuestConfig | null>(null);
  const [view, setView] = useState<View>('loader');
  
  // Game State
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhaseEnum.SETUP);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentChanceCard, setCurrentChanceCard] = useState<ChanceCardType | null>(null);
  const [currentCommunityChestCard, setCurrentCommunityChestCard] = useState<ChanceCardType | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<ChoiceOutcome | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(() => !!getApiKey());

  // Scenario management state
  const [customScenarios, setCustomScenarios] = useState<ScenariosByLocation>({});
  
  const refreshApiKeyStatus = () => {
    setIsApiKeySet(!!getApiKey());
  };

  // Effect to load/save scenarios when questConfig changes
  useEffect(() => {
    if (!questConfig) return;
    const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${questConfig.name.replace(/\s/g, '_')}`;
    try {
      const saved = localStorage.getItem(storageKey);
      setCustomScenarios(saved ? JSON.parse(saved) : questConfig.pregeneratedScenarios);
    } catch (e) {
      console.error("Failed to parse scenarios from localStorage", e);
      setCustomScenarios(questConfig.pregeneratedScenarios);
    }
  }, [questConfig]);

  useEffect(() => {
    if (!questConfig || Object.keys(customScenarios).length === 0) return;
    const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${questConfig.name.replace(/\s/g, '_')}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(customScenarios));
    } catch (e) {
      console.error("Failed to save scenarios to localStorage", e);
    }
  }, [customScenarios, questConfig]);


  const currentPlayer = players[currentPlayerIndex];

  const handleQuestLoaded = (config: QuestConfig) => {
    setQuestConfig(config);
    const initialResources: Record<string, number> = {};
    config.resources.forEach(r => {
      initialResources[r.name] = r.initialValue;
    });
    setGameSettings({
      numPlayers: 1,
      playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
      initialResources,
      scenarioSource: isApiKeySet ? 'dynamic' : 'pregenerated',
    });
    setView('setup');
  };

  const handleStartGame = (settings: GameSettings) => {
    if (!questConfig) return;
    const newPlayers: Player[] = Array.from({ length: settings.numPlayers }, (_, i) => ({
      id: i,
      name: settings.playerNames[i] || `Player ${i + 1}`,
      type: 'Citizen',
      resources: { ...settings.initialResources },
      position: 0,
      status: 'active',
      color: questConfig.playerColors[i % questConfig.playerColors.length],
    }));
    setPlayers(newPlayers);
    setGameSettings(settings); // Save the final settings used
    setCurrentPlayerIndex(0);
    setGamePhase(GamePhaseEnum.START);
    setView('game');
  };
  
  const updatePlayer = (playerId: number, updates: Partial<Player>) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(p => p.id === playerId ? { ...p, ...updates } : p)
    );
  };

  const applyResourceChanges = useCallback((changes: Record<string, number>) => {
    if (!currentPlayer || !questConfig) return;
    
    const newResources = { ...currentPlayer.resources };
    for (const key in changes) {
        const value = changes[key];
        // Find canonical resource name (e.g., 'Money') from a lowercase key (e.g., 'money')
        const resourceDef = questConfig.resources.find(r => r.name.toLowerCase() === key.toLowerCase());
        if (resourceDef && typeof newResources[resourceDef.name] === 'number') {
            newResources[resourceDef.name] += value;
        }
    }
    
    const playerUpdate: Partial<Player> = { resources: newResources };

    // Player is bankrupt if the first two resources (e.g. Money, Security) hit zero.
    const isBankrupt = questConfig.resources.slice(0, 2).some(r => newResources[r.name] <= 0);
    if (isBankrupt) {
      playerUpdate.status = 'bankrupt';
    }

    updatePlayer(currentPlayer.id, playerUpdate);
  }, [currentPlayer, questConfig]);

  const getPregeneratedScenario = (location: typeof questConfig.board.locations[number]): Scenario | null => {
      if (!questConfig) return null;
      const locationScenarios = customScenarios[location.name];
      if (!locationScenarios) return null;
      
      const enabledScenarios = locationScenarios.filter(s => s.enabled);
      if (enabledScenarios.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * enabledScenarios.length);
      return enabledScenarios[randomIndex];
  };

  const handleLandOnSpace = useCallback(async (position: number) => {
    if (!questConfig || !gameSettings) return;

    const location = questConfig.board.locations[position];
    setIsLoading(true);

    switch (location.type) {
      case 'PROPERTY':
      case 'UTILITY':
        try {
          setGamePhase(GamePhaseEnum.SCENARIO_PENDING);
          let scenario: Scenario | null = null;
          if (gameSettings.scenarioSource === 'pregenerated' && Object.keys(customScenarios).length > 0) {
             scenario = getPregeneratedScenario(location);
             if (!scenario) {
                console.warn(`No pregenerated scenarios for ${location.name}. Switching to dynamic.`);
                scenario = await generateScenario(currentPlayer, location, questConfig);
             }
          } else {
             scenario = await generateScenario(currentPlayer, location, questConfig);
          }
          
          setCurrentScenario(scenario);
          setGamePhase(GamePhaseEnum.SCENARIO_CHOICE);
        } catch (e: any) {
          console.error("Failed to generate scenario:", e);
          setError(e.message || "Failed to generate a scenario. The AI might be busy. Please try again.");
          setGamePhase(GamePhaseEnum.ERROR);
        } finally {
          setIsLoading(false);
        }
        break;

      case 'CHANCE':
        if (questConfig.chanceCards.length > 0) {
          const card = questConfig.chanceCards[Math.floor(Math.random() * questConfig.chanceCards.length)];
          setCurrentChanceCard(card);
          applyResourceChanges(card.resourceChanges);
          setGamePhase(GamePhaseEnum.CHANCE);
        } else {
          setGamePhase(GamePhaseEnum.START); // No chance cards, just continue
        }
        setIsLoading(false);
        break;

      case 'COMMUNITY_CHEST':
        if (questConfig.communityChestCards && questConfig.communityChestCards.length > 0) {
            const card = questConfig.communityChestCards[Math.floor(Math.random() * questConfig.communityChestCards.length)];
            setCurrentCommunityChestCard(card);
            applyResourceChanges(card.resourceChanges);
            setGamePhase(GamePhaseEnum.CHANCE); // Re-use CHANCE phase, as behavior is identical
        } else {
            setGamePhase(GamePhaseEnum.START); // No cards, just continue
        }
        setIsLoading(false);
        break;

      case 'GO_TO_JAIL':
        updatePlayer(currentPlayer.id, { position: questConfig.board.jailPosition });
        const jailOutcome: ChoiceOutcome = {
          explanation: "A suspicious transaction has been flagged! Your account is frozen while it's investigated.",
          resourceChanges: { money: -10, time: -10, security: -5 }
        };
        setSelectedOutcome(jailOutcome);
        applyResourceChanges(jailOutcome.resourceChanges);
        setGamePhase(GamePhaseEnum.SCENARIO_OUTCOME);
        setIsLoading(false);
        break;

      case 'TAX':
         const taxOutcome: ChoiceOutcome = {
          explanation: `You landed on ${location.name}. Digital services come with their own costs.`,
          resourceChanges: { money: -15, time: -5, security: 0 }
        };
        setSelectedOutcome(taxOutcome);
        applyResourceChanges(taxOutcome.resourceChanges);
        setGamePhase(GamePhaseEnum.SCENARIO_OUTCOME);
        setIsLoading(false);
        break;
        
      case 'JAIL':
      case 'START':
      case 'FREE_PARKING':
      default:
        setIsLoading(false);
        setGamePhase(GamePhaseEnum.START);
        break;
    }
  }, [currentPlayer, applyResourceChanges, gameSettings, questConfig, customScenarios]);

  const handleRollDice = useCallback(async () => {
    if (isLoading || !currentPlayer || !questConfig) return;

    setIsLoading(true);
    setError(null);
    setDiceRoll(null);
    setCurrentScenario(null);
    setSelectedOutcome(null);
    setGamePhase(GamePhaseEnum.ROLLING);

    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    
    setTimeout(() => {
        const newPosition = (currentPlayer.position + roll) % questConfig.board.locations.length;
        updatePlayer(currentPlayer.id, { position: newPosition });
        
        setTimeout(() => {
            handleLandOnSpace(newPosition);
        }, 500);

    }, 1000);

  }, [currentPlayer, isLoading, handleLandOnSpace, questConfig]);

  const handleSelectChoice = useCallback((outcome: ChoiceOutcome) => {
    setSelectedOutcome(outcome);
    applyResourceChanges(outcome.resourceChanges);
    setGamePhase(GamePhaseEnum.SCENARIO_OUTCOME);
  }, [applyResourceChanges]);
  
  const handleNextTurn = () => {
    setCurrentScenario(null);
    setSelectedOutcome(null);
    setCurrentChanceCard(null);
    setCurrentCommunityChestCard(null);
    setDiceRoll(null);
    setError(null);

    const remainingPlayers = players.filter(p => p.status === 'active');
    if (remainingPlayers.length <= 1) {
      setGamePhase(GamePhaseEnum.GAME_OVER);
      return;
    }
    
    let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    while(players[nextPlayerIndex].status !== 'active') {
      nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    }
    setCurrentPlayerIndex(nextPlayerIndex);
    setGamePhase(GamePhaseEnum.START);
  };

  const handleRestart = () => {
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setDiceRoll(null);
    setCurrentScenario(null);
    setSelectedOutcome(null);
    setCurrentChanceCard(null);
    setCurrentCommunityChestCard(null);
    setIsLoading(false);
    setError(null);
    setView('setup');
    setGamePhase(GamePhaseEnum.SETUP);
  };
  
  const handleResetToLoader = () => {
    handleRestart();
    setQuestConfig(null);
    setView('loader');
    onNavigate('/');
  };

  useEffect(() => {
    if (currentPlayer?.status === 'bankrupt' && (gamePhase === GamePhaseEnum.SCENARIO_OUTCOME || gamePhase === GamePhaseEnum.CHANCE)) {
       setTimeout(() => {
         const remainingPlayers = players.filter(p => p.status === 'active');
         if (remainingPlayers.length <= 1) {
           setGamePhase(GamePhaseEnum.GAME_OVER);
         }
       }, 1500);
    }
  }, [players, currentPlayer, gamePhase]);

  const renderGameContent = () => {
       const winner = players.find(p => p.status === 'active');
       return (
           <div className="text-center p-8 bg-yellow-50 border-2 border-yellow-300 rounded-lg animate-fade-in flex flex-col items-center justify-center min-h-screen">
              <WinnerIcon className="w-24 h-24 text-yellow-500 mb-4" />
              <h2 className="text-4xl font-bold text-yellow-700 font-display">
                {winner ? `${winner.name} Wins!` : 'Game Over!'}
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                {winner ? `They have successfully navigated the ${questConfig?.name}.` : 'The challenges of the system have overcome all players.'}
              </p>
              <p className="mt-2 text-gray-600">The journey has ended, but the discussion continues.</p>
              <button onClick={handleRestart} className="mt-6 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 text-lg">
                Play Again
              </button>
           </div>
       );
  }

  const renderGameScreen = () => {
    if (!currentPlayer || !questConfig) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }
    
    if (gamePhase === GamePhaseEnum.GAME_OVER) {
        return renderGameContent();
    }

    return (
      <div className="w-full max-w-screen-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 border-4 border-gray-200">
        <header className="flex justify-between items-center mb-4 border-b-2 border-orange-300 pb-4">
            <div className="text-left">
                <h1 className="text-5xl font-extrabold text-orange-600 font-display">{questConfig.name}</h1>
                <p className="text-gray-500 mt-2">{questConfig.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsRulesModalOpen(true)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                aria-label="View Rules"
              >
                  <BookOpenIcon className="w-5 h-5" />
                  <span>Rules</span>
              </button>
              <button 
                onClick={() => setView('customize')}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                aria-label="Customize Scenarios"
              >
                  <CogIcon className="w-5 h-5" />
                  <span>Customize</span>
              </button>
              <button 
                onClick={handleRestart}
                className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                aria-label="Restart Game"
              >
                  <RestartIcon className="w-5 h-5" />
                  <span>Restart</span>
              </button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3 bg-gray-50 p-6 rounded-lg shadow-inner">
            <PlayerDashboard 
                currentPlayer={currentPlayer} 
                allPlayers={players} 
                onRollDice={handleRollDice} 
                gamePhase={gamePhase} 
                diceRoll={diceRoll} 
                isLoading={isLoading}
                resources={questConfig.resources}
            />
          </div>

          <div className="md:col-span-6 relative">
             <GameBoard locations={questConfig.board.locations} players={players} questName={questConfig.name} />
             {isLoading && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-lg z-20">
                  <LoadingSpinner />
                  <p className="mt-4 text-lg font-semibold text-gray-700">
                    {gamePhase === GamePhaseEnum.SCENARIO_PENDING ? 'Generating scenario...' : 'Rolling...'}
                  </p>
                </div>
              )}
          </div>

          <div className="md:col-span-3 flex flex-col bg-gray-50 p-6 rounded-lg shadow-inner">
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
              {currentCommunityChestCard && gamePhase === GamePhaseEnum.CHANCE ? (
                <CommunityChestCard card={currentCommunityChestCard} onContinue={handleNextTurn} resources={questConfig.resources} />
              ) : currentChanceCard && gamePhase === GamePhaseEnum.CHANCE ? (
                <ChanceCard card={currentChanceCard} onContinue={handleNextTurn} resources={questConfig.resources} />
              ) : currentScenario || selectedOutcome ? (
                <ScenarioCard 
                  scenario={currentScenario} 
                  onChoice={handleSelectChoice}
                  outcome={selectedOutcome}
                  onNextTurn={handleNextTurn}
                  resources={questConfig.resources}
                />
              ) : error ? (
                 <div className="text-center p-4 bg-red-100 border-2 border-red-300 rounded-lg animate-fade-in h-full flex flex-col justify-center items-center">
                   <h3 className="font-bold text-red-700">An Error Occurred</h3>
                   <p className="text-red-600 mt-2">{error}</p>
                   <button onClick={handleNextTurn} className="mt-4 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600">
                     Try Again
                   </button>
                 </div>
              ) : (
                <div className="text-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex flex-col items-center justify-center h-full">
                    <h2 className="text-2xl font-bold text-blue-800 font-display">Your Quest Awaits</h2>
                    <p className="mt-2 text-blue-700">
                      {gamePhase === GamePhaseEnum.START 
                        ? `It's ${currentPlayer.name}'s turn. Click "Roll Dice" to move.`
                        : 'Moving to the next space...'}
                    </p>
                </div>
              )}
            </div>
          </div>
        </main>
        {isRulesModalOpen && <RulesModal questConfig={questConfig} onClose={() => setIsRulesModalOpen(false)} />}
        <Footer questConfig={questConfig} />
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'loader':
        return <QuestLoader onQuestLoaded={handleQuestLoaded} onLaunchMaker={() => setView('maker')} isApiKeySet={isApiKeySet} onNavigate={onNavigate} />;
      case 'maker':
        return <QuestMaker onQuestCreated={handleQuestLoaded} onBack={() => { setView('loader'); onNavigate('/'); }} isApiKeySet={isApiKeySet} />;
      case 'customize':
        if (!questConfig) return <QuestLoader onQuestLoaded={handleQuestLoaded} onLaunchMaker={() => setView('maker')} isApiKeySet={isApiKeySet} onNavigate={onNavigate} />;
        return <ScenarioCustomizer 
                    scenarios={customScenarios} 
                    setScenarios={setCustomScenarios} 
                    onBack={() => setView('setup')}
                    questConfig={questConfig}
                />;
      case 'game':
        return renderGameScreen();
      case 'setup':
      default:
        if (!questConfig || !gameSettings) {
            return <QuestLoader onQuestLoaded={handleQuestLoaded} onLaunchMaker={() => setView('maker')} isApiKeySet={isApiKeySet} onNavigate={onNavigate} />;
        }
        return <Settings 
                 onStartGame={handleStartGame} 
                 onCustomize={() => setView('customize')} 
                 initialSettings={gameSettings}
                 questConfig={questConfig}
                 onBack={handleResetToLoader}
                 onKeyStatusChange={refreshApiKeyStatus}
               />;
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800 flex flex-col items-center justify-center p-4 selection:bg-orange-200">
      {renderView()}
    </div>
  );
};

export default App;