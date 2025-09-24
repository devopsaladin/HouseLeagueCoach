import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Player } from '../types';
import PlayerEditModal from '../components/PlayerEditModal';

interface RosterScreenProps {
  players: Player[];
  onPlayerToggle: (playerId: string, isPresent: boolean) => void;
  onStartGame: () => void;
  onPlayerUpdate?: (player: Player) => void;
  onPlayerAdd?: (player: Player) => void;
  onPlayerDelete?: (playerId: string) => void;
}

export default function RosterScreen({
  players,
  onPlayerToggle,
  onStartGame,
  onPlayerUpdate,
  onPlayerAdd,
  onPlayerDelete
}: RosterScreenProps) {
  const presentPlayers = players.filter(p => p.isPresent);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleStartGame = () => {
    if (presentPlayers.length < 5) {
      Alert.alert(
        'Not Enough Players',
        'You need at least 5 players present to start the game.',
        [{ text: 'OK' }]
      );
      return;
    }

    onStartGame();
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowEditModal(true);
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setShowAddModal(true);
  };

  const handleSavePlayer = (player: Player) => {
    if (editingPlayer) {
      onPlayerUpdate?.(player);
    } else {
      onPlayerAdd?.(player);
    }
    setShowEditModal(false);
    setShowAddModal(false);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId: string) => {
    onPlayerDelete?.(playerId);
    setShowEditModal(false);
    setEditingPlayer(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setShowAddModal(false);
    setEditingPlayer(null);
  };

  const existingJerseyNumbers = players.map(p => p.jerseyNumber);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Team Roster</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPlayer}
          >
            <Text style={styles.addButtonText}>+ Add Player</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {presentPlayers.length} of {players.length} players present
        </Text>
      </View>

      <ScrollView style={styles.playerList}>
        {players.map((player) => (
          <View
            key={player.id}
            style={[
              styles.playerCard,
              player.isPresent ? styles.presentCard : styles.absentCard,
            ]}
          >
            <TouchableOpacity
              style={styles.playerMainArea}
              onPress={() => onPlayerToggle(player.id, !player.isPresent)}
            >
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                  #{player.jerseyNumber} {player.name}
                </Text>
                <Text style={styles.playerDetails}>
                  {player.position} • Skill: {player.skillLevel}/5
                </Text>
              </View>
              <View style={[
                styles.statusIndicator,
                player.isPresent ? styles.present : styles.absent,
              ]}>
                <Text style={styles.statusText}>
                  {player.isPresent ? '✓' : '✗'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditPlayer(player)}
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.startButton,
          presentPlayers.length < 5 && styles.startButtonDisabled,
        ]}
        onPress={handleStartGame}
        disabled={presentPlayers.length < 5}
      >
        <Text style={styles.startButtonText}>
          Start Game ({presentPlayers.length} players)
        </Text>
      </TouchableOpacity>

      <PlayerEditModal
        visible={showEditModal}
        player={editingPlayer}
        onSave={handleSavePlayer}
        onCancel={handleCancelEdit}
        onDelete={handleDeletePlayer}
        existingJerseyNumbers={existingJerseyNumbers.filter(num => num !== editingPlayer?.jerseyNumber)}
      />

      <PlayerEditModal
        visible={showAddModal}
        player={null}
        onSave={handleSavePlayer}
        onCancel={handleCancelEdit}
        existingJerseyNumbers={existingJerseyNumbers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  playerList: {
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerMainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  editButtonText: {
    fontSize: 16,
  },
  presentCard: {
    backgroundColor: '#fff',
  },
  absentCard: {
    backgroundColor: '#f8f8f8',
    opacity: 0.7,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  playerDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  present: {
    backgroundColor: '#4CAF50',
  },
  absent: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});