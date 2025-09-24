import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import RosterScreen from './screens/RosterScreen';
import GameScreen from './screens/GameScreen';
import StatsScreen from './screens/StatsScreen';

import { Game, Player, Period, LineupSuggestion, GameSettings } from './types';
import { GameManager } from './utils/gameManager';

const Tab = createBottomTabNavigator();

// Sample roster data
const createSampleRoster = (): Player[] => [
  { id: '1', name: 'Alex Johnson', jerseyNumber: 23, skillLevel: 4, position: 'Guard', isPresent: false, totalPlayingTime: 0 },
  { id: '2', name: 'Marcus Williams', jerseyNumber: 15, skillLevel: 5, position: 'Forward', isPresent: false, totalPlayingTime: 0 },
  { id: '3', name: 'Tyler Brown', jerseyNumber: 8, skillLevel: 3, position: 'Center', isPresent: false, totalPlayingTime: 0 },
  { id: '4', name: 'Jamie Davis', jerseyNumber: 12, skillLevel: 4, position: 'Guard', isPresent: false, totalPlayingTime: 0 },
  { id: '5', name: 'Chris Miller', jerseyNumber: 31, skillLevel: 3, position: 'Forward', isPresent: false, totalPlayingTime: 0 },
  { id: '6', name: 'Jordan Wilson', jerseyNumber: 7, skillLevel: 4, position: 'Guard', isPresent: false, totalPlayingTime: 0 },
  { id: '7', name: 'Casey Taylor', jerseyNumber: 20, skillLevel: 2, position: 'Center', isPresent: false, totalPlayingTime: 0 },
  { id: '8', name: 'Ryan Anderson', jerseyNumber: 5, skillLevel: 5, position: 'Forward', isPresent: false, totalPlayingTime: 0 },
  { id: '9', name: 'Sam Thompson', jerseyNumber: 11, skillLevel: 3, position: 'Guard', isPresent: false, totalPlayingTime: 0 },
  { id: '10', name: 'Taylor Garcia', jerseyNumber: 33, skillLevel: 4, position: 'Center', isPresent: false, totalPlayingTime: 0 },
  { id: '11', name: 'Morgan Lee', jerseyNumber: 9, skillLevel: 2, position: 'Any', isPresent: false, totalPlayingTime: 0 },
  { id: '12', name: 'Drew Martinez', jerseyNumber: 14, skillLevel: 3, position: 'Any', isPresent: false, totalPlayingTime: 0 },
];

const defaultGameSettings: GameSettings = {
  periodsCount: 8,
  periodDuration: 4,
  overtimePeriods: 2,
  playersOnCourt: 5,
};

export default function App() {
  const [game, setGame] = useState<Game>({
    id: 'game-1',
    date: new Date(),
    settings: defaultGameSettings,
    roster: createSampleRoster(),
    periods: [],
    isActive: false,
  });

  const [gameManager, setGameManager] = useState<GameManager>(new GameManager(game));
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [lineupSuggestion, setLineupSuggestion] = useState<LineupSuggestion | null>(null);

  useEffect(() => {
    setGameManager(new GameManager(game));
  }, [game]);

  const handlePlayerToggle = (playerId: string, isPresent: boolean) => {
    const updatedRoster = game.roster.map(player =>
      player.id === playerId ? { ...player, isPresent } : player
    );

    setGame(prev => ({
      ...prev,
      roster: updatedRoster,
    }));
  };

  const handlePlayerUpdate = (updatedPlayer: Player) => {
    const updatedRoster = game.roster.map(player =>
      player.id === updatedPlayer.id ? updatedPlayer : player
    );

    setGame(prev => ({
      ...prev,
      roster: updatedRoster,
    }));
  };

  const handlePlayerAdd = (newPlayer: Player) => {
    setGame(prev => ({
      ...prev,
      roster: [...prev.roster, newPlayer],
    }));
  };

  const handlePlayerDelete = (playerId: string) => {
    const updatedRoster = game.roster.filter(player => player.id !== playerId);

    setGame(prev => ({
      ...prev,
      roster: updatedRoster,
    }));
  };

  const handleStartGame = () => {
    setGame(prev => ({ ...prev, isActive: true }));
    handleGenerateLineup();
  };

  const handleGenerateLineup = () => {
    const suggestion = gameManager.generateNextLineup();
    setLineupSuggestion(suggestion);
    setCurrentPeriod(null);
  };

  const handleStartPeriod = (period: Period) => {
    setGame(prev => ({
      ...prev,
      periods: [...prev.periods, period],
    }));
    setCurrentPeriod(period);
    setLineupSuggestion(null);
  };

  const handleCompletePeriod = (periodId: string) => {
    gameManager.completePeriod(periodId);

    setGame(prev => ({
      ...prev,
      roster: [...gameManager['game'].roster],
      periods: prev.periods.map(p =>
        p.id === periodId ? { ...p, isCompleted: true, actualDuration: prev.settings.periodDuration } : p
      ),
    }));

    setCurrentPeriod(null);
    setLineupSuggestion(null);
  };

  const handleSwapPlayer = (playerOutId: string, playerInId: string) => {
    if (!currentPeriod) return;

    const success = gameManager.swapPlayers(currentPeriod.id, playerOutId, playerInId);
    if (success) {
      setGame(prev => ({
        ...prev,
        periods: [...gameManager['game'].periods],
      }));

      setCurrentPeriod(prev => prev ? { ...gameManager['game'].periods.find(p => p.id === prev.id)! } : null);
    }
  };

  if (!game.isActive) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <RosterScreen
          players={game.roster}
          onPlayerToggle={handlePlayerToggle}
          onStartGame={handleStartGame}
          onPlayerUpdate={handlePlayerUpdate}
          onPlayerAdd={handlePlayerAdd}
          onPlayerDelete={handlePlayerDelete}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#666',
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Game"
          options={{
            title: 'Current Game',
            tabBarLabel: 'Game',
          }}
        >
          {() => (
            <GameScreen
              game={game}
              currentPeriod={currentPeriod}
              suggestion={lineupSuggestion}
              onGenerateLineup={handleGenerateLineup}
              onStartPeriod={handleStartPeriod}
              onCompletePeriod={handleCompletePeriod}
              onSwapPlayer={handleSwapPlayer}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Stats"
          options={{
            title: 'Game Statistics',
            tabBarLabel: 'Stats',
          }}
        >
          {() => <StatsScreen game={game} />}
        </Tab.Screen>

        <Tab.Screen
          name="Roster"
          options={{
            title: 'Team Roster',
            tabBarLabel: 'Roster',
          }}
        >
          {() => (
            <RosterScreen
              players={game.roster}
              onPlayerToggle={handlePlayerToggle}
              onStartGame={() => {}}
              onPlayerUpdate={handlePlayerUpdate}
              onPlayerAdd={handlePlayerAdd}
              onPlayerDelete={handlePlayerDelete}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
