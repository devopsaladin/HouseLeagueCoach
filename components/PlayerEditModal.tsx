import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Player } from '../types';

interface PlayerEditModalProps {
  visible: boolean;
  player: Player | null;
  onSave: (player: Player) => void;
  onCancel: () => void;
  onDelete?: (playerId: string) => void;
  existingJerseyNumbers: number[];
}

export default function PlayerEditModal({
  visible,
  player,
  onSave,
  onCancel,
  onDelete,
  existingJerseyNumbers,
}: PlayerEditModalProps) {
  const [name, setName] = useState(player?.name || '');
  const [jerseyNumber, setJerseyNumber] = useState(player?.jerseyNumber?.toString() || '');
  const [skillLevel, setSkillLevel] = useState(player?.skillLevel || 3);
  const [position, setPosition] = useState(player?.position || 'Any');

  const isNewPlayer = !player?.id;

  React.useEffect(() => {
    if (player) {
      setName(player.name);
      setJerseyNumber(player.jerseyNumber.toString());
      setSkillLevel(player.skillLevel);
      setPosition(player.position);
    } else {
      setName('');
      setJerseyNumber('');
      setSkillLevel(3);
      setPosition('Any');
    }
  }, [player, visible]);

  const handleSave = () => {
    const jerseyNum = parseInt(jerseyNumber);

    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Player name is required');
      return;
    }

    if (!jerseyNumber || isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
      Alert.alert('Error', 'Please enter a valid jersey number (1-99)');
      return;
    }

    // Check if jersey number is already taken (except for current player)
    if (existingJerseyNumbers.includes(jerseyNum) && jerseyNum !== player?.jerseyNumber) {
      Alert.alert('Error', `Jersey number ${jerseyNum} is already taken`);
      return;
    }

    const updatedPlayer: Player = {
      id: player?.id || `player-${Date.now()}`,
      name: name.trim(),
      jerseyNumber: jerseyNum,
      skillLevel,
      position: position as Player['position'],
      isPresent: player?.isPresent || false,
      totalPlayingTime: player?.totalPlayingTime || 0,
    };

    onSave(updatedPlayer);
  };

  const handleDelete = () => {
    if (!player?.id) return;

    Alert.alert(
      'Delete Player',
      `Are you sure you want to delete ${player.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(player.id),
        },
      ]
    );
  };

  const positions: Player['position'][] = ['Guard', 'Forward', 'Center', 'Any'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView style={styles.content}>
            <Text style={styles.title}>
              {isNewPlayer ? 'Add New Player' : 'Edit Player'}
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Player Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter player name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Jersey Number * (1-99)</Text>
              <TextInput
                style={styles.input}
                value={jerseyNumber}
                onChangeText={setJerseyNumber}
                placeholder="Jersey #"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Skill Level (1-5)</Text>
              <View style={styles.skillSelector}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.skillButton,
                      skillLevel === level && styles.skillButtonActive,
                    ]}
                    onPress={() => setSkillLevel(level)}
                  >
                    <Text
                      style={[
                        styles.skillButtonText,
                        skillLevel === level && styles.skillButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.skillDescription}>
                1=Beginner, 2=Developing, 3=Average, 4=Good, 5=Excellent
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Primary Position</Text>
              <View style={styles.positionSelector}>
                {positions.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={[
                      styles.positionButton,
                      position === pos && styles.positionButtonActive,
                    ]}
                    onPress={() => setPosition(pos)}
                  >
                    <Text
                      style={[
                        styles.positionButtonText,
                        position === pos && styles.positionButtonTextActive,
                      ]}
                    >
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            {!isNewPlayer && onDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete Player</Text>
              </TouchableOpacity>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {isNewPlayer ? 'Add Player' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  skillSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skillButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  skillButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  skillButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  skillButtonTextActive: {
    color: '#fff',
  },
  skillDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  positionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  positionButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  positionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  positionButtonTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});