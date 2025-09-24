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
import { Team } from '../types';

interface TeamEditModalProps {
  visible: boolean;
  team: Team | null;
  onSave: (team: Team) => void;
  onCancel: () => void;
  onDelete?: (teamId: string) => void;
}

const TEAM_COLORS = [
  { name: 'Red', primary: '#f44336', secondary: '#ffcdd2' },
  { name: 'Blue', primary: '#2196F3', secondary: '#bbdefb' },
  { name: 'Green', primary: '#4CAF50', secondary: '#c8e6c9' },
  { name: 'Orange', primary: '#FF9800', secondary: '#ffe0b2' },
  { name: 'Purple', primary: '#9C27B0', secondary: '#e1bee7' },
  { name: 'Teal', primary: '#009688', secondary: '#b2dfdb' },
  { name: 'Indigo', primary: '#3F51B5', secondary: '#c5cae9' },
  { name: 'Pink', primary: '#E91E63', secondary: '#f8bbd9' },
  { name: 'Brown', primary: '#795548', secondary: '#d7ccc8' },
  { name: 'Dark Blue', primary: '#1976D2', secondary: '#90caf9' },
];

export default function TeamEditModal({
  visible,
  team,
  onSave,
  onCancel,
  onDelete,
}: TeamEditModalProps) {
  const [name, setName] = useState(team?.name || '');
  const [selectedColor, setSelectedColor] = useState(
    team ? TEAM_COLORS.find(c => c.primary === team.primaryColor) || TEAM_COLORS[0] : TEAM_COLORS[0]
  );

  const isNewTeam = !team?.id;

  React.useEffect(() => {
    if (team) {
      setName(team.name);
      setSelectedColor(
        TEAM_COLORS.find(c => c.primary === team.primaryColor) || TEAM_COLORS[0]
      );
    } else {
      setName('');
      setSelectedColor(TEAM_COLORS[0]);
    }
  }, [team, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    const updatedTeam: Team = {
      id: team?.id || `team-${Date.now()}`,
      name: name.trim(),
      avatar: team?.avatar,
      primaryColor: selectedColor.primary,
      secondaryColor: selectedColor.secondary,
      players: team?.players || [],
      createdAt: team?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(updatedTeam);
  };

  const handleDelete = () => {
    if (!team?.id) return;

    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete "${team.name}"? This will permanently remove all players and game data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(team.id),
        },
      ]
    );
  };

  const renderColorSelector = () => (
    <View style={styles.field}>
      <Text style={styles.label}>Team Colors</Text>
      <View style={styles.colorGrid}>
        {TEAM_COLORS.map((color) => (
          <TouchableOpacity
            key={color.name}
            style={[
              styles.colorOption,
              { backgroundColor: color.primary },
              selectedColor.primary === color.primary && styles.selectedColor,
            ]}
            onPress={() => setSelectedColor(color)}
          >
            {selectedColor.primary === color.primary && (
              <Text style={styles.colorCheckmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.colorName}>{selectedColor.name}</Text>
    </View>
  );

  const renderTeamPreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.label}>Preview</Text>
      <View
        style={[
          styles.teamPreview,
          { borderLeftColor: selectedColor.primary },
        ]}
      >
        <View
          style={[
            styles.previewAvatar,
            { backgroundColor: selectedColor.primary },
          ]}
        >
          <Text style={styles.previewAvatarText}>
            {name.substring(0, 2).toUpperCase() || 'TM'}
          </Text>
        </View>
        <Text style={styles.previewName}>{name || 'Team Name'}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView style={styles.content}>
            <Text style={styles.title}>
              {isNewTeam ? 'Create New Team' : 'Edit Team'}
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Team Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter team name"
                autoCapitalize="words"
              />
            </View>

            {renderColorSelector()}

            {renderTeamPreview()}

            {!isNewTeam && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Team Statistics</Text>
                <Text style={styles.statItem}>
                  Players: {team?.players.length || 0}
                </Text>
                <Text style={styles.statItem}>
                  Created: {team?.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={styles.statItem}>
                  Last Updated: {team?.updatedAt ? new Date(team.updatedAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            {!isNewTeam && onDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete Team</Text>
              </TouchableOpacity>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {isNewTeam ? 'Create Team' : 'Save Changes'}
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  colorCheckmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorName: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  previewContainer: {
    marginBottom: 20,
  },
  teamPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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