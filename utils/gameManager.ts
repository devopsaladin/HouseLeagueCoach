import { Game, Player, Period, GameSettings, LineupSuggestion } from '../types';
import { StrictLineupGenerator } from './strictLineupGenerator';

export class GameManager {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  // Player management
  markPlayerPresent(playerId: string, isPresent: boolean): void {
    const player = this.game.roster.find(p => p.id === playerId);
    if (player) {
      player.isPresent = isPresent;
    }
  }

  addLatePlayer(playerId: string): void {
    const player = this.game.roster.find(p => p.id === playerId);
    if (player) {
      player.isPresent = true;
      // Calculate catch-up playing time
      this.calculateCatchUpTime(player);
    }
  }

  // Period management
  generateNextLineup(): LineupSuggestion {
    const generator = new StrictLineupGenerator(
      this.game.roster,
      this.game.settings,
      this.game.periods
    );
    return generator.generateOptimalLineup();
  }

  createPeriodFromSuggestion(suggestion: LineupSuggestion): Period {
    const nextPeriodNumber = this.game.periods.length + 1;

    return {
      id: `period-${nextPeriodNumber}`,
      number: nextPeriodNumber,
      lineup: suggestion.players,
      isCompleted: false
    };
  }

  startPeriod(periodId: string): void {
    const period = this.game.periods.find(p => p.id === periodId);
    if (period && !period.isCompleted) {
      // Period is now active - no specific action needed
    }
  }

  completePeriod(periodId: string, actualDuration?: number): void {
    const period = this.game.periods.find(p => p.id === periodId);
    if (period) {
      period.isCompleted = true;
      period.actualDuration = actualDuration || this.game.settings.periodDuration;

      // Update playing time for all players in this period
      period.lineup.forEach(player => {
        const gamePlayer = this.game.roster.find(p => p.id === player.id);
        if (gamePlayer) {
          gamePlayer.totalPlayingTime += period.actualDuration!;
        }
      });
    }
  }

  // Manual lineup adjustments
  swapPlayers(periodId: string, playerOutId: string, playerInId: string): boolean {
    const period = this.game.periods.find(p => p.id === periodId);
    if (!period || period.isCompleted) return false;

    const playerOutIndex = period.lineup.findIndex(p => p.id === playerOutId);
    const playerIn = this.game.roster.find(p => p.id === playerInId && p.isPresent);

    if (playerOutIndex === -1 || !playerIn) return false;

    // Check if player is already in lineup
    if (period.lineup.some(p => p.id === playerInId)) return false;

    period.lineup[playerOutIndex] = playerIn;
    return true;
  }

  // Game statistics
  getPlayingTimeReport(): Array<{ player: Player; minutes: number; target: number; difference: number }> {
    const totalGameTime = this.game.settings.periodsCount * this.game.settings.periodDuration;
    const presentPlayers = this.game.roster.filter(p => p.isPresent).length;
    const playersPerPeriod = this.game.settings.playersOnCourt;

    const targetTimePerPlayer = (totalGameTime * playersPerPeriod) / presentPlayers;

    return this.game.roster
      .filter(p => p.isPresent)
      .map(player => ({
        player,
        minutes: player.totalPlayingTime,
        target: targetTimePerPlayer,
        difference: player.totalPlayingTime - targetTimePerPlayer
      }))
      .sort((a, b) => a.difference - b.difference);
  }

  // Period-based statistics (more accurate for rotation fairness)
  getPeriodReport(): Array<{ player: Player; periodsPlayed: number; targetPeriods: number; difference: number }> {
    const completedPeriods = this.game.periods.filter(p => p.isCompleted).length;
    const presentPlayers = this.game.roster.filter(p => p.isPresent).length;
    const totalPlayerPeriods = completedPeriods * this.game.settings.playersOnCourt;
    const targetPeriodsPerPlayer = totalPlayerPeriods / presentPlayers;

    // Count periods played for each player
    const periodCounts = new Map<string, number>();
    this.game.roster.forEach(player => {
      periodCounts.set(player.id, 0);
    });

    this.game.periods.forEach(period => {
      if (period.isCompleted) {
        period.lineup.forEach(player => {
          const current = periodCounts.get(player.id) || 0;
          periodCounts.set(player.id, current + 1);
        });
      }
    });

    return this.game.roster
      .filter(p => p.isPresent)
      .map(player => ({
        player,
        periodsPlayed: periodCounts.get(player.id) || 0,
        targetPeriods: targetPeriodsPerPlayer,
        difference: (periodCounts.get(player.id) || 0) - targetPeriodsPerPlayer
      }))
      .sort((a, b) => a.difference - b.difference);
  }

  getGameProgress(): { completedPeriods: number; totalPeriods: number; timeRemaining: number } {
    const completed = this.game.periods.filter(p => p.isCompleted).length;
    const total = this.game.settings.periodsCount + this.game.settings.overtimePeriods;
    const timeRemaining = (total - completed) * this.game.settings.periodDuration;

    return {
      completedPeriods: completed,
      totalPeriods: total,
      timeRemaining
    };
  }

  // Helper methods
  private calculateCatchUpTime(player: Player): void {
    const completedPeriods = this.game.periods.filter(p => p.isCompleted).length;
    if (completedPeriods === 0) return;

    const presentPlayers = this.game.roster.filter(p => p.isPresent).length;
    const averageTimePerPeriod = this.game.settings.periodDuration * this.game.settings.playersOnCourt / presentPlayers;
    const expectedTime = averageTimePerPeriod * completedPeriods;

    // Player starts with deficit
    player.totalPlayingTime = Math.max(0, expectedTime * 0.7); // Give them 70% of expected time as starting point
  }

  // Settings management
  updateGameSettings(newSettings: Partial<GameSettings>): void {
    this.game.settings = { ...this.game.settings, ...newSettings };
  }

  canAddOvertimePeriod(): boolean {
    return this.game.periods.length >= this.game.settings.periodsCount;
  }

  addOvertimePeriod(): Period | null {
    if (!this.canAddOvertimePeriod()) return null;

    const overtimePeriods = this.game.periods.length - this.game.settings.periodsCount;
    if (overtimePeriods >= this.game.settings.overtimePeriods) return null;

    const suggestion = this.generateNextLineup();
    return this.createPeriodFromSuggestion(suggestion);
  }
}