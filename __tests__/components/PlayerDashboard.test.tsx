import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerDashboard } from '../../components/PlayerDashboard';
import { GamePhaseEnum } from '../../constants';
import type { Player, ResourceDefinition } from '../../types';
import { checkA11y } from '../../tests/setup/a11y';
import { axe } from 'jest-axe';

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 1,
  name: 'Alice',
  type: 'Citizen',
  resources: { Money: 80, Time: 60, Health: 90 },
  position: 0,
  status: 'active',
  color: 'text-red-600',
  ...overrides
});

const players: Player[] = [
  makePlayer({ id: 1, name: 'Alice', resources: { Money: 80, Time: 60, Health: 90 }}),
  makePlayer({ id: 2, name: 'Bob', color: 'text-blue-600', resources: { Money: 100, Time: 50, Health: 100 } }),
  makePlayer({ id: 3, name: 'Carl', color: 'text-green-600', status: 'bankrupt', resources: { Money: 0, Time: 20, Health: 30 } }),
];

const resources: ResourceDefinition[] = [
  { name: 'Money', icon: 'MoneyIcon', barColor: 'bg-green-500', initialValue: 100 },
  { name: 'Time', icon: 'TimeIcon', barColor: 'bg-blue-500', initialValue: 100 },
  { name: 'Health', icon: 'InfoIcon', barColor: 'bg-red-500', initialValue: 100 },
];

describe('PlayerDashboard', () => {
  beforeEach(() => {
    // user-event + global fake timers can cause timeouts; ensure real timers for these tests.
    jest.useRealTimers();
  });

  it('renders current player and resources; roll disabled unless phase START', async () => {
    const onRoll = jest.fn();

    const { container } = render(
      <PlayerDashboard
        currentPlayer={players[0]}
        allPlayers={players}
        onRollDice={onRoll}
        gamePhase={GamePhaseEnum.ROLLING}
        diceRoll={null}
        isLoading={false}
        resources={resources}
      />
    );

    expect(screen.getByText('Current Turn')).toBeInTheDocument();
    // Be specific: the "Current Turn" heading shows the active player's name
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    // Resource labels visible
    expect(screen.getByText('Money')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();

    const rollBtn = screen.getByRole('button', { name: /roll dice/i });
    expect(rollBtn).toBeDisabled();

    // a11y
    const a11y = await checkA11y(container, axe);
    // Basic assertion on violations count to avoid global matcher registration issues
    expect(a11y.violations?.length ?? 0).toBe(0);
  });

  it('enables roll button in START and triggers handler', () => {
    const onRoll = jest.fn();

    render(
      <PlayerDashboard
        currentPlayer={players[0]}
        allPlayers={players}
        onRollDice={onRoll}
        gamePhase={GamePhaseEnum.START}
        diceRoll={null}
        isLoading={false}
        resources={resources}
      />
    );

    const rollBtn = screen.getByRole('button', { name: /roll dice/i });
    expect(rollBtn).toBeEnabled();

    fireEvent.click(rollBtn);
    expect(onRoll).toHaveBeenCalledTimes(1);
  });

  it('shows last dice roll when not in START', () => {
    render(
      <PlayerDashboard
        currentPlayer={players[0]}
        allPlayers={players}
        onRollDice={jest.fn()}
        gamePhase={GamePhaseEnum.SCENARIO_PENDING}
        diceRoll={5}
        isLoading={false}
        resources={resources}
      />
    );

    expect(screen.getByText(/you rolled a/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});