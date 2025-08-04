

import React, { useState } from 'react';
import type { QuestConfig, ResourceDefinition, BoardLocation, ChanceCard } from '../types';
import { generateQuestOutline } from '../services/geminiService';
import { BoardLocationTypeEnum } from '../types';
import { MoneyIcon, TimeIcon, InfoIcon, TrashIcon, WandIcon, SparklesIcon, SendIcon, LoadingSpinner } from './Icons';

type AIOutline = Partial<QuestConfig> & { summary?: string, boardLocationIdeas?: {name: string, description: string}[], boardSize?: number };

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  MoneyIcon,
  TimeIcon,
  InfoIcon,
};
const iconNames = Object.keys(iconMap);

const createDefaultBoard = (size: number): QuestConfig['board'] => {
    if (size % 4 !== 0 || size < 8) {
        console.error("Invalid board size. Must be a multiple of 4 and at least 8.");
        size = 20; // fallback to default
    }
    const sideLength = size / 4;
    const jailPosition = sideLength;
    const freeParkingPosition = 2 * sideLength;
    const goToJailPosition = 3 * sideLength;

    const locations: BoardLocation[] = Array.from({ length: size }, (_, i) => {
        if (i === 0) return { name: 'Start', description: 'Begin your journey.', type: 'START' };
        if (i === jailPosition) return { name: 'Jail', description: 'A place of penalty.', type: 'JAIL' };
        if (i === freeParkingPosition) return { name: 'Free Parking', description: 'A moment of rest.', type: 'FREE_PARKING' };
        if (i === goToJailPosition) return { name: 'Go to Jail', description: 'Go directly to jail.', type: 'GO_TO_JAIL' };
        
        // Distribute other types evenly for variety
        const spaceIndex = i % (sideLength -1);
        let type: BoardLocation['type'] = 'PROPERTY';
        if (spaceIndex === 1) type = 'CHANCE';
        if (spaceIndex === 2) type = 'TAX';
        if (spaceIndex === 3) type = 'UTILITY';


        return { name: `Space ${i + 1}`, description: '', type: type, color: 'bg-gray-400' };
    });

    return { locations, jailPosition };
};


const initialQuestConfig: QuestConfig = {
    name: 'My Custom Quest',
    description: 'A new adventure created with QuestCraft!',
    positivity: 0.5,
    groundingInReality: true,
    resources: [
        { name: 'Money', icon: 'MoneyIcon', barColor: 'bg-green-500', initialValue: 100 },
        { name: 'Health', icon: 'InfoIcon', barColor: 'bg-red-500', initialValue: 100 },
    ],
    playerColors: ['text-red-600', 'text-blue-600', 'text-green-600', 'text-purple-600'],
    board: createDefaultBoard(20),
    chanceCards: [],
    communityChestCards: [],
    footerSections: [
        { title: "How to Play", content: "The last player standing wins!" },
        { title: "About", content: "This quest was made with the QuestCraft engine." }
    ],
    pregeneratedScenarios: {},
};

const Stepper: React.FC<{ currentStep: number; steps: string[] }> = ({ currentStep, steps }) => (
    <div className="flex justify-between items-center mb-8 overflow-x-auto pb-2">
        {steps.map((step, index) => (
            <React.Fragment key={index}>
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white transition-colors ${currentStep > index ? 'bg-green-500' : currentStep === index ? 'bg-orange-500' : 'bg-gray-300'}`}>
                        {currentStep > index ? '✓' : index + 1}
                    </div>
                    <p className={`ml-3 font-semibold transition-colors text-sm md:text-base whitespace-nowrap ${currentStep >= index ? 'text-gray-800' : 'text-gray-400'}`}>{step}</p>
                </div>
                {index < steps.length - 1 && <div className="flex-1 h-1 bg-gray-200 mx-4 min-w-[1rem]"></div>}
            </React.Fragment>
        ))}
    </div>
);


interface QuestMakerProps {
    onQuestCreated: (quest: QuestConfig) => void;
    onBack: () => void;
    isApiKeySet: boolean;
}

export const QuestMaker: React.FC<QuestMakerProps> = ({ onQuestCreated, onBack, isApiKeySet }) => {
    const [step, setStep] = useState(0);
    const [quest, setQuest] = useState<QuestConfig>(initialQuestConfig);
    const [aiOutline, setAiOutline] = useState<AIOutline | null>(null);

    const steps = ["Refine", "Basics", "Resources", "Board", "Chance", "Community Chest", "Footer", "Finish"];

    const handleUpdate = (field: keyof QuestConfig, value: any) => {
        setQuest(q => ({ ...q, [field]: value }));
    };
    
    const handleNestedUpdate = (area: 'board', field: keyof QuestConfig['board'], value: any) => {
        setQuest(q => ({ ...q, [area]: { ...q[area], [field]: value } }));
    };
    
    const handleProceedFromAIToBasics = () => {
        if (aiOutline) {
            const newBoardSize = aiOutline.boardSize || quest.board.locations.length;
            const newBoard = createDefaultBoard(newBoardSize);
            let ideaIndex = 0;
            
            newBoard.locations.forEach(loc => {
                if ((loc.type === 'PROPERTY' || loc.type === 'UTILITY') && aiOutline.boardLocationIdeas && ideaIndex < aiOutline.boardLocationIdeas.length) {
                    loc.name = aiOutline.boardLocationIdeas[ideaIndex].name;
                    loc.description = aiOutline.boardLocationIdeas[ideaIndex].description;
                    ideaIndex++;
                }
            });

            setQuest(prev => ({
                ...prev,
                name: aiOutline.name || prev.name,
                description: aiOutline.description || prev.description,
                positivity: aiOutline.positivity ?? prev.positivity,
                groundingInReality: aiOutline.groundingInReality ?? prev.groundingInReality,
                resources: aiOutline.resources || prev.resources,
                chanceCards: aiOutline.chanceCards || prev.chanceCards,
                communityChestCards: aiOutline.communityChestCards || prev.communityChestCards,
                board: newBoard,
                footerSections: aiOutline.footerSections || prev.footerSections,
            }));
        }
        setStep(s => s + 1);
    };

    const handleDownload = () => {
        const jsonString = JSON.stringify(quest, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${quest.name.toLowerCase().replace(/\s/g, '-')}-quest.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderStep = () => {
        switch (step) {
            case 0: return <StepRefineWithAI onOutlineGenerated={setAiOutline} aiOutline={aiOutline} />;
            case 1: return <StepBasics quest={quest} onUpdate={handleUpdate} />;
            case 2: return <StepResources quest={quest} onUpdate={handleUpdate} />;
            case 3: return <StepBoard quest={quest} onNestedUpdate={handleNestedUpdate} />;
            case 4: return <StepChance quest={quest} onUpdate={handleUpdate} />;
            case 5: return <StepCommunityChest quest={quest} onUpdate={handleUpdate} />;
            case 6: return <StepContent quest={quest} onUpdate={handleUpdate} />;
            case 7: return <StepFinish quest={quest} onDownload={handleDownload} onPlay={() => onQuestCreated(quest)} />;
            default: return null;
        }
    };
    
    const inputClasses = "w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition";
    const labelClasses = "block text-sm font-bold text-gray-700 mb-1";

    const StepRefineWithAI: React.FC<{onOutlineGenerated: (outline: AIOutline) => void; aiOutline: AIOutline | null;}> = ({ onOutlineGenerated, aiOutline }) => {
        const [userInput, setUserInput] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState('');

        const handleGenerate = async () => {
            if (!userInput.trim() || !isApiKeySet) return;
            setIsLoading(true);
            setError('');
            try {
                const outline = await generateQuestOutline(userInput);
                onOutlineGenerated(outline);
            } catch (e: any) {
                setError(e.message || "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <div>
                <h3 className="text-xl font-bold font-display text-gray-800 mb-2">Refine your Idea with AI</h3>
                <p className="text-gray-600 mb-4">Describe your game concept below. What is it about? What should players learn or experience? The more detail, the better the AI's suggestions.</p>
                
                {aiOutline?.summary ? (
                    <div className="p-4 bg-green-50 border border-green-300 rounded-lg animate-fade-in">
                        <h4 className="font-bold text-green-800 flex items-center"><SparklesIcon className="w-5 h-5 mr-2"/>AI Suggestion:</h4>
                        <p className="text-green-700 mt-2">{aiOutline.summary}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <textarea
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            placeholder="e.g., A game about the challenges of ocean conservation, balancing funding, public awareness, and pollution levels."
                            className={`${inputClasses} h-28`}
                            disabled={isLoading}
                        />
                        <button onClick={handleGenerate} disabled={isLoading || !userInput.trim() || !isApiKeySet} className="w-full flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors">
                            {isLoading ? <LoadingSpinner className="h-6 w-6" /> : <><SparklesIcon className="w-6 h-6 mr-2" /><span>Generate Outline</span></>}
                        </button>
                        {!isApiKeySet && <p className="text-red-500 text-sm text-center">A Gemini API Key is required to generate an outline. Please go back, load any quest, add your key in its settings, then return here.</p>}
                        {error && <p className="text-red-600 text-center">{error}</p>}
                    </div>
                )}
            </div>
        );
    };

    const StepBasics: React.FC<{ quest: QuestConfig, onUpdate: (f: keyof QuestConfig, v: any) => void }> = ({ quest, onUpdate }) => (
        <div className="space-y-6">
            <div>
                <label htmlFor="quest-name" className={labelClasses}>Quest Name</label>
                <input id="quest-name" type="text" value={quest.name} onChange={e => onUpdate('name', e.target.value)} className={inputClasses} />
            </div>
            <div>
                <label htmlFor="quest-desc" className={labelClasses}>Quest Description</label>
                <input id="quest-desc" type="text" value={quest.description} onChange={e => onUpdate('description', e.target.value)} className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="quest-positivity" className={labelClasses}>Positivity Score ({quest.positivity?.toFixed(2)})</label>
                    <input id="quest-positivity" type="range" min="0" max="1" step="0.05" value={quest.positivity} onChange={e => onUpdate('positivity', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                    <div className="flex justify-between text-xs text-gray-500"><p>Challenging</p><p>Hopeful</p></div>
                </div>
                <div>
                    <label className={labelClasses}>Scenario Style</label>
                    <div className="relative flex w-full rounded-lg bg-gray-200 p-1">
                        <div className={`absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-md transition-transform duration-300 ease-in-out ${quest.groundingInReality ? 'translate-x-full' : 'translate-x-0'}`}></div>
                        <button
                            type="button"
                            onClick={() => onUpdate('groundingInReality', false)}
                            className="relative w-1/2 py-2 text-center font-semibold text-sm z-10 transition-colors"
                        >
                            Creative
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdate('groundingInReality', true)}
                            className="relative w-1/2 py-2 text-center font-semibold text-sm z-10 transition-colors"
                        >
                            Realistic
                        </button>
                    </div>
                     <p className="text-xs text-gray-500 mt-2 text-center">
                        {quest.groundingInReality 
                            ? "AI will base scenarios on real articles." 
                            : "AI will create fictional scenarios."}
                    </p>
                </div>
            </div>
        </div>
    );

    const StepResources: React.FC<{ quest: QuestConfig, onUpdate: (f: keyof QuestConfig, v: any) => void }> = ({ quest, onUpdate }) => {
        const handleResourceChange = (index: number, field: keyof ResourceDefinition, value: string | number) => {
            const newResources = [...quest.resources];
            (newResources[index] as any)[field] = value;
            onUpdate('resources', newResources);
        };
        const addResource = () => {
            const newResource: ResourceDefinition = { name: 'New Resource', icon: 'InfoIcon', barColor: 'bg-gray-500', initialValue: 50 };
            onUpdate('resources', [...quest.resources, newResource]);
        };
        const removeResource = (index: number) => {
            onUpdate('resources', quest.resources.filter((_, i) => i !== index));
        };
        return (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {quest.resources.map((res, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className={labelClasses}>Resource Name</label>
                                <input type="text" value={res.name} onChange={e => handleResourceChange(i, 'name', e.target.value)} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Icon</label>
                                <select value={res.icon} onChange={e => handleResourceChange(i, 'icon', e.target.value)} className={inputClasses}>
                                    {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Bar Color (Tailwind Class)</label>
                                <input type="text" value={res.barColor} onChange={e => handleResourceChange(i, 'barColor', e.target.value)} className={inputClasses} />
                            </div>
                            <div className="flex items-end">
                                <div className="flex-grow">
                                    <label className={labelClasses}>Initial Value</label>
                                    <input type="number" value={res.initialValue} onChange={e => handleResourceChange(i, 'initialValue', parseInt(e.target.value))} className={inputClasses} />
                                </div>
                                <button onClick={() => removeResource(i)} className="ml-2 mb-2 text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-6 h-6"/></button>
                            </div>
                        </div>
                    </div>
                ))}
                <button onClick={addResource} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Add Resource</button>
            </div>
        );
    };

    const StepBoard: React.FC<{ quest: QuestConfig, onNestedUpdate: (a: 'board', f: keyof QuestConfig['board'], v: any) => void }> = ({ quest, onNestedUpdate }) => {
        const handleLocationChange = (index: number, field: keyof BoardLocation, value: string) => {
             const newLocations = [...quest.board.locations];
             (newLocations[index] as any)[field] = value;
             onNestedUpdate('board', 'locations', newLocations);
        };
        const handleSizeChange = (newSize: number) => {
            if (window.confirm("Changing board size will reset custom location names, descriptions, and types. Are you sure?")) {
                const newBoard = createDefaultBoard(newSize);
                onNestedUpdate('board', 'locations', newBoard.locations);
                onNestedUpdate('board', 'jailPosition', newBoard.jailPosition);
            }
        }
        const sideLength = quest.board.locations.length / 4;
        const isCorner = (i: number) => i % sideLength === 0;

        return (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                <div>
                    <label htmlFor="board-size" className={labelClasses}>Board Size</label>
                    <select id="board-size" onChange={e => handleSizeChange(parseInt(e.target.value))} value={quest.board.locations.length} className={inputClasses}>
                        {[20, 24, 28, 32, 36, 40].map(size => <option key={size} value={size}>{size} spaces</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quest.board.locations.map((loc, i) => (
                        <div key={i} className="p-3 border rounded-lg bg-white space-y-2">
                            <h4 className="font-bold text-gray-800">Space {i+1}{isCorner(i) && ` (${loc.type})`}</h4>
                            <input type="text" value={loc.name} onChange={e => handleLocationChange(i, 'name', e.target.value)} placeholder="Name" className={inputClasses} disabled={isCorner(i)}/>
                            {!isCorner(i) && <input type="text" value={loc.description} onChange={e => handleLocationChange(i, 'description', e.target.value)} placeholder="Description" className={inputClasses} />}
                            {!isCorner(i) && (
                                <div>
                                    <label className={labelClasses}>Type</label>
                                    <select value={loc.type} onChange={e => handleLocationChange(i, 'type', e.target.value)} className={inputClasses}>
                                      <option value={BoardLocationTypeEnum.PROPERTY}>PROPERTY</option>
                                      <option value={BoardLocationTypeEnum.UTILITY}>UTILITY</option>
                                      <option value={BoardLocationTypeEnum.CHANCE}>CHANCE</option>
                                      <option value={BoardLocationTypeEnum.COMMUNITY_CHEST}>COMMUNITY CHEST</option>
                                      <option value={BoardLocationTypeEnum.TAX}>TAX</option>
                                    </select>
                                </div>
                            )}
                            {loc.type === 'PROPERTY' && <input type="text" value={loc.color} onChange={e => handleLocationChange(i, 'color', e.target.value)} placeholder="e.g., bg-yellow-600" className={inputClasses}/>}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const StepChance: React.FC<{ quest: QuestConfig, onUpdate: (f: keyof QuestConfig, v: any) => void }> = ({ quest, onUpdate }) => {
        const handleCardChange = (index: number, field: keyof ChanceCard, value: any) => {
             const newCards = [...quest.chanceCards];
             (newCards[index] as any)[field] = value;
             onUpdate('chanceCards', newCards);
        };
        const handleResourceChange = (index: number, resName: string, value: string) => {
            const newCards = [...quest.chanceCards];
            newCards[index].resourceChanges[resName.toLowerCase()] = parseInt(value) || 0;
            onUpdate('chanceCards', newCards);
        }
        const addCard = () => {
             const newCard: ChanceCard = { description: 'Something happens!', resourceChanges: {} };
             onUpdate('chanceCards', [...quest.chanceCards, newCard]);
        };
        const removeCard = (index: number) => {
            onUpdate('chanceCards', quest.chanceCards.filter((_, i) => i !== index));
        };

        return (
             <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                <h3 className="text-xl font-bold font-display text-gray-800">Chance Cards</h3>
                {quest.chanceCards.map((card, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-start">
                            <textarea value={card.description} onChange={e => handleCardChange(i, 'description', e.target.value)} className={`${inputClasses} flex-grow`} rows={2}/>
                            <button onClick={() => removeCard(i)} className="ml-2 mt-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {quest.resources.map(res => (
                                <div key={res.name}>
                                    <label className="text-xs text-gray-500">{res.name}</label>
                                    <input type="number" placeholder="0" value={card.resourceChanges[res.name.toLowerCase()] || ''} onChange={e => handleResourceChange(i, res.name, e.target.value)} className={inputClasses}/>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button onClick={addCard} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Add Chance Card</button>
            </div>
        );
    }
    
    const StepCommunityChest: React.FC<{ quest: QuestConfig, onUpdate: (f: keyof QuestConfig, v: any) => void }> = ({ quest, onUpdate }) => {
        const communityChestCards = quest.communityChestCards || [];
        const handleCardChange = (index: number, field: keyof ChanceCard, value: any) => {
             const newCards = [...communityChestCards];
             (newCards[index] as any)[field] = value;
             onUpdate('communityChestCards', newCards);
        };
        const handleResourceChange = (index: number, resName: string, value: string) => {
            const newCards = [...communityChestCards];
            newCards[index].resourceChanges[resName.toLowerCase()] = parseInt(value) || 0;
            onUpdate('communityChestCards', newCards);
        }
        const addCard = () => {
             const newCard: ChanceCard = { description: 'A community event occurs!', resourceChanges: {} };
             onUpdate('communityChestCards', [...communityChestCards, newCard]);
        };
        const removeCard = (index: number) => {
            onUpdate('communityChestCards', communityChestCards.filter((_, i) => i !== index));
        };

        return (
             <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                <h3 className="text-xl font-bold font-display text-gray-800">Community Chest Cards</h3>
                {communityChestCards.map((card, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-start">
                            <textarea value={card.description} onChange={e => handleCardChange(i, 'description', e.target.value)} className={`${inputClasses} flex-grow`} rows={2}/>
                            <button onClick={() => removeCard(i)} className="ml-2 mt-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {quest.resources.map(res => (
                                <div key={res.name}>
                                    <label className="text-xs text-gray-500">{res.name}</label>
                                    <input type="number" placeholder="0" value={card.resourceChanges[res.name.toLowerCase()] || ''} onChange={e => handleResourceChange(i, res.name, e.target.value)} className={inputClasses}/>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button onClick={addCard} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600">Add Community Chest Card</button>
            </div>
        );
    }
    
    const StepContent: React.FC<{ quest: QuestConfig, onUpdate: (f: keyof QuestConfig, v: any) => void }> = ({ quest, onUpdate }) => {
        const handleSectionChange = (index: number, field: 'title' | 'content', value: string) => {
            const newSections = [...quest.footerSections];
            newSections[index] = {...newSections[index], [field]: value};
            onUpdate('footerSections', newSections);
        };

        const addSection = () => {
            onUpdate('footerSections', [...quest.footerSections, { title: 'New Section', content: '' }]);
        };
        
        const removeSection = (index: number) => {
            onUpdate('footerSections', quest.footerSections.filter((_, i) => i !== index));
        };

        return (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                 <h3 className="text-xl font-bold font-display text-gray-800">Footer Sections (for Rules, About, etc.)</h3>
                {quest.footerSections.map((section, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-white space-y-2">
                        <div className="flex justify-between items-center">
                            <input
                                type="text"
                                value={section.title}
                                placeholder="Section Title (e.g., How to Play)"
                                onChange={e => handleSectionChange(i, 'title', e.target.value)}
                                className={`${inputClasses} font-bold text-lg p-2`}
                            />
                            <button onClick={() => removeSection(i)} className="text-red-500 hover:text-red-700 p-1 ml-2 flex-shrink-0">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div>
                            <label htmlFor={`content-${i}`} className={labelClasses}>Content (HTML supported)</label>
                            <textarea
                                id={`content-${i}`}
                                value={section.content}
                                onChange={e => handleSectionChange(i, 'content', e.target.value)}
                                className={`${inputClasses} h-24`}
                                rows={3}
                            />
                        </div>
                    </div>
                ))}
                <button onClick={addSection} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">
                    Add Footer Section
                </button>
            </div>
        );
    }

    const StepFinish: React.FC<{ quest: QuestConfig, onDownload: () => void, onPlay: () => void }> = ({ quest, onDownload, onPlay }) => (
        <div>
            <h3 className="text-xl font-bold font-display text-gray-800 mb-4">You're All Set!</h3>
            <p className="text-gray-600 mb-6">Your quest, "{quest.name}", is ready. You can download the JSON file to save and share it, or jump right in and start playing.</p>
            <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto custom-scrollbar border">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(quest, null, 2)}</pre>
            </div>
            <div className="flex space-x-4 mt-6">
                <button onClick={onDownload} className="flex-1 bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">Download quest.json</button>
                <button onClick={onPlay} className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">Load & Play Quest</button>
            </div>
        </div>
    );


    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4 border-gray-200 animate-fade-in flex flex-col h-[90vh]">
            <header className="flex-shrink-0">
                <h1 className="text-5xl font-extrabold text-orange-600 font-display text-center mb-2">Quest Maker</h1>
                <Stepper currentStep={step} steps={steps} />
            </header>

            <main className="flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4 py-4 min-h-0">
                {renderStep()}
            </main>
            
            <footer className="mt-auto pt-6 border-t border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => step > 0 ? setStep(s => s - 1) : onBack()}
                        className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        {step === 0 ? 'Back to Loader' : 'Back'}
                    </button>
                    {step < steps.length - 1 && (
                        <button
                            onClick={step === 0 ? handleProceedFromAIToBasics : () => setStep(s => s + 1)}
                            className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            {step === 0 && !aiOutline ? 'Skip & Continue Manually' : 'Next'}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};