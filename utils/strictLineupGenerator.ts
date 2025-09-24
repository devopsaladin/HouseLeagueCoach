import { Player, GameSettings, Period, LineupSuggestion } from '../types';

export class StrictLineupGenerator {
  private players: Player[];
  private settings: GameSettings;
  private existingPeriods: Period[];

  constructor(players: Player[], settings: GameSettings, existingPeriods: Period[] = []) {
    this.players = players.filter(p => p.isPresent);
    this.settings = settings;
    this.existingPeriods = existingPeriods;
  }

  generateOptimalLineup(): LineupSuggestion {
    // Calculate how many periods each player has played
    const periodCounts = this.calculatePeriodCounts();

    // Generate lineup using strict rotation logic
    const lineup = this.generateStrictRotationLineup(periodCounts);

    return {
      players: lineup,
      averageSkillLevel: lineup.reduce((sum, p) => sum + p.skillLevel, 0) / lineup.length,
      playingTimeBalance: this.calculateRotationBalance(periodCounts, lineup),
      positionBalance: this.calculatePositionBalance(lineup)
    };
  }

  private calculatePeriodCounts(): Map<string, number> {
    const counts = new Map<string, number>();

    // Initialize all players to 0 periods
    this.players.forEach(player => {
      counts.set(player.id, 0);
    });

    // Count actual periods played
    this.existingPeriods.forEach(period => {
      if (period.isCompleted) {
        period.lineup.forEach(player => {
          const current = counts.get(player.id) || 0;
          counts.set(player.id, current + 1);
        });
      }
    });

    return counts;
  }

  private generateStrictRotationLineup(periodCounts: Map<string, number>): Player[] {
    // Sort players by periods played (ascending), then by skill for tie-breaking
    const sortedPlayers = [...this.players].sort((a, b) => {
      const aCount = periodCounts.get(a.id) || 0;
      const bCount = periodCounts.get(b.id) || 0;

      if (aCount !== bCount) {
        return aCount - bCount; // Player with fewer periods first
      }

      // If equal periods, prefer better skill for competitive balance
      return b.skillLevel - a.skillLevel;
    });

    // For perfect fairness, use round-robin style selection
    const lineup: Player[] = [];
    const available = [...sortedPlayers];

    // Fill lineup with players who have played the least periods
    while (lineup.length < this.settings.playersOnCourt && available.length > 0) {
      // Find all players tied for minimum periods played
      const minPeriods = Math.min(...available.map(p => periodCounts.get(p.id) || 0));
      const minPlayers = available.filter(p => (periodCounts.get(p.id) || 0) === minPeriods);

      let selectedPlayer: Player;

      if (minPlayers.length === 1) {
        // Only one player with minimum periods
        selectedPlayer = minPlayers[0];
      } else {
        // Multiple players tied - use position and skill balancing
        selectedPlayer = this.selectBestFromTied(minPlayers, lineup);
      }

      lineup.push(selectedPlayer);
      available.splice(available.indexOf(selectedPlayer), 1);
    }

    return lineup;
  }

  private selectBestFromTied(tiedPlayers: Player[], currentLineup: Player[]): Player {
    // Among tied players, prefer position diversity first, then skill balance
    const currentPositions = currentLineup.map(p => p.position);

    // First, try to find a player with a position we don't have
    for (const player of tiedPlayers) {
      if (player.position !== 'Any' && !currentPositions.includes(player.position)) {
        return player;
      }
    }

    // If no position diversity possible, prefer higher skill level
    return tiedPlayers.reduce((best, current) =>
      current.skillLevel > best.skillLevel ? current : best
    );
  }

  private calculateRotationBalance(periodCounts: Map<string, number>, proposedLineup: Player[]): number {
    // Calculate what period counts would be after this lineup plays
    const projectedCounts = new Map(periodCounts);
    proposedLineup.forEach(player => {
      const current = projectedCounts.get(player.id) || 0;
      projectedCounts.set(player.id, current + 1);
    });

    // Calculate how balanced the period counts are
    const counts = Array.from(projectedCounts.values());
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const difference = maxCount - minCount;

    // Perfect balance = 1.0, each additional period difference reduces score
    return Math.max(0, 1 - (difference * 0.33)); // Each period difference costs 33% of score
  }

  private calculatePositionBalance(lineup: Player[]): number {
    const positions = lineup.map(p => p.position);
    const uniquePositions = new Set(positions.filter(p => p !== 'Any')).size;
    const maxPossiblePositions = Math.min(3, lineup.length); // Guard, Forward, Center

    return uniquePositions / maxPossiblePositions;
  }

  // Debug method to see period distribution
  debugPeriodDistribution(): { playerId: string, name: string, periods: number }[] {
    const periodCounts = this.calculatePeriodCounts();

    return this.players.map(player => ({
      playerId: player.id,
      name: player.name,
      periods: periodCounts.get(player.id) || 0
    })).sort((a, b) => a.periods - b.periods);
  }
}