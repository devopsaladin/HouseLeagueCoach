# House League Coach Helper

A React Native mobile app designed specifically for basketball house league coaches to easily manage player rotations, balance playing time, and maintain competitive lineups.

## Key Features

### ✅ Implemented
- **Player Attendance Management**: Quick check-in system for marking present/absent players
- **Automated Lineup Generation**: Smart algorithm that balances:
  - Equal playing time distribution
  - Skill level balance across lineups
  - Position diversity (Guards, Forwards, Centers)
- **Manual Lineup Adjustments**: Tap-to-swap players during periods
- **Real-time Playing Time Tracking**: Visual indicators for over/under target times
- **Game Progress Tracking**: Period-by-period game management
- **Statistics Dashboard**: Playing time reports and game summaries
- **Configurable Game Settings**:
  - Adjustable number of periods (default: 8)
  - Configurable period duration (default: 4 minutes)
  - Overtime periods support
  - Players on court (default: 5)

### 🔧 Core Algorithm Features
- **Playing Time Balancing**: Prioritizes players with less playing time
- **Skill Distribution**: Ensures each lineup has balanced skill levels (1-5 scale)
- **Position Balance**: Attempts to include diverse positions in each lineup
- **Late Player Handling**: Automatically adjusts rotations when players arrive late

## Getting Started

### Prerequisites
- Node.js (v20.18.3 or later)
- npm or yarn
- Expo CLI
- Mobile device with Expo Go app OR iOS Simulator/Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HouseLeagueCoachHelper
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Open the app:
   - **Mobile device**: Scan QR code with Expo Go app
   - **iOS Simulator**: Press 'i' in terminal
   - **Android Emulator**: Press 'a' in terminal

## How to Use

### 1. Team Setup
- The app comes pre-loaded with a sample roster of 12 players
- Each player has configurable:
  - Name and jersey number
  - Skill level (1-5 scale)
  - Preferred position (Guard, Forward, Center, Any)

### 2. Game Day Workflow

**Step 1: Attendance**
- Mark present/absent players by tapping their names
- Visual indicators show attendance status
- Minimum 5 players required to start

**Step 2: Start Game**
- Tap "Start Game" to enter game mode
- App automatically generates first lineup suggestion

**Step 3: Manage Periods**
- Review suggested lineup with balance metrics
- Accept lineup or generate new suggestion
- Start period to begin tracking time
- Make player swaps by tapping lineup player, then bench player
- Complete period when finished

**Step 4: Monitor Progress**
- **Game Tab**: Current lineup and period management
- **Stats Tab**: Playing time reports and balance metrics
- **Roster Tab**: Quick attendance adjustments

### 3. Key Metrics
- **Playing Time Balance**: Percentage showing how evenly time is distributed
- **Average Skill Level**: Team balance indicator for current lineup
- **Position Balance**: Diversity of positions in lineup

## Technical Architecture

### Core Components
- **TypeScript Types**: Strongly typed data models for players, games, periods
- **LineupGenerator**: Advanced algorithm for optimal lineup creation
- **GameManager**: State management for game flow and player tracking
- **React Navigation**: Tab-based navigation between screens

### Algorithm Details
The lineup generation uses a weighted scoring system:
- **Playing Time (50%)**: Prioritizes players with less court time
- **Position Balance (30%)**: Encourages position diversity
- **Skill Balance (20%)**: Maintains competitive balance

## Customization

### Game Settings
Currently hardcoded but easily configurable in `App.tsx`:
```typescript
const defaultGameSettings: GameSettings = {
  periodsCount: 8,        // Number of regular periods
  periodDuration: 4,      // Minutes per period
  overtimePeriods: 2,     // Additional OT periods available
  playersOnCourt: 5,      // Players per lineup
};
```

### Player Roster
Modify the sample roster in `App.tsx` `createSampleRoster()` function.

## Development

### Project Structure
```
├── App.tsx                 # Main app component and navigation
├── types/
│   └── index.ts           # TypeScript type definitions
├── utils/
│   ├── lineupGenerator.ts # Core lineup balancing algorithm
│   └── gameManager.ts     # Game state management
├── screens/
│   ├── RosterScreen.tsx   # Player attendance management
│   ├── GameScreen.tsx     # Active game management
│   └── StatsScreen.tsx    # Statistics and reports
```

### Future Enhancements
- Persistent data storage (AsyncStorage/SQLite)
- Player profile management
- Historical game data
- Export game reports
- Coach preferences and settings
- Team roster import/export
- Real-time game timer

## Contributing

This app addresses a specific need in house league basketball where existing apps are too complex. The focus is on simplicity and the core workflow coaches actually need.

## License

MIT License - feel free to modify for your league's specific needs!