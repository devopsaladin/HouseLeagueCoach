import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CoachProfile, Team } from '../types';

interface TeamsScreenProps {
  coachProfile: CoachProfile;
  onTeamSelect: (team: Team) => void;
  onTeamEdit: (team: Team) => void;
  onCreateTeam: () => void;
  onUpgradeToPremium: () => void;
  onGoToRoster?: () => void;
}

export default function TeamsScreen({
  coachProfile,
  onTeamSelect,
  onTeamEdit,
  onCreateTeam,
  onUpgradeToPremium,
  onGoToRoster,
}: TeamsScreenProps) {
  const canCreateMoreTeams = coachProfile.isPremium || coachProfile.teams.length === 0;

  const renderTeamCard = (team: Team) => {
    const isActive = team.id === coachProfile.activeTeamId;

    return (
      <View
        key={team.id}
        style={[
          styles.teamCard,
          isActive && styles.activeTeamCard,
          { borderLeftColor: team.primaryColor },
        ]}
      >
        <TouchableOpacity
          style={styles.teamMainArea}
          onPress={() => {
            onTeamSelect(team);
            // If this is already the active team, go to roster
            if (isActive && onGoToRoster) {
              onGoToRoster();
            }
          }}
        >
          <View style={styles.teamAvatar}>
            {team.avatar ? (
              <Image source={{ uri: team.avatar }} style={styles.avatarImage} />
            ) : (
              <View
                style={[
                  styles.defaultAvatar,
                  { backgroundColor: team.primaryColor },
                ]}
              >
                <Text style={styles.avatarText}>
                  {team.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamStats}>
              {team.players.length} players
            </Text>
            <Text style={styles.teamDate}>
              Updated: {new Date(team.updatedAt).toLocaleDateString()}
            </Text>
            {isActive && <Text style={styles.activeLabel}>ACTIVE TEAM</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onTeamEdit(team)}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCreateTeamButton = () => {
    if (canCreateMoreTeams) {
      return (
        <TouchableOpacity style={styles.createButton} onPress={onCreateTeam}>
          <Text style={styles.createButtonText}>+ Create New Team</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.premiumPrompt}>
        <Text style={styles.premiumTitle}>Want More Teams?</Text>
        <Text style={styles.premiumSubtitle}>
          Free version includes 1 team. Upgrade to Premium for unlimited teams!
        </Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradeToPremium}>
          <Text style={styles.upgradeButtonText}>🚀 Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPremiumBadge = () => {
    if (coachProfile.isPremium) {
      return (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>👑 PREMIUM</Text>
        </View>
      );
    }

    return (
      <View style={styles.freeBadge}>
        <Text style={styles.freeBadgeText}>FREE</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Teams</Text>
          {renderPremiumBadge()}
        </View>
        <Text style={styles.subtitle}>
          Manage your basketball teams
        </Text>
      </View>

      <ScrollView style={styles.teamsList}>
        {coachProfile.teams.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Teams Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first team to start coaching!
            </Text>
          </View>
        ) : (
          coachProfile.teams.map(renderTeamCard)
        )}
      </ScrollView>

      {renderCreateTeamButton()}

      {coachProfile.activeTeamId && onGoToRoster && (
        <TouchableOpacity style={styles.goToRosterButton} onPress={onGoToRoster}>
          <Text style={styles.goToRosterText}>
            🏀 Go to {coachProfile.teams.find(t => t.id === coachProfile.activeTeamId)?.name || 'Team'} Roster
          </Text>
        </TouchableOpacity>
      )}

      {coachProfile.isPremium && (
        <View style={styles.premiumFeatures}>
          <Text style={styles.featuresTitle}>Premium Features Active:</Text>
          <Text style={styles.featureItem}>✓ Unlimited teams</Text>
          <Text style={styles.featureItem}>✓ Advanced statistics</Text>
          <Text style={styles.featureItem}>✓ Export game reports</Text>
          <Text style={styles.featureItem}>✓ Priority support</Text>
        </View>
      )}
    </SafeAreaView>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  freeBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  teamsList: {
    flex: 1,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTeamCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  teamMainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamAvatar: {
    marginRight: 16,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teamStats: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  teamDate: {
    fontSize: 12,
    color: '#999',
  },
  activeLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  editButtonText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumPrompt: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goToRosterButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  goToRosterText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumFeatures: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 4,
  },
});