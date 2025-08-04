import React from 'react';
import type { Scenario, ChoiceOutcome, ChanceCard as ChanceCardType, ResourceDefinition } from '../types';
import { ArrowRightIcon, LinkIcon } from './Icons';

const ResourceChangeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  const shortLabel = label.length > 8 ? label.substring(0, 4) : label;
  return (
    <div className={`flex-1 font-semibold text-center px-2 py-2 rounded-lg ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      <div className="text-xs uppercase font-bold tracking-wider">{shortLabel}</div>
      <div className="text-lg">{isPositive ? `+${value}` : value}</div>
    </div>
  );
};

const ResourceChangesDisplay: React.FC<{changes: Record<string, number>, resources: ResourceDefinition[]}> = ({ changes, resources }) => {
    return (
        <div className="flex justify-around items-center text-sm space-x-2">
            {resources.map(resource => {
                const changeValue = changes[resource.name.toLowerCase()] || 0;
                return changeValue !== 0 ? (
                    <ResourceChangeBox key={resource.name} value={changeValue} label={resource.name} />
                ) : null;
            })}
        </div>
    );
};

interface ScenarioCardProps {
  scenario: Scenario | null;
  onChoice: (outcome: ChoiceOutcome) => void;
  outcome: ChoiceOutcome | null;
  onNextTurn: () => void;
  resources: ResourceDefinition[];
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onChoice, outcome, onNextTurn, resources }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200 h-full flex flex-col animate-fade-in">
      <h3 className="text-2xl font-bold font-display text-gray-800 mb-2">{scenario?.title || 'Outcome'}</h3>
      
      {!outcome ? (
        <>
          <p className="text-gray-600 mb-4 flex-grow">{scenario?.description}</p>
          <div className="space-y-3">
            {scenario?.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onChoice(choice.outcome)}
                className="w-full text-left bg-gray-100 hover:bg-orange-100 border-2 border-gray-200 hover:border-orange-300 p-3 rounded-md transition-colors duration-200"
              >
                {choice.text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-grow">
          <div className="flex-grow">
            <h4 className="font-bold text-lg text-gray-700">Outcome:</h4>
            <p className="text-gray-600 mt-2">{outcome.explanation}</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-md border">
              <h5 className="font-semibold text-gray-800 text-center mb-3">Resource Changes:</h5>
              <ResourceChangesDisplay changes={outcome.resourceChanges} resources={resources} />
            </div>
             {scenario?.sourceUrl && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <h5 className="font-semibold text-blue-800 flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Source
                  </h5>
                  <a 
                    href={scenario.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block"
                  >
                    {scenario.sourceTitle || scenario.sourceUrl}
                  </a>
              </div>
            )}
          </div>
          <button
            onClick={onNextTurn}
            className="w-full mt-4 flex items-center justify-center bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
          >
            Next Turn
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};


interface ChanceCardProps {
  card: ChanceCardType;
  onContinue: () => void;
  resources: ResourceDefinition[];
}

export const ChanceCard: React.FC<ChanceCardProps> = ({ card, onContinue, resources }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-300 h-full flex flex-col animate-fade-in">
      <h3 className="text-2xl font-bold font-display text-blue-600 mb-4 text-center">Chance</h3>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <p className="text-gray-700 text-lg text-center mb-6">{card.description}</p>
        
        <div className="w-full p-3 bg-gray-50 rounded-md border">
          <h5 className="font-semibold text-gray-800 text-center mb-3">Resource Changes:</h5>
          <ResourceChangesDisplay changes={card.resourceChanges} resources={resources} />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full mt-6 flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
      >
        Continue
        <ArrowRightIcon className="w-5 h-5 ml-2" />
      </button>
    </div>
  );
};

export const CommunityChestCard: React.FC<ChanceCardProps> = ({ card, onContinue, resources }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-yellow-300 h-full flex flex-col animate-fade-in">
      <h3 className="text-2xl font-bold font-display text-yellow-600 mb-4 text-center">Community Chest</h3>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <p className="text-gray-700 text-lg text-center mb-6">{card.description}</p>
        
        <div className="w-full p-3 bg-gray-50 rounded-md border">
          <h5 className="font-semibold text-gray-800 text-center mb-3">Resource Changes:</h5>
          <ResourceChangesDisplay changes={card.resourceChanges} resources={resources} />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full mt-6 flex items-center justify-center bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-300"
      >
        Continue
        <ArrowRightIcon className="w-5 h-5 ml-2" />
      </button>
    </div>
  );
};