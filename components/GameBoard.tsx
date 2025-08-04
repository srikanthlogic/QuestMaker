import React from 'react';
import type { BoardLocation, BoardLocationType, Player } from '../types';
import { PlayerToken, StartIcon, JailIcon, ParkingIcon, GoToJailIcon, ChanceIcon, TaxIcon, UtilityIcon, CommunityChestIcon } from './Icons';
import { BoardLocationTypeEnum } from '../types';

interface GameBoardProps {
  locations: BoardLocation[];
  players: Player[];
  questName: string;
}

const getGridPosition = (index: number, total: number) => {
  const sideSpaces = (total - 4) / 4;
  if (sideSpaces < 1 || !Number.isInteger(sideSpaces) || total < 8) {
    return { row: 1, col: 1 }; // Fallback for invalid board sizes
  }
  const gridDim = sideSpaces + 2;

  const corner_bl_idx = sideSpaces + 1;
  const corner_tl_idx = 2 * sideSpaces + 2;
  const corner_tr_idx = 3 * sideSpaces + 3;

  if (index >= 0 && index <= corner_bl_idx) { // Bottom row (right to left)
    return { row: gridDim, col: gridDim - index };
  }
  if (index > corner_bl_idx && index <= corner_tl_idx) { // Left Col (bottom to top)
    return { row: gridDim - (index - corner_bl_idx), col: 1 };
  }
  if (index > corner_tl_idx && index <= corner_tr_idx) { // Top Row (left to right)
    return { row: 1, col: 1 + (index - corner_tl_idx) };
  }
  if (index > corner_tr_idx && index < total) { // Right Col (top to bottom)
    return { row: 1 + (index - corner_tr_idx), col: gridDim };
  }
  return { row: 1, col: 1 }; // Should not happen
};


const SpaceIcon: React.FC<{type: BoardLocation['type']}> = ({type}) => {
    switch (type) {
        case BoardLocationTypeEnum.START: return <StartIcon className="w-full h-10" />;
        case BoardLocationTypeEnum.JAIL: return <JailIcon className="w-full h-10" />;
        case BoardLocationTypeEnum.FREE_PARKING: return <ParkingIcon className="w-full h-10" />;
        case BoardLocationTypeEnum.GO_TO_JAIL: return <GoToJailIcon className="w-full h-10" />;
        case BoardLocationTypeEnum.CHANCE: return <ChanceIcon className="w-8 h-8 mx-auto mt-2 text-blue-500" />;
        case BoardLocationTypeEnum.COMMUNITY_CHEST: return <CommunityChestIcon className="w-8 h-8 mx-auto mt-2 text-yellow-500" />;
        case BoardLocationTypeEnum.TAX: return <TaxIcon className="w-8 h-8 mx-auto mt-2 text-gray-600" />;
        case BoardLocationTypeEnum.UTILITY: return <UtilityIcon className="w-8 h-8 mx-auto mt-2 text-purple-500" />;
        default: return null;
    }
}

const CORNER_LOCATION_TYPES: ReadonlyArray<BoardLocationType> = [
    BoardLocationTypeEnum.START, 
    BoardLocationTypeEnum.JAIL, 
    BoardLocationTypeEnum.FREE_PARKING, 
    BoardLocationTypeEnum.GO_TO_JAIL
];

const BoardSpace: React.FC<{location: BoardLocation, playersOnSpace: Player[], style: React.CSSProperties}> = ({ location, playersOnSpace, style }) => {
    const isCorner = CORNER_LOCATION_TYPES.includes(location.type);
    
    return (
         <div 
            style={style}
            className={`
                relative flex flex-col justify-between text-center border-gray-400 border
                ${isCorner ? 'bg-gray-200' : 'bg-gray-100'}
            `}
        >
            {location.color && <div className={`h-4 ${location.color}`}></div>}
            <div className="flex-grow flex flex-col justify-center p-1">
                <p className="text-[10px] leading-tight font-bold uppercase">{location.name}</p>
                { !isCorner && <div className="h-10 flex items-center justify-center"><SpaceIcon type={location.type} /></div>}
            </div>
             {isCorner && <div className="absolute inset-0 flex items-center justify-center p-2"><SpaceIcon type={location.type} /></div>}

            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex">
                    {playersOnSpace.map((player, i) => (
                        <PlayerToken 
                            key={player.id} 
                            className={`w-8 h-8 ${player.color} drop-shadow-lg`} 
                            style={{ transform: `translateX(${i * 8}px)`}}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};


export const GameBoard: React.FC<GameBoardProps> = ({ locations, players, questName }) => {
  const totalLocations = locations.length;
  const sideSpaces = (totalLocations - 4) / 4;
  const gridDim = (Number.isInteger(sideSpaces) && sideSpaces >= 1) ? sideSpaces + 2 : 6;
  
  const gridStyle = {
    gridTemplateColumns: `repeat(${gridDim}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridDim}, minmax(0, 1fr))`,
  };

  const centerStyle = {
    gridColumn: `2 / ${gridDim}`,
    gridRow: `2 / ${gridDim}`,
  };

  return (
    <div className="relative w-full aspect-square bg-gray-300 rounded-lg p-2 shadow-lg border-2 border-gray-400">
        <div className="grid w-full h-full gap-1" style={gridStyle}>
            {locations.map((location, index) => {
                const pos = getGridPosition(index, locations.length);
                const style = { gridArea: `${pos.row} / ${pos.col}` };
                const playersOnSpace = players.filter(p => p.position === index && p.status === 'active');
                return (
                    <BoardSpace 
                        key={index}
                        location={location}
                        playersOnSpace={playersOnSpace}
                        style={style}
                    />
                )
            })}
             <div className="bg-gray-200 flex items-center justify-center rounded-md border-2 border-gray-400" style={centerStyle}>
                <h2 className="text-5xl font-extrabold text-orange-600 font-display -rotate-12 text-center px-4">{questName}</h2>
             </div>
        </div>
    </div>
  );
};