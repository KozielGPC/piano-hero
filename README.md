# Piano Hero

### About
Piano Hero is a Guitar Hero-inspired rhythm game built for piano. Players must hit falling notes at the correct timing to score points and build combos. The game features a built-in song editor for creating custom songs and supports audio synchronization.

### Play
🎮 **[Play Online](https://kozi-piano-hero.vercel.app/)**

### Screenshots

![image](https://github.com/user-attachments/assets/14344ce7-bf87-4f75-964e-ae2ca1ebd978)

![image](https://github.com/user-attachments/assets/63d24723-2432-4fc6-b8a9-b6648886800c)

![image](https://github.com/user-attachments/assets/43f6b219-0a64-4057-9343-1fc367fdffd6)

![image](https://github.com/user-attachments/assets/976a1096-3721-45f3-96e4-db0b5a692183)

![image](https://github.com/user-attachments/assets/4ac62a54-f576-4199-894a-1f74052864a0)

![image](https://github.com/user-attachments/assets/b0b095a2-040c-412b-bc44-555bd9366635)

![image](https://github.com/user-attachments/assets/a602d345-c2dd-42d3-b860-82091bdd1022)

## 🏗️ Architecture & Technology Stack

### Core Technologies
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR and optimized builds)
- **UI Framework**: Material-UI (MUI) v5 - Complete component library
- **Audio Processing**: WaveSurfer.js v7 - Advanced audio waveform visualization and playback
- **Graphics**: Native HTML5 Canvas - Custom implementation for high-performance rendering

### State Management
The application uses React Context API with three specialized contexts:

- **`GameContext`** (`src/context/GameContext.tsx`) - Manages game state, scoring, and lifecycle
- **`SongEditorContext`** (`src/context/SongEditorContext.tsx`) - Handles song creation and editing
- **`SongFileHandlerContext`** (`src/context/SongFileHandlerContext.tsx`) - Manages file operations

## 🎮 Game Features & Implementation

### 🎹 Piano Rendering & Interaction
**Component**: `src/components/PianoCanvas/index.tsx`

- **Custom Canvas Engine**: Built from scratch using HTML5 Canvas API
- **Visual Piano**: Renders white and black keys with proper proportions
- **Real-time Interaction**: Mouse clicks and keyboard inputs trigger notes
- **Visual Feedback**: Keys light up when pressed with timing-based colors

**Key Functions**:
- `drawCanvas()` - Main rendering loop in `src/components/PianoCanvas/utils.ts`
- `findNearestKeyAndMinDistance()` - Click-to-key mapping
- `playNoteAudio()` - Audio playback with caching

### 🎵 Falling Notes System
**Implementation**: `src/components/PianoCanvas/index.tsx` + `src/components/PianoCanvas/utils.ts`

- **Smooth Animation**: RequestAnimationFrame-based note movement
- **Collision Detection**: Custom algorithm for note-key intersection
- **Visual Design**: Notes fall towards piano keys with proper scaling
- **Multi-note Support**: Handles chords and complex patterns

**Core Constants** (`src/components/PianoCanvas/constants.ts`):
- `CANVAS_HEIGHT_DEFAULT`: 600px canvas height
- `PIANO_HEIGHT`: 150px piano section
- `LOOKAHEAD_TIME`: 3 seconds of visible notes
- `WHITE_KEY_WIDTH`: Key sizing calculations

### 🎯 Rhythm Engine & Scoring
**Component**: `src/engine/RhythmEngine.ts`

Advanced timing-based scoring system with multiple judgment levels:

- **Perfect**: ±0.2s (highest points)
- **Great**: ±0.3s 
- **Good**: ±0.4s
- **Hit**: Within timing windows
- **Miss**: Outside timing windows

**Features**:
- **Combo System**: Tracks consecutive hits with multipliers
- **Progress Tracking**: Real-time completion percentage
- **Timing Windows**: Configurable early/late tolerances
- **Key Indexing**: Optimized note lookup per piano key

### 🎼 Song Editor
**Component**: `src/components/SongEditor/index.tsx`

Full-featured song creation tool with multiple sub-components:

- **`SongInformation`** - Set song metadata (name, artist, duration)
- **`AudioUpload`** - Import background audio files  
- **`InteractiveGamePreview`** - Real-time preview with playback
- **`NoteSelection`** - Choose which notes to place
- **`NotesList`** - View and edit all song notes
- **`ExportControls`** - Export songs as JSON
- **`EditNoteDialog`** - Fine-tune note timing and duration

**Editing Features**:
- **Drag & Drop**: Move notes by dragging on canvas
- **Duration Control**: Resize notes by dragging bottom edge
- **Click Placement**: Click piano keys to add notes
- **Audio Sync**: Synchronize with background music

### 🎵 Audio System
**Components**: Multiple files handling different aspects

**Audio Sources**:
- **Individual Notes**: `public/sounds/` - All piano notes (C1-C8, including sharps/flats)
- **Background Music**: User-uploaded files via `src/components/SongEditor/components/AudioUpload/`
- **Audio Caching**: Optimized loading in `src/components/PianoCanvas/index.tsx`

**WaveSurfer Integration**:
- Visual waveform display in song editor
- Precise audio synchronization
- Real-time playback control

### 🎮 Game Controller & States
**Component**: `src/components/GameController/index.tsx`

Manages game flow through five distinct states:

1. **MENU** (`src/components/GameController/components/Stages/Menu/`) - Song selection
2. **LOADING** (`src/components/GameController/components/Stages/Loading/`) - Asset loading
3. **PLAYING** (`src/components/GameController/components/Stages/Play/`) - Active gameplay
4. **PAUSED** (`src/components/GameController/components/Stages/Pause/`) - Game paused
5. **ENDED** (`src/components/GameController/components/Stages/EndGame/`) - Results screen
6. **SONG_EDITOR** - Song creation mode

### 📊 Progress & Performance Tracking
**Implementation**: Throughout `src/context/GameContext.tsx`

- **Real-time Accuracy**: Calculated as (correct notes / total notes) × 100
- **Combo Counter**: Tracks consecutive hits, resets on miss
- **Score System**: Points awarded based on timing accuracy
- **Progress Bar**: Visual completion indicator

## 📁 Project Structure

```
src/
├── components/
│   ├── GameArea/           # Main game container
│   ├── GameController/     # Game state management & stages  
│   ├── Header/            # Application header
│   ├── PianoCanvas/       # Core piano rendering & interaction
│   └── SongEditor/        # Song creation tools
├── context/               # React Context providers
│   ├── GameContext.tsx    # Game state & scoring
│   ├── SongEditorContext.tsx # Song editing state
│   └── SongFileHandlerContext.tsx # File operations
├── engine/
│   ├── RhythmEngine.ts    # Core game logic & timing
│   ├── types.ts           # Game engine types
│   └── constants.ts       # Timing configurations
├── utils/
│   ├── constants.ts       # Piano notes & mappings
│   ├── interfaces.ts      # Type definitions
│   ├── songLibrary.ts     # Song management
│   └── time.ts            # Time utilities
└── songs/                 # Predefined songs
```

## 🚀 Getting Started

### Prerequisites
- Node.js ≥20
- Yarn package manager

### Installation & Running

```shell
# Clone repository
git clone https://github.com/KozielGPC/piano-hero.git

# Enter directory
cd piano-hero

# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

### Available Scripts
- `yarn dev` - Start development server with HMR
- `yarn build` - TypeScript compilation + production build
- `yarn lint` - ESLint code quality check
- `yarn preview` - Preview production build locally

## 🎵 Available Songs
- **Interstellar Main Theme** - Hans Zimmer (simplified)
- **Custom Songs** - Import JSON files or create in the song editor

## 🎹 Game Controls

### Keyboard Controls
Each piano key maps to a computer keyboard key:
- **White Keys**: Letters (A, S, D, F, G, H, J, etc.)
- **Black Keys**: Numbers and symbols
- **Full mapping**: Defined in `src/utils/constants.ts`

### Mouse Controls
- **Click Piano Keys**: Play individual notes
- **Click Notes**: Select/edit notes in song editor
- **Drag Notes**: Move timing or adjust duration
- **Canvas Interaction**: Add notes in editor mode

## 🔧 Technical Implementation Details

### Performance Optimizations
- **Canvas Rendering**: Optimized redraw cycles, only updates changed regions
- **Audio Caching**: Preloads and caches all piano note sounds
- **RequestAnimationFrame**: Smooth 60fps animation loops
- **Component Memoization**: Prevents unnecessary re-renders

### Timing System
- **High Precision**: Uses `performance.now()` for millisecond accuracy
- **Audio Sync**: Synchronizes visual elements with audio playback
- **Configurable Windows**: Adjustable timing tolerances per difficulty

### Song Data Format
Songs are stored as JSON with this structure:
```json
{
  "name": "Song Name",
  "artist": "Artist Name", 
  "duration": 180,
  "notes": [
    {
      "note": "C4",
      "time": 1.5,
      "duration": 0.5,
      "type": "white"
    }
  ]
}
```

## 🎯 Current Features Status
- [x] ✅ Interactive piano with full keyboard
- [x] ✅ Falling notes with smooth animation  
- [x] ✅ Advanced scoring system (Perfect/Great/Good/Hit/Miss)
- [x] ✅ Combo system with visual feedback
- [x] ✅ Song editor with audio synchronization
- [x] ✅ JSON song import/export
- [x] ✅ Audio file upload support
- [x] ✅ Real-time game preview
- [x] ✅ Drag-and-drop note editing
- [x] ✅ Multiple game states (Menu/Play/Pause/End)
- [x] ✅ Progress tracking and accuracy calculation

## 🚧 Future Enhancements
- [ ] 🎯 Difficulty levels (Easy/Medium/Hard)
- [ ] 🏆 Leaderboards and score persistence
- [ ] 🎼 Auto-generation from MP3 files
- [ ] 🌐 Multiplayer gameplay
- [ ] 📱 Mobile device support
- [ ] 🎨 Visual themes and customization
- [ ] 🔊 Sound effects and haptic feedback

## 🤝 Contributing
Contributions are welcome! Feel free to:
- 🐛 Report bugs via GitHub Issues
- 💡 Suggest features and improvements  
- 🔧 Submit Pull Requests
- 📖 Improve documentation
- 🎵 Create and share songs

## 📄 License
This project is open source. Feel free to use, modify, and distribute according to the repository license.

