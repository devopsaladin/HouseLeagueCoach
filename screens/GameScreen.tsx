import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Game, Period, LineupSuggestion, Player } from '../types';

interface GameScreenProps {
  game: Game;
  currentPeriod: Period | null;
  suggestion: LineupSuggestion | null;
  onGenerateLineup: () => void;
  onStartPeriod: (period: Period) => void;
  onCompletePeriod: (periodId: string) => void;
  onSwapPlayer: (playerOutId: string, playerInId: string) => void;
}

export default function GameScreen({
  game,
  currentPeriod,
  suggestion,
  onGenerateLineup,
  onStartPeriod,
  onCompletePeriod,
  onSwapPlayer,
}: GameScreenProps) {
  const [selectedPlayerOut, setSelectedPlayerOut] = useState<string | null>(null);

  const presentPlayers = game.roster.filter(p => p.isPresent);
  const benchPlayers = presentPlayers.filter(
    p => !currentPeriod?.lineup.some(lp => lp.id === p.id)
  );

  const handlePlayerSwap = (playerInId: string) => {
    if (!selectedPlayerOut || !currentPeriod) return;

    onSwapPlayer(selectedPlayerOut, playerInId);
    setSelectedPlayerOut(null);
  };

  const formatTime = (minutes: number) => {
    return `${Math.floor(minutes)}:${String(Math.round((minutes % 1) * 60)).padStart(2, '0')}`;
  };

  const renderPeriodProgress = () => {
    const completed = game.periods.filter(p => p.isCompleted).length;
    const total = game.settings.periodsCount;

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Game Progress</Text>
        <View style={styles.progressBar}>
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < completed ? styles.completedSegment : styles.pendingSegment,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          Period {completed + 1} of {total}
        </Text>
      </View>
    );
  };

  const renderCurrentLineup = () => {
    if (!currentPeriod) return null;

    return (
      <View style={styles.lineupContainer}>
        <View style={styles.lineupHeader}>
          <Text style={styles.lineupTitle}>
            Period {currentPeriod.number} Lineup
          </Text>
          {!currentPeriod.isCompleted && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => onCompletePeriod(currentPeriod.id)}
            >
              <Text style={styles.completeButtonText}>Complete Period</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.lineup}>
          {currentPeriod.lineup.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.lineupPlayer,
                selectedPlayerOut === player.id && styles.selectedPlayer,
              ]}
              onPress={() => setSelectedPlayerOut(
                selectedPlayerOut === player.id ? null : player.id
              )}
            >
              <Text style={styles.lineupPlayerName}>
                #{player.jerseyNumber} {player.name}
              </Text>
              <Text style={styles.lineupPlayerInfo}>
                {player.position} • {formatTime(player.totalPlayingTime)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderBench = () => {
    if (benchPlayers.length === 0) return null;

    return (
      <View style={styles.benchContainer}>
        <Text style={styles.benchTitle}>Bench Players</Text>
        <View style={styles.bench}>
          {benchPlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.benchPlayer,
                selectedPlayerOut && styles.benchPlayerActive,
              ]}
              onPress={() => selectedPlayerOut && handlePlayerSwap(player.id)}
              disabled={!selectedPlayerOut}
            >
              <Text style={styles.benchPlayerName}>
                #{player.jerseyNumber} {player.name}
              </Text>
              <Text style={styles.benchPlayerInfo}>
                {formatTime(player.totalPlayingTime)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSuggestion = () => {
    if (!suggestion || currentPeriod) return null;

    return (
      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>Suggested Lineup</Text>
        <View style={styles.suggestionStats}>
          <Text style={styles.suggestionStat}>
            Avg Skill: {suggestion.averageSkillLevel.toFixed(1)}
          </Text>
          <Text style={styles.suggestionStat}>
            Balance: {Math.round(suggestion.playingTimeBalance * 100)}%
          </Text>
        </View>

        <View style={styles.suggestedLineup}>
          {suggestion.players.map((player) => (
            <View key={player.id} style={styles.suggestedPlayer}>
              <Text style={styles.suggestedPlayerName}>
                #{player.jerseyNumber} {player.name}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => {
            const period: Period = {
              id: `period-${game.periods.length + 1}`,
              number: game.periods.length + 1,
              lineup: suggestion.players,
              isCompleted: false,
            };
            onStartPeriod(period);
          }}
        >
          <Text style={styles.acceptButtonText}>Start This Period</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      {renderPeriodProgress()}

      {renderCurrentLineup()}
      {renderBench()}
      {renderSuggestion()}

      {!currentPeriod && !suggestion && (
        <TouchableOpacity style={styles.generateButton} onPress={onGenerateLineup}>
          <Text style={styles.generateButtonText}>
            Generate Next Lineup
          </Text>
        </TouchableOpacity>
      )}

      {selectedPlayerOut && (
        <Text style={styles.swapInstructions}>
          Tap a bench player to swap with the selected player
        </Text>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    marginHorizontal: 1,
  },
  completedSegment: {
    backgroundColor: '#4CAF50',
  },
  pendingSegment: {
    backgroundColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  lineupContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  lineupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lineupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lineup: {
    gap: 8,
  },
  lineupPlayer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlayer: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  lineupPlayerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lineupPlayerInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  benchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  benchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bench: {
    gap: 8,
  },
  benchPlayer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    opacity: 0.6,
  },
  benchPlayerActive: {
    opacity: 1,
    backgroundColor: '#e8f5e8',
  },
  benchPlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  benchPlayerInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  suggestionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  suggestionStat: {
    fontSize: 14,
    color: '#666',
  },
  suggestedLineup: {
    gap: 6,
    marginBottom: 16,
  },
  suggestedPlayer: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  suggestedPlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  swapInstructions: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    fontStyle: 'italic',
  },
});