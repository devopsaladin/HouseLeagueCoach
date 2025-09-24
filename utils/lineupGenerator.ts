import { Player, GameSettings, Period, LineupSuggestion } from '../types';

export class LineupGenerator {
  private players: Player[];
  private settings: GameSettings;
  private existingPeriods: Period[];

  constructor(players: Player[], settings: GameSettings, existingPeriods: Period[] = []) {
    this.players = players.filter(p => p.isPresent);
    this.settings = settings;
    this.existingPeriods = existingPeriods;
  }

  generateOptimalLineup(): LineupSuggestion {
    const playingTimeTargets = this.calculatePlayingTimeTargets();
    const candidates = this.generateCandidateLineups();

    return this.selectBestLineup(candidates, playingTimeTargets);
  }

  private calculatePlayingTimeTargets(): Map<string, number> {
    const totalGameTime = this.settings.periodsCount * this.settings.periodDuration;
    const presentPlayers = this.players.length;
    const playersPerPeriod = this.settings.playersOnCourt;

    const targetTimePerPlayer = (totalGameTime * playersPerPeriod) / presentPlayers;

    const targets = new Map<string, number>();
    this.players.forEach(player => {
      targets.set(player.id, targetTimePerPlayer - player.totalPlayingTime);
    });

    return targets;
  }

  private generateCandidateLineups(): Player[][] {
    const candidates: Player[][] = [];
    const playersArray = [...this.players];

    // Sort players by playing time (ascending) to prioritize those who played less
    // Secondary sort by skill to maintain some balance when playing times are equal
    playersArray.sort((a, b) => {
      const timeDiff = a.totalPlayingTime - b.totalPlayingTime;
      if (Math.abs(timeDiff) < 0.1) { // If playing times are very close (within 6 seconds)
        return b.skillLevel - a.skillLevel; // Prefer higher skill as tie-breaker
      }
      return timeDiff; // Otherwise, strictly prioritize less playing time
    });

    // Generate combinations using a greedy approach with some variations
    for (let attempt = 0; attempt < 15; attempt++) { // Increased attempts for better options
      const lineup = this.createGreedyLineup(playersArray, attempt);
      if (lineup.length === this.settings.playersOnCourt) {
        candidates.push(lineup);
      }
    }

    return candidates;
  }

  private createGreedyLineup(players: Player[], variation: number): Player[] {
    const lineup: Player[] = [];
    const available = [...players];

    // Add some randomness for variation while keeping it mostly greedy
    if (variation > 0) {
      this.shuffleArray(available, variation);
    }

    // Try to balance positions
    const positionGroups = this.groupByPosition(available);

    // Fill lineup trying to balance skill and playing time
    while (lineup.length < this.settings.playersOnCourt && available.length > 0) {
      const nextPlayer = this.selectNextPlayer(available, lineup);
      if (nextPlayer) {
        lineup.push(nextPlayer);
        available.splice(available.indexOf(nextPlayer), 1);
      } else {
        break;
      }
    }

    return lineup;
  }

  private selectNextPlayer(available: Player[], currentLineup: Player[]): Player | null {
    if (available.length === 0) return null;

    // Calculate current lineup stats
    const currentSkillSum = currentLineup.reduce((sum, p) => sum + p.skillLevel, 0);
    const positions = currentLineup.map(p => p.position);

    // Score each available player
    let bestPlayer = available[0];
    let bestScore = -1;

    for (const player of available) {
      let score = 0;

      // Playing time priority (MUCH higher weight - this is most important)
      const maxPlayingTime = Math.max(...this.players.map(p => p.totalPlayingTime));
      const playingTimeScore = maxPlayingTime > 0 ? (maxPlayingTime - player.totalPlayingTime) / maxPlayingTime : 1;
      score += playingTimeScore * 10; // Increased from 3 to 10

      // Position diversity bonus (moderate weight)
      if (player.position !== 'Any' && !positions.includes(player.position)) {
        score += 1.5;
      }

      // Skill balance - prefer players that keep the average close to team average (low weight)
      const teamAvgSkill = this.players.reduce((sum, p) => sum + p.skillLevel, 0) / this.players.length;
      const targetSkillSum = teamAvgSkill * this.settings.playersOnCourt;
      const skillDifference = Math.abs((currentSkillSum + player.skillLevel) - targetSkillSum);
      score += (5 - skillDifference) * 0.3; // Reduced from 0.5 to 0.3

      if (score > bestScore) {
        bestScore = score;
        bestPlayer = player;
      }
    }

    return bestPlayer;
  }

  private selectBestLineup(candidates: Player[][], playingTimeTargets: Map<string, number>): LineupSuggestion {
    let bestLineup = candidates[0];
    let bestScore = -1;

    for (const lineup of candidates) {
      const score = this.evaluateLineup(lineup, playingTimeTargets);
      if (score > bestScore) {
        bestScore = score;
        bestLineup = lineup;
      }
    }

    return {
      players: bestLineup,
      averageSkillLevel: bestLineup.reduce((sum, p) => sum + p.skillLevel, 0) / bestLineup.length,
      playingTimeBalance: this.calculatePlayingTimeBalance(bestLineup, playingTimeTargets),
      positionBalance: this.calculatePositionBalance(bestLineup)
    };
  }

  private evaluateLineup(lineup: Player[], playingTimeTargets: Map<string, number>): number {
    const playingTimeBalance = this.calculatePlayingTimeBalance(lineup, playingTimeTargets);
    const positionBalance = this.calculatePositionBalance(lineup);
    const skillBalance = this.calculateSkillBalance(lineup);

    // Heavily prioritize playing time balance - this is most important for house leagues
    return playingTimeBalance * 0.75 + positionBalance * 0.15 + skillBalance * 0.1;
  }

  private calculatePlayingTimeBalance(lineup: Player[], targets: Map<string, number>): number {
    const deviations = lineup.map(player => {
      const target = targets.get(player.id) || 0;
      return Math.abs(target - this.settings.periodDuration);
    });

    const averageDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;

    // More sensitive to playing time differences - penalize imbalances more heavily
    const normalizedDeviation = averageDeviation / this.settings.periodDuration;
    return Math.max(0, 1 - Math.pow(normalizedDeviation, 0.5)); // Square root makes it more sensitive to smaller differences
  }

  private calculatePositionBalance(lineup: Player[]): number {
    const positions = lineup.map(p => p.position);
    const uniquePositions = new Set(positions.filter(p => p !== 'Any')).size;
    const maxPossiblePositions = Math.min(3, lineup.length); // Guard, Forward, Center

    return uniquePositions / maxPossiblePositions;
  }

  private calculateSkillBalance(lineup: Player[]): number {
    const skills = lineup.map(p => p.skillLevel);
    const avg = skills.reduce((sum, skill) => sum + skill, 0) / skills.length;
    const variance = skills.reduce((sum, skill) => sum + Math.pow(skill - avg, 2), 0) / skills.length;

    // Lower variance is better, normalize to 0-1 scale
    return Math.max(0, 1 - (variance / 4)); // Max variance is 4 (1 vs 5 skill levels)
  }

  private groupByPosition(players: Player[]): Map<string, Player[]> {
    const groups = new Map<string, Player[]>();

    players.forEach(player => {
      if (!groups.has(player.position)) {
        groups.set(player.position, []);
      }
      groups.get(player.position)!.push(player);
    });

    return groups;
  }

  private shuffleArray(array: Player[], seed: number): void {
    // Simple shuffle with some deterministic variation
    for (let i = 0; i < Math.min(3, seed); i++) {
      const randomIndex = Math.floor(Math.random() * array.length);
      const temp = array[0];
      array[0] = array[randomIndex];
      array[randomIndex] = temp;
    }
  }
}