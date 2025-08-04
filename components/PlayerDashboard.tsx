import React from 'react';
import type { Player, GamePhase, ResourceDefinition } from '../types';
import { GamePhaseEnum } from '../constants';
import { MoneyIcon, TimeIcon, InfoIcon, DiceIcon, PlayerToken } from './Icons';

// Map icon names from config to actual components
const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  MoneyIcon,
  TimeIcon,
  InfoIcon,
};

interface PlayerDashboardProps {
  currentPlayer: Player;
  allPlayers: Player[];
  onRollDice: () => void;
  gamePhase: GamePhase;
  diceRoll: number | null;
  isLoading: boolean;
  resources: ResourceDefinition[];
}

const ResourceDisplay: React.FC<{ icon: React.ReactNode; value: number; label: string; barColor: string }> = ({ icon, value, label, barColor }) => (
  <div className="flex items-center">
    <div className="w-8 h-8 flex-shrink-0">{icon}</div>
    <div className="ml-3 w-full">
      <div className="flex justify-between items-baseline">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold text-lg">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
        <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.max(0, value)}%` }}></div>
      </div>
    </div>
  </div>
);

const AllPlayersStatus: React.FC<{players: Player[], currentPlayerId: number, primaryResourceName: string}> = ({players, currentPlayerId, primaryResourceName}) => (
    <div className="mb-6 p-3 bg-gray-100 border border-gray-200 rounded-lg">
        <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">Players</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {players.map(player => (
                <div key={player.id} className={`flex items-center p-1 rounded ${player.id === currentPlayerId ? 'bg-orange-100' : ''}`}>
                    <PlayerToken className={`w-5 h-5 mr-2 flex-shrink-0 ${player.color}`} />
                    <div className="flex-grow overflow-hidden">
                        <p className={`text-sm font-semibold truncate ${player.status === 'bankrupt' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{player.name}</p>
                    </div>
                    <p className={`text-sm font-bold ml-2 ${player.status === 'bankrupt' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {player.resources[primaryResourceName]}
                    </p>
                </div>
            ))}
        </div>
    </div>
);


export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ currentPlayer, allPlayers, onRollDice, gamePhase, diceRoll, isLoading, resources }) => {
  const canRoll = gamePhase === GamePhaseEnum.START;
  const primaryResourceName = resources[0]?.name || '';
  
  return (
    <div className="flex flex-col">
      <AllPlayersStatus players={allPlayers} currentPlayerId={currentPlayer.id} primaryResourceName={primaryResourceName} />
      <div>
        <div className="text-center border-b border-gray-300 pb-3 mb-4">
            <p className="text-sm text-gray-500">Current Turn</p>
            <h2 className="text-2xl font-bold font-display text-gray-800">{currentPlayer.name}</h2>
        </div>

        <div className="space-y-4 mt-6">
          {resources.map(resource => {
            const IconComponent = iconMap[resource.icon] || InfoIcon;
            return (
              <ResourceDisplay 
                key={resource.name}
                icon={<IconComponent />} 
                value={currentPlayer.resources[resource.name]} 
                label={resource.name} 
                barColor={resource.barColor} 
              />
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-end">
        {diceRoll && gamePhase !== GamePhaseEnum.START && (
           <div className="text-center mb-4">
              <p className="text-gray-600">You rolled a:</p>
              <p className="text-6xl font-bold text-orange-500 animate-bounce">{diceRoll}</p>
           </div>
        )}
        <button
          onClick={onRollDice}
          disabled={!canRoll || isLoading}
          className="w-full flex items-center justify-center bg-orange-500 text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          <DiceIcon className="w-6 h-6 mr-3" />
          {isLoading ? 'Rolling...' : 'Roll Dice & Move'}
        </button>
      </div>
    </div>
  );
};
