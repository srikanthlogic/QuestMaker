



import React, { useState } from 'react';
import type { ScenariosByLocation, ManagedScenario, Scenario, Choice, ResourceChanges, QuestConfig, ResourceDefinition } from '../types';
import { TrashIcon, ArrowLeftIcon, PlusIcon } from './Icons';

interface ScenarioCustomizerProps {
  scenarios: ScenariosByLocation;
  setScenarios: React.Dispatch<React.SetStateAction<ScenariosByLocation>>;
  onBack: () => void;
  questConfig: QuestConfig;
}

const EditScenarioForm: React.FC<{
    locationName: string;
    onSave: (newScenario: Omit<Scenario, 'id'>) => void;
    onCancel: () => void;
    resources: ResourceDefinition[];
}> = ({ locationName, onSave, onCancel, resources }) => {
    
    const getInitialScenario = () => {
        const resourceKeys = resources.reduce((acc, res) => {
            acc[res.name.toLowerCase()] = 0;
            return acc;
        }, {} as ResourceChanges)

        return {
            title: '', description: '', sourceUrl: '', sourceTitle: '', custom: true,
            choices: [
                { text: '', outcome: { explanation: '', resourceChanges: {...resourceKeys} } },
                { text: '', outcome: { explanation: '', resourceChanges: {...resourceKeys} } }
            ] as [Choice, Choice]
        };
    };

    const [scenario, setScenario] = useState(getInitialScenario());

    const handleChoiceChange = (index: number, field: 'text' | 'explanation', value: string) => {
        const newChoices = [...scenario.choices] as [Choice, Choice];
        if(field === 'text') newChoices[index].text = value;
        else newChoices[index].outcome.explanation = value;
        setScenario(s => ({...s, choices: newChoices}));
    };

    const handleResourceChange = (choiceIndex: number, resource: string, value: string) => {
        const newChoices = [...scenario.choices] as [Choice, Choice];
        const newResourceChanges: ResourceChanges = { ...newChoices[choiceIndex].outcome.resourceChanges };
        const numValue = parseInt(value) || 0;
        
        newResourceChanges[resource] = numValue;
        
        newChoices[choiceIndex].outcome.resourceChanges = newResourceChanges;
        setScenario(s => ({ ...s, choices: newChoices }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(scenario);
    };

    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 focus:border-orange-400";

    return (
        <form onSubmit={handleSubmit} className="bg-orange-50/50 p-6 rounded-lg mt-4 border-2 border-orange-200 animate-fade-in">
            <h4 className="text-xl font-bold font-display text-gray-800 mb-4">Add New Scenario for "{locationName}"</h4>
            <div className="space-y-4">
                 <input type="text" placeholder="Scenario Title" value={scenario.title} onChange={e => setScenario(s => ({...s, title: e.target.value}))} className={inputClasses} required/>
                 <textarea placeholder="Scenario Description" value={scenario.description} onChange={e => setScenario(s => ({...s, description: e.target.value}))} className={inputClasses} rows={3} required />
                 <input type="text" placeholder="Source Title (Optional)" value={scenario.sourceTitle} onChange={e => setScenario(s => ({...s, sourceTitle: e.target.value}))} className={inputClasses} />
                 <input type="url" placeholder="Source URL (Optional)" value={scenario.sourceUrl} onChange={e => setScenario(s => ({...s, sourceUrl: e.target.value}))} className={inputClasses} />
                
                {[0, 1].map(i => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-gray-300 space-y-3">
                        <h5 className="font-semibold text-lg text-gray-700">Choice {i+1}</h5>
                        <input type="text" placeholder="Choice Text" value={scenario.choices[i].text} onChange={e => handleChoiceChange(i, 'text', e.target.value)} className={inputClasses} required />
                        <textarea placeholder="Outcome Explanation" value={scenario.choices[i].outcome.explanation} onChange={e => handleChoiceChange(i, 'explanation', e.target.value)} className={inputClasses} rows={2} required />
                        <div>
                            <h6 className="font-semibold text-gray-600 mb-2">Resource Changes</h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {resources.map(resource => (
                                     <div key={resource.name}>
                                        <label htmlFor={`resource-${i}-${resource.name.toLowerCase()}`} className="text-sm font-medium text-gray-500">{resource.name}</label>
                                        <input 
                                            id={`resource-${i}-${resource.name.toLowerCase()}`}
                                            type="number"
                                            placeholder="0"
                                            value={scenario.choices[i].outcome.resourceChanges[resource.name.toLowerCase()] || ''}
                                            onChange={e => handleResourceChange(i, resource.name.toLowerCase(), e.target.value)}
                                            className={`${inputClasses} mt-1`}
                                        />
                                     </div>
                                 ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">Save Scenario</button>
            </div>
        </form>
    );
};

const ScenarioItem: React.FC<{
    scenario: ManagedScenario;
    onToggle: (id: string, enabled: boolean) => void;
    onDelete: (id: string) => void;
}> = ({ scenario, onToggle, onDelete }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-gray-800 break-words">{scenario.title}</p>
            <p className="text-sm text-gray-500 truncate">{scenario.description}</p>
        </div>
        <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
            {scenario.custom && (
                <button onClick={() => onDelete(scenario.id)} className="text-red-500 hover:text-red-700" aria-label="Delete Scenario">
                    <TrashIcon className="w-5 h-5" />
                </button>
            )}
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                    type="checkbox"
                    id={`toggle-${scenario.id}`}
                    checked={scenario.enabled}
                    onChange={e => onToggle(scenario.id, e.target.checked)}
                    className="peer absolute left-0 block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-all duration-300 ease-in-out checked:border-green-500 checked:left-auto checked:right-0"
                />
                <label htmlFor={`toggle-${scenario.id}`} className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-green-500"></label>
            </div>
        </div>
    </div>
);


export const ScenarioCustomizer: React.FC<ScenarioCustomizerProps> = ({ scenarios, setScenarios, onBack, questConfig }) => {
    const [editingLocation, setEditingLocation] = useState<string | null>(null);

    const handleToggle = (locationName: string, scenarioId: string, enabled: boolean) => {
        setScenarios(prev => ({
            ...prev,
            [locationName]: prev[locationName].map(s => s.id === scenarioId ? { ...s, enabled } : s)
        }));
    };

    const handleDelete = (locationName: string, scenarioId: string) => {
        if (window.confirm("Are you sure you want to delete this custom scenario?")) {
            setScenarios(prev => ({
                ...prev,
                [locationName]: prev[locationName].filter(s => s.id !== scenarioId)
            }));
        }
    };
    
    const handleSaveNewScenario = (locationName: string, newScenarioData: Omit<Scenario, 'id'>) => {
        const newScenario: ManagedScenario = {
            ...newScenarioData,
            id: `custom-${Date.now()}`,
            enabled: true,
        };
        setScenarios(prev => ({
            ...prev,
            [locationName]: [...(prev[locationName] || []), newScenario]
        }));
        setEditingLocation(null);
    };

    const relevantLocations = questConfig.board.locations.filter(loc => loc.type === 'PROPERTY' || loc.type === 'UTILITY');

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4 border-gray-200 animate-fade-in flex flex-col h-[90vh]">
            <header className="flex items-center justify-between mb-6 border-b pb-4">
                <div>
                    <h1 className="text-5xl font-extrabold text-orange-600 font-display">Customize Scenarios</h1>
                    <p className="text-gray-500 mt-2">Enable, disable, or create your own scenarios for the game.</p>
                </div>
                <button onClick={onBack} className="flex-shrink-0 flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Settings</span>
                </button>
            </header>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4">
                <div className="space-y-6">
                    {relevantLocations.map(location => (
                        <div key={location.name} className="p-4 bg-gray-50 rounded-xl border-2">
                            <h3 className="text-xl font-bold font-display text-gray-700 mb-3">{location.name}</h3>
                            <div className="space-y-2">
                               {(scenarios[location.name] || []).map(scenario => (
                                   <ScenarioItem 
                                     key={scenario.id} 
                                     scenario={scenario} 
                                     onToggle={(id, enabled) => handleToggle(location.name, id, enabled)}
                                     onDelete={(id) => handleDelete(location.name, id)}
                                   />
                               ))}
                            </div>
                            {editingLocation === location.name ? (
                                <EditScenarioForm 
                                    locationName={location.name} 
                                    onSave={(s) => handleSaveNewScenario(location.name, s)} 
                                    onCancel={() => setEditingLocation(null)}
                                    resources={questConfig.resources}
                                />
                            ) : (
                                <button onClick={() => setEditingLocation(location.name)} className="mt-3 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 text-sm flex items-center space-x-2">
                                    <PlusIcon className="w-4 h-4"/>
                                    <span>Add New Scenario</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <button onClick={onBack} className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-orange-600 transition-colors">
                    Back to Settings
                </button>
            </div>
        </div>
    );
};