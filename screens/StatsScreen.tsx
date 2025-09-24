import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Player, Game } from '../types';

interface StatsScreenProps {
  game: Game;
}

export default function StatsScreen({ game }: StatsScreenProps) {
  const formatTime = (minutes: number) => {
    return `${Math.floor(minutes)}:${String(Math.round((minutes % 1) * 60)).padStart(2, '0')}`;
  };

  const calculatePlayingTimeReport = () => {
    const totalGameTime = game.settings.periodsCount * game.settings.periodDuration;
    const presentPlayers = game.roster.filter(p => p.isPresent).length;
    const playersPerPeriod = game.settings.playersOnCourt;

    const targetTimePerPlayer = (totalGameTime * playersPerPeriod) / presentPlayers;

    return game.roster
      .filter(p => p.isPresent)
      .map(player => ({
        player,
        minutes: player.totalPlayingTime,
        target: targetTimePerPlayer,
        difference: player.totalPlayingTime - targetTimePerPlayer,
      }))
      .sort((a, b) => a.difference - b.difference);
  };

  const playingTimeReport = calculatePlayingTimeReport();

  // Import GameManager to get period-based stats
  const gameManager = React.useMemo(() => {
    const { GameManager } = require('../utils/gameManager');
    return new GameManager(game);
  }, [game]);

  const periodReport = gameManager.getPeriodReport();
  const completedPeriods = game.periods.filter(p => p.isCompleted).length;

  const renderPlayingTimeCard = (item: {
    player: Player;
    minutes: number;
    target: number;
    difference: number;
  }) => {
    const isOver = item.difference > 0;
    const isUnder = item.difference < -1;

    return (
      <View
        key={item.player.id}
        style={[
          styles.playerCard,
          isOver && styles.overTimeCard,
          isUnder && styles.underTimeCard,
        ]}
      >
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            #{item.player.jerseyNumber} {item.player.name}
          </Text>
          <Text style={styles.playerPosition}>
            {item.player.position} • Skill: {item.player.skillLevel}/5
          </Text>
        </View>

        <View style={styles.timeInfo}>
          <Text style={styles.actualTime}>
            {formatTime(item.minutes)}
          </Text>
          <Text style={styles.targetTime}>
            Target: {formatTime(item.target)}
          </Text>
          <Text style={[
            styles.difference,
            isOver && styles.overTime,
            isUnder && styles.underTime,
          ]}>
            {item.difference > 0 ? '+' : ''}{formatTime(Math.abs(item.difference))}
          </Text>
        </View>
      </View>
    );
  };

  const renderPeriodCard = (item: {
    player: Player;
    periodsPlayed: number;
    targetPeriods: number;
    difference: number;
  }) => {
    const isOver = item.difference > 0.5;
    const isUnder = item.difference < -0.5;

    return (
      <View
        key={item.player.id}
        style={[
          styles.playerCard,
          isOver && styles.overTimeCard,
          isUnder && styles.underTimeCard,
        ]}
      >
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            #{item.player.jerseyNumber} {item.player.name}
          </Text>
          <Text style={styles.playerPosition}>
            {item.player.position} • Skill: {item.player.skillLevel}/5
          </Text>
        </View>

        <View style={styles.timeInfo}>
          <Text style={styles.actualTime}>
            {item.periodsPlayed} periods
          </Text>
          <Text style={styles.targetTime}>
            Target: {item.targetPeriods.toFixed(1)}
          </Text>
          <Text style={[
            styles.difference,
            isOver && styles.overTime,
            isUnder && styles.underTime,
          ]}>
            {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}
          </Text>
        </View>
      </View>
    );
  };

  const renderGameSummary = () => {
    const totalPeriods = game.settings.periodsCount;
    const averagePlayingTime = playingTimeReport.reduce((sum, item) => sum + item.minutes, 0) / playingTimeReport.length;
    const timeVariance = playingTimeReport.reduce((sum, item) => sum + Math.pow(item.minutes - averagePlayingTime, 2), 0) / playingTimeReport.length;
    const timeBalance = Math.max(0, 1 - (Math.sqrt(timeVariance) / averagePlayingTime));

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Game Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Periods Completed:</Text>
          <Text style={styles.summaryValue}>{completedPeriods} / {totalPeriods}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Players Present:</Text>
          <Text style={styles.summaryValue}>{playingTimeReport.length}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Playing Time Balance:</Text>
          <Text style={[
            styles.summaryValue,
            { color: timeBalance > 0.8 ? '#4CAF50' : timeBalance > 0.6 ? '#FF9800' : '#f44336' }
          ]}>
            {Math.round(timeBalance * 100)}%
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Average Playing Time:</Text>
          <Text style={styles.summaryValue}>{formatTime(averagePlayingTime)}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderGameSummary()}

      <View style={styles.playingTimeContainer}>
        <Text style={styles.sectionTitle}>Period Fairness Report</Text>
        <Text style={styles.sectionSubtitle}>
          Periods played - this is the key metric for fairness
        </Text>

        {periodReport.map(renderPeriodCard)}
      </View>

      <View style={styles.playingTimeContainer}>
        <Text style={styles.sectionTitle}>Playing Time Report</Text>
        <Text style={styles.sectionSubtitle}>
          Time in minutes (secondary metric)
        </Text>

        {playingTimeReport.map(renderPlayingTimeCard)}
      </View>

      {completedPeriods > 0 && (
        <View style={styles.periodsContainer}>
          <Text style={styles.sectionTitle}>Period History</Text>
          {game.periods
            .filter(p => p.isCompleted)
            .map((period) => (
              <View key={period.id} style={styles.periodCard}>
                <Text style={styles.periodTitle}>
                  Period {period.number}
                  {period.actualDuration && period.actualDuration !== game.settings.periodDuration &&
                    ` (${formatTime(period.actualDuration)})`
                  }
                </Text>
                <View style={styles.periodLineup}>
                  {period.lineup.map((player) => (
                    <Text key={player.id} style={styles.periodPlayer}>
                      #{player.jerseyNumber} {player.name}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playingTimeContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
  },
  overTimeCard: {
    borderLeftColor: '#FF9800',
  },
  underTimeCard: {
    borderLeftColor: '#2196F3',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playerPosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  actualTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  targetTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  difference: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  overTime: {
    color: '#FF9800',
  },
  underTime: {
    color: '#2196F3',
  },
  periodsContainer: {
    marginBottom: 16,
  },
  periodCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  periodLineup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodPlayer: {
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#666',
  },
});