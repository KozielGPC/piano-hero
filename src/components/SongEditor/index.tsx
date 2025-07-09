import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  Stack,
  IconButton,
  Slider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper
} from '@mui/material';
import {
  Upload,
  PlayArrow,
  Pause,
  Stop,
  Add,
  Delete,
  Edit,
  GetApp,
  ArrowBack,
  SkipNext,
  SkipPrevious
} from '@mui/icons-material';
import WaveSurfer from 'wavesurfer.js';
import { notes, NoteType } from '../../utils/constants';
import { INotes } from '../../utils/interfaces';
// Removed separate Piano component – the piano is now drawn directly inside the canvas

const CANVAS_HEIGHT = 400;
const PIANO_HEIGHT = 80;
const LOOKAHEAD_TIME = 4; // seconds

// ----------------------------------------------------------------------------
// Canvas-based piano helpers
// ----------------------------------------------------------------------------

// Horizontal size unit (1 semitone) in pixels. White keys span 2 units, black 1.2.
const OFFSET_UNIT = 20;
const WHITE_KEY_WIDTH = OFFSET_UNIT * 2;
const BLACK_KEY_WIDTH = OFFSET_UNIT * 1.2;

// Cache audio elements for replay efficiency
const audioCache: Map<string, HTMLAudioElement> = new Map();

// Map of active highlighted keys → expiry timestamp
const activeKeys: Map<string, number> = new Map();
// Duration of highlight in ms
const KEY_HIGHLIGHT_MS = 150;

const playNoteAudio = (noteKey: string) => {
  const noteData = notes[noteKey as keyof typeof notes];
  if (!noteData) return;

  let audio = audioCache.get(noteKey);
  if (!audio) {
    audio = new Audio(`/sounds/${noteData.fileName}`);
    audioCache.set(noteKey, audio);
  }
  // restart from beginning for rapid re-trigger
  audio.currentTime = 0;
  audio.play().catch(() => {/* ignore */});

  // mark key as active for animation
  activeKeys.set(noteKey, performance.now() + KEY_HIGHLIGHT_MS);
};

// Precompute white key offsets for fast lookup
const WHITE_OFFSETS = Object.values(notes)
  .filter((n) => n.type === NoteType.white)
  .map((n) => n.offset);

// Helper to get the X center (in px) for any key based on its offset
const getKeyCenterX = (offset: number, canvasCenterX: number): number => {
  // For white keys, offset already correct
  if (Number.isInteger(offset)) {
    return canvasCenterX + offset * OFFSET_UNIT;
  }

  // For black keys, place it midway between neighboring whites
  const leftWhite = Math.max(...WHITE_OFFSETS.filter((o) => o < offset));
  const rightWhite = Math.min(...WHITE_OFFSETS.filter((o) => o > offset));
  const avg = (leftWhite + rightWhite) / 2;
  return canvasCenterX + avg * OFFSET_UNIT;
};

const drawPianoKeys = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number
) => {
  // Draw white keys first so black keys can overlay them
  const drawnWhiteOffsets = new Set<number>();
  Object.entries(notes).forEach(([key, value]) => {
    const noteData = value as (typeof notes)[keyof typeof notes];
    if (noteData.type === NoteType.white && !drawnWhiteOffsets.has(noteData.offset)) {
      const wx = getKeyCenterX(noteData.offset, canvasWidth / 2);
      // If key is currently active, use highlight colour
      const isActive = activeKeys.has(key) && activeKeys.get(key)! > performance.now();
      ctx.fillStyle = isActive ? '#ffeb3b' : '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.fillRect(
        wx - WHITE_KEY_WIDTH / 2,
        CANVAS_HEIGHT - PIANO_HEIGHT,
        WHITE_KEY_WIDTH,
        PIANO_HEIGHT
      );
      ctx.strokeRect(
        wx - WHITE_KEY_WIDTH / 2,
        CANVAS_HEIGHT - PIANO_HEIGHT,
        WHITE_KEY_WIDTH,
        PIANO_HEIGHT
      );

      // Draw label (musical note or keyboard char)
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(key, wx, CANVAS_HEIGHT - 8);

      drawnWhiteOffsets.add(noteData.offset);
    }
  });

  // Draw black keys on top of the white keys
  const BLACK_KEY_HEIGHT = PIANO_HEIGHT * 0.6;
  Object.entries(notes).forEach(([key, value]) => {
    const noteData = value as (typeof notes)[keyof typeof notes];
    if (noteData.type === NoteType.black) {
      const bx = getKeyCenterX(noteData.offset, canvasWidth / 2);
      // If key is currently active, use highlight colour
      const isActive = activeKeys.has(key) && activeKeys.get(key)! > performance.now();
      ctx.fillStyle = isActive ? '#ffeb3b' : '#000';
      ctx.fillRect(
        bx - BLACK_KEY_WIDTH / 2,
        CANVAS_HEIGHT - PIANO_HEIGHT,
        BLACK_KEY_WIDTH,
        BLACK_KEY_HEIGHT
      );

      // Label for black keys (draw in white for visibility)
      ctx.fillStyle = '#fff';
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(key, bx, CANVAS_HEIGHT - PIANO_HEIGHT + 12);
    }
  });
};

interface EditorNote {
  id: string;
  time: number;
  duration: number;
  keys: string[];
  note: string;
  offset: number;
  type: NoteType;
}

interface SongData {
  name: string;
  artist: string;
  audioFile: File | null;
  duration: number;
  notes: EditorNote[];
}

interface SongEditorProps {
  onBack: () => void;
  onPlaySong: (songData: INotes[]) => void;
}

const SongEditor: React.FC<SongEditorProps> = ({ onBack, onPlaySong }) => {
  // No hook needed for activeKeys (module-level map)
  const [songData, setSongData] = useState<SongData>({
    name: '',
    artist: '',
    audioFile: null,
    duration: 0,
    notes: []
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editingNote, setEditingNote] = useState<EditorNote | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [noteDuration, setNoteDuration] = useState(1);

  const waveformRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Available note options for selection
  const noteOptions = Object.entries(notes).map(([key, noteData]) => ({
    key,
    ...noteData,
    label: `${key} (${noteData.note})`
  }));

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4fc3f7',
        progressColor: '#29b6f6',
        cursorColor: '#ff5722',
        barWidth: 2,
        barRadius: 3,
        height: 60,
        normalize: true,
        backend: 'WebAudio',
        interact: true
      });

      // Event handlers for time updates and interactions
      wavesurfer.current.on('audioprocess', (time: number) => {
        setCurrentTime(time);
        lastTimeRef.current = time;
      });

      wavesurfer.current.on('click', (progress: number) => {
        const time = progress * songData.duration;
        setCurrentTime(time);
        lastTimeRef.current = time;
      });

      wavesurfer.current.on('play', () => {
        setIsPlaying(true);
      });

      wavesurfer.current.on('pause', () => {
        setIsPlaying(false);
      });

      wavesurfer.current.on('finish', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      wavesurfer.current.on('ready', () => {
        if (wavesurfer.current) {
          setSongData(prev => ({
            ...prev,
            duration: wavesurfer.current!.getDuration()
          }));
        }
      });

      wavesurfer.current.on('error', (error: Error) => {
        setError(`Audio error: ${error.message}`);
        setIsPlaying(false);
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [songData.duration]);

  // Canvas animation loop
  useEffect(() => {
    const animate = () => {
      drawCanvas();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [songData.notes, currentTime]);

  // Cleanup expired highlights each animation frame
  const pruneHighlights = () => {
    const now = performance.now();
    activeKeys.forEach((expiry, k) => {
      if (expiry < now) activeKeys.delete(k);
    });
  };

  useEffect(() => {
    const interval = setInterval(pruneHighlights, 50);
    return () => clearInterval(interval);
  }, []);

  const seekToTime = (time: number) => {
    if (!wavesurfer.current || songData.duration === 0) return;
    
    // Clamp the time to valid range
    const clampedTime = Math.max(0, Math.min(songData.duration, time));
    
    // Calculate seek position as a percentage (0 to 1)
    const seekPosition = clampedTime / songData.duration;
    
    // Seek to the position
    wavesurfer.current.seekTo(seekPosition);
    
    // Update current time immediately for better UX
    setCurrentTime(clampedTime);
  };

  const handleSliderChange = (_event: Event | React.SyntheticEvent<Element, Event>, newValue: number | number[]) => {
    const time = Array.isArray(newValue) ? newValue[0] : newValue;
    seekToTime(time);
  };

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(songData.duration, currentTime + seconds));
    seekToTime(newTime);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file');
      return;
    }

    setSongData(prev => ({ ...prev, audioFile: file }));
    
    if (wavesurfer.current) {
      const url = URL.createObjectURL(file);
      wavesurfer.current.load(url);
    }
    
    setError('');
    setSuccess('Audio file loaded successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const togglePlayback = () => {
    if (!wavesurfer.current || !songData.audioFile) {
      setError('Please upload an audio file first');
      return;
    }

    if (isPlaying) {
      wavesurfer.current.pause();
    } else {
      wavesurfer.current.play();
    }
  };

  const stopPlayback = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.stop();
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const addNote = (time?: number) => {
    if (selectedNotes.length === 0) {
      setError('Please select at least one note to add');
      return;
    }

    const noteTime = time !== undefined ? time : currentTime;
    const newNote: EditorNote = {
      id: Date.now().toString(),
      time: noteTime,
      duration: noteDuration,
      keys: selectedNotes,
      note: selectedNotes[0], // Use first selected note as primary
      offset: notes[selectedNotes[0] as keyof typeof notes]?.offset || 0,
      type: notes[selectedNotes[0] as keyof typeof notes]?.type || NoteType.white
    };

    setSongData(prev => ({
      ...prev,
      notes: [...prev.notes, newNote].sort((a, b) => a.time - b.time)
    }));

    setSuccess(`Note added at ${noteTime.toFixed(2)}s`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const deleteNote = (noteId: string) => {
    setSongData(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== noteId)
    }));
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Click in falling area → add note (old behaviour)
    if (y < CANVAS_HEIGHT - PIANO_HEIGHT) {
      if (selectedNotes.length === 0) return; // no note selected
      addNote();
      return;
    }

    // Click inside piano area → play that key
    const canvasCenterX = canvas.width / 2;
    // Find nearest key center
    let nearestKey: string | null = null;
    let minDist = Number.MAX_VALUE;
    Object.keys(notes).forEach((keyLabel) => {
      const offset = notes[keyLabel as keyof typeof notes].offset;
      const cx = getKeyCenterX(offset, canvasCenterX);
      const dist = Math.abs(cx - x);
      if (dist < minDist) {
        minDist = dist;
        nearestKey = keyLabel;
      }
    });

    if (nearestKey && minDist <= WHITE_KEY_WIDTH / 2) {
      playNoteAudio(nearestKey);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw falling area background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, CANVAS_HEIGHT - PIANO_HEIGHT);

    // Draw piano area background
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, CANVAS_HEIGHT - PIANO_HEIGHT, canvas.width, PIANO_HEIGHT);

    // Paint the piano keys so they share the same coordinate system as notes
    drawPianoKeys(ctx, canvas.width);

    // Draw notes
    songData.notes.forEach(note => {
      const noteStartTime = note.time;
      const noteEndTime = note.time + note.duration;
      const currentTimeInRange = currentTime >= noteStartTime - LOOKAHEAD_TIME && currentTime <= noteEndTime + 1;

      if (currentTimeInRange) {
        // Calculate note position - notes should fall from top to bottom
        const timeUntilNote = noteStartTime - currentTime;
        const fallProgress = (LOOKAHEAD_TIME - timeUntilNote) / LOOKAHEAD_TIME;
        const y = fallProgress * (CANVAS_HEIGHT - PIANO_HEIGHT - 50) + 10;
        
        // Only draw if note is visible
        if (y >= -50 && y <= CANVAS_HEIGHT) {
          note.keys.forEach((key, index) => {
            const noteData = notes[key as keyof typeof notes];
            if (noteData) {
              // Calculate x position based on note offset
              const x = getKeyCenterX(noteData.offset, canvas.width / 2) + (index * 5);
              
              // Draw note
              ctx.fillStyle = noteData.type === NoteType.black ? '#333' : '#fff';
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 2;
              
              const noteHeight = Math.max(20, note.duration * 30);
              ctx.fillRect(x - 15, y, 30, noteHeight);
              ctx.strokeRect(x - 15, y, 30, noteHeight);
              
              // Draw note label
              ctx.fillStyle = noteData.type === NoteType.black ? '#fff' : '#000';
              ctx.font = '12px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(key, x, y + 15);
            }
          });
        }
      }
    });

    // Draw time indicator
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const indicatorY = CANVAS_HEIGHT - PIANO_HEIGHT - 20;
    ctx.beginPath();
    ctx.moveTo(0, indicatorY);
    ctx.lineTo(canvas.width, indicatorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw current time
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${currentTime.toFixed(2)}s`, 10, 25);
  };

  const exportSong = () => {
    if (!songData.name.trim()) {
      setError('Please enter a song name');
      return;
    }

    if (songData.notes.length === 0) {
      setError('Please add at least one note');
      return;
    }

    // Convert EditorNote format to export format
    // Each EditorNote can have multiple keys, so we need to create separate notes for each key
    const exportNotes: INotes[] = [];
    
    songData.notes.forEach(editorNote => {
      editorNote.keys.forEach(key => {
        const noteData = notes[key as keyof typeof notes];
        if (noteData) {
          exportNotes.push({
            note: key,
            offset: noteData.offset,
            type: noteData.type,
            displayAftertimeSeconds: editorNote.time
          });
        }
      });
    });

    const exportData = {
      name: songData.name,
      artist: songData.artist,
      notes: exportNotes
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songData.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setSuccess('Song exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const playSong = () => {
    if (!songData.name.trim()) {
      setError('Please enter a song name');
      return;
    }

    if (songData.notes.length === 0) {
      setError('Please add at least one note');
      return;
    }

    // Convert EditorNote format to INotes format
    // Each EditorNote can have multiple keys, so we need to create separate notes for each key
    const gameNotes: INotes[] = [];
    
    songData.notes.forEach(editorNote => {
      editorNote.keys.forEach(key => {
        const noteData = notes[key as keyof typeof notes];
        if (noteData) {
          gameNotes.push({
            note: key,
            offset: noteData.offset,
            type: noteData.type,
            displayAftertimeSeconds: editorNote.time
          });
        }
      });
    });

    onPlaySong(gameNotes);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard support – play note sounds when user presses mapped keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pressed = e.key.toLowerCase();
      const entry = Object.entries(notes).find(
        ([, v]) => v.note.toLowerCase() === pressed
      );
      if (entry) {
        playNoteAudio(entry[0]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Song Editor
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Song Information */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Song Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Song Name"
                value={songData.name}
                onChange={(e) => setSongData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Artist"
                value={songData.artist}
                onChange={(e) => setSongData(prev => ({ ...prev, artist: e.target.value }))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audio Upload */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Audio File
          </Typography>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="audio-upload"
          />
          <label htmlFor="audio-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<Upload />}
              sx={{ mb: 2 }}
            >
              Upload Audio File
            </Button>
          </label>
          {songData.audioFile && (
            <Typography variant="body2" color="text.secondary">
              Loaded: {songData.audioFile.name} ({formatTime(songData.duration)})
            </Typography>
          )}
          
          {/* Waveform */}
          <Box ref={waveformRef} sx={{ mt: 2, mb: 2 }} />
          
          {/* Audio Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => skipTime(-10)} disabled={!songData.audioFile}>
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={togglePlayback} disabled={!songData.audioFile}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={stopPlayback} disabled={!songData.audioFile}>
              <Stop />
            </IconButton>
            <IconButton onClick={() => skipTime(10)} disabled={!songData.audioFile}>
              <SkipNext />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 2 }}>
              {formatTime(currentTime)} / {formatTime(songData.duration)}
            </Typography>
          </Stack>

          {/* Time Slider */}
          <Box sx={{ mt: 2 }}>
            <Slider
              value={currentTime}
              min={0}
              max={songData.duration || 100}
              step={0.1}
              onChange={handleSliderChange}
              disabled={!songData.audioFile}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => formatTime(value)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Game-like Visualization with Piano - Combined Card */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Interactive Game Preview - Click to Add Notes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This preview shows how notes will appear in the actual game. Click on the falling notes area or use the Add button to place notes.
          </Typography>
          
          {/* Falling Notes Canvas */}
          <Paper 
            elevation={2} 
            sx={{ 
              mb: 2, 
              position: 'relative',
              border: '1px solid #ddd',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              style={{ 
                width: '100%', 
                height: 'auto',
                cursor: selectedNotes.length > 0 ? 'crosshair' : 'default',
                display: 'block'
              }}
            />
          </Paper>

          {/* Piano is now rendered directly inside the canvas for perfect alignment */}
        </CardContent>
      </Card>

      {/* Note Selection */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Note Selection
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Select notes to add (you can select multiple):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {noteOptions.map((noteOption) => (
                <Chip
                  key={noteOption.key}
                  label={noteOption.label}
                  onClick={() => {
                    setSelectedNotes(prev => 
                      prev.includes(noteOption.key)
                        ? prev.filter(n => n !== noteOption.key)
                        : [...prev, noteOption.key]
                    );
                  }}
                  color={selectedNotes.includes(noteOption.key) ? 'primary' : 'default'}
                  variant={selectedNotes.includes(noteOption.key) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Note Duration (seconds)"
                value={noteDuration}
                onChange={(e) => setNoteDuration(Math.max(0.1, parseFloat(e.target.value) || 1))}
                inputProps={{ min: 0.1, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNote()}
                disabled={selectedNotes.length === 0}
                fullWidth
              >
                Add Note at Current Time
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notes Timeline ({songData.notes.length} notes)
          </Typography>
          {songData.notes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No notes added yet. Upload an audio file and start adding notes!
            </Typography>
          ) : (
            <List>
              {songData.notes.map((note, index) => (
                <React.Fragment key={note.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${note.keys.join(', ')} - ${formatTime(note.time)}`}
                      secondary={`Duration: ${note.duration}s | Keys: ${note.keys.length}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => {
                          setEditingNote(note);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => deleteNote(note.id)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < songData.notes.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Export Controls */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export & Test
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={exportSong}
              disabled={!songData.name.trim() || songData.notes.length === 0}
            >
              Export Song Data
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlayArrow />}
              onClick={playSong}
              disabled={!songData.name.trim() || songData.notes.length === 0}
            >
              Play Song
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          {editingNote && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Time (seconds)"
                type="number"
                value={editingNote.time}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, time: parseFloat(e.target.value) || 0 } : null)}
                inputProps={{ min: 0, step: 0.1 }}
                fullWidth
              />
              <TextField
                label="Duration (seconds)"
                type="number"
                value={editingNote.duration}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, duration: parseFloat(e.target.value) || 0.1 } : null)}
                inputProps={{ min: 0.1, step: 0.1 }}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (editingNote) {
                setSongData(prev => ({
                  ...prev,
                  notes: prev.notes.map(note => 
                    note.id === editingNote.id ? editingNote : note
                  ).sort((a, b) => a.time - b.time)
                }));
                setEditDialogOpen(false);
                setEditingNote(null);
              }
            }}
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SongEditor; 