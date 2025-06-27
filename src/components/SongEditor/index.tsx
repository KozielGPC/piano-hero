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
import { notes } from '../../utils/constants';
import { INotes } from '../../utils/interfaces';
import { Piano } from '../Piano';

interface SongEditorProps {
  onBackToMenu: () => void;
  onPlaySong?: (songData: INotes[]) => void;
}

interface EditorNote extends INotes {
  id: string;
  startTime: number; // in seconds
  duration: number; // in seconds
}

interface SongData {
  name: string;
  artist: string;
  audioFile: File | null;
  notes: EditorNote[];
  duration: number;
}

// Game-like note visualization component
interface FallingNote {
  id: string;
  note: string;
  offset: number;
  type: 'white' | 'black';
  startTime: number;
  duration: number;
  y: number; // Current Y position
}

const CANVAS_HEIGHT = 400;
const PIANO_HEIGHT = 80;
const LOOKAHEAD_TIME = 4; // seconds to show notes before they hit the piano

const SongEditor: React.FC<SongEditorProps> = ({ onBackToMenu, onPlaySong }) => {
  const [songData, setSongData] = useState<SongData>({
    name: '',
    artist: '',
    audioFile: null,
    notes: [],
    duration: 0
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedNoteTypes, setSelectedNoteTypes] = useState<string[]>([]);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<EditorNote | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const timeUpdateIntervalRef = useRef<number>();

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
        mediaControls: false
      });

      wavesurfer.current.on('ready', () => {
        setSongData(prev => ({
          ...prev,
          duration: wavesurfer.current?.getDuration() || 0
        }));
      });

      // Fix timer updates - use multiple event handlers for better coverage
      wavesurfer.current.on('audioprocess', () => {
        if (wavesurfer.current && wavesurfer.current.isPlaying()) {
          const newTime = wavesurfer.current.getCurrentTime() || 0;
          setCurrentTime(newTime);
        }
      });

      wavesurfer.current.on('click', () => {
        const newTime = wavesurfer.current?.getCurrentTime() || 0;
        setCurrentTime(newTime);
      });

      wavesurfer.current.on('play', () => {
        setIsPlaying(true);
        // Start a timer to ensure consistent updates
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
        timeUpdateIntervalRef.current = window.setInterval(() => {
          if (wavesurfer.current && wavesurfer.current.isPlaying()) {
            const newTime = wavesurfer.current.getCurrentTime() || 0;
            setCurrentTime(newTime);
          }
        }, 100); // Update every 100ms
      });

      wavesurfer.current.on('pause', () => {
        setIsPlaying(false);
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
      });

      wavesurfer.current.on('finish', () => {
        setIsPlaying(false);
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
      });
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Animation loop for falling notes
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      lastTimeRef.current = timestamp;

      updateFallingNotes();
      drawCanvas();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTime, songData.notes, isPlaying]);

  const updateFallingNotes = () => {
    const visibleNotes: FallingNote[] = [];
    
    songData.notes.forEach(note => {
      const noteStartTime = note.startTime;
      const timeUntilNote = noteStartTime - currentTime;
      
      // Show notes that will appear within the lookahead time
      if (timeUntilNote <= LOOKAHEAD_TIME && timeUntilNote >= -note.duration) {
        const progress = (LOOKAHEAD_TIME - timeUntilNote) / LOOKAHEAD_TIME;
        const y = progress * (CANVAS_HEIGHT - PIANO_HEIGHT);
        
        visibleNotes.push({
          id: note.id,
          note: note.note,
          offset: note.offset,
          type: note.type,
          startTime: note.startTime,
          duration: note.duration,
          y: y
        });
      }
    });
    
    setFallingNotes(visibleNotes);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw piano area indicator
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height - PIANO_HEIGHT, canvas.width, PIANO_HEIGHT);

    // Calculate scale factor to fit notes within canvas width
    const canvasWidth = canvas.width;
    const noteRange = 30; // Approximate range of note offsets
    const scaleX = canvasWidth / noteRange;
    const offsetX = canvasWidth / 2; // Center the notes

    // Draw falling notes
    fallingNotes.forEach(note => {
      const noteWidth = 40;
      const x = offsetX + (note.offset * scaleX * 0.8); // Scale and center the x position
      const y = note.y;
      const height = Math.max(20, note.duration * 30); // Visual height based on duration

      // Only draw if note is within canvas bounds
      if (x >= -noteWidth/2 && x <= canvasWidth + noteWidth/2) {
        // Note color based on type
        if (note.type === 'white') {
          ctx.fillStyle = '#4fc3f7';
          ctx.strokeStyle = '#29b6f6';
        } else {
          ctx.fillStyle = '#666';
          ctx.strokeStyle = '#444';
        }

        // Draw note rectangle
        ctx.fillRect(x - noteWidth/2, y, noteWidth, height);
        ctx.strokeRect(x - noteWidth/2, y, noteWidth, height);

        // Draw note label
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(note.note, x, y + height/2 + 4);
      }
    });

    // Draw timeline
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - PIANO_HEIGHT);
    ctx.lineTo(canvas.width, canvas.height - PIANO_HEIGHT);
    ctx.stroke();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file (MP3, WAV, etc.)');
      return;
    }

    setSongData(prev => ({ ...prev, audioFile: file }));
    
    if (wavesurfer.current) {
      const url = URL.createObjectURL(file);
      wavesurfer.current.load(url);
    }
    
    setError('');
    setSuccess('Audio file loaded successfully!');
  };

  const togglePlayback = () => {
    if (!wavesurfer.current) return;
    
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
  };

  const seekToTime = (time: number) => {
    if (!wavesurfer.current || songData.duration === 0) return;
    const seekPosition = time / songData.duration;
    wavesurfer.current.seekTo(seekPosition);
    setCurrentTime(time);
  };

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(songData.duration, currentTime + seconds));
    seekToTime(newTime);
  };

  const addNoteAtCurrentTime = () => {
    if (selectedNoteTypes.length === 0) {
      setError('Please select at least one note type');
      return;
    }

    const newNotes: EditorNote[] = selectedNoteTypes.map(noteKey => {
      const noteData = notes[noteKey as keyof typeof notes];
      return {
        id: `${Date.now()}-${noteKey}`,
        startTime: currentTime,
        duration: 1, // Default 1 second duration
        displayAftertimeSeconds: currentTime,
        ...noteData
      };
    });

    setSongData(prev => ({
      ...prev,
      notes: [...prev.notes, ...newNotes].sort((a, b) => a.startTime - b.startTime)
    }));

    setSelectedNoteTypes([]);
    setError('');
    setSuccess(`Added ${newNotes.length} note(s) at ${currentTime.toFixed(2)}s`);
  };

  // Handle canvas clicks to add notes
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedNoteTypes.length === 0) {
      setError('Please select note types first, then click on the falling notes area or use the Add button');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    // Calculate scaled positions to match the drawing logic
    const canvasWidth = canvas.width;
    const noteRange = 30;
    const scaleX = canvasWidth / noteRange;
    const offsetX = canvasWidth / 2;
    
    // Find the closest note position based on x coordinate
    let closestNoteKey = '';
    let minDistance = Infinity;
    
    Object.entries(notes).forEach(([key, noteData]) => {
      const noteX = offsetX + (noteData.offset * scaleX * 0.8);
      const distance = Math.abs(noteX - x);
      if (distance < minDistance) {
        minDistance = distance;
        closestNoteKey = key;
      }
    });

    if (closestNoteKey && selectedNoteTypes.includes(closestNoteKey)) {
      // Add the clicked note
      const noteData = notes[closestNoteKey as keyof typeof notes];
      const newNote: EditorNote = {
        id: `${Date.now()}-${closestNoteKey}`,
        startTime: currentTime,
        duration: 1,
        displayAftertimeSeconds: currentTime,
        ...noteData
      };

      setSongData(prev => ({
        ...prev,
        notes: [...prev.notes, newNote].sort((a, b) => a.startTime - b.startTime)
      }));

      setSuccess(`Added ${noteData.note} at ${currentTime.toFixed(2)}s`);
    }
  };

  const removeNote = (noteId: string) => {
    setSongData(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== noteId)
    }));
  };

  const editNote = (note: EditorNote) => {
    setEditingNote(note);
    setShowAddNoteDialog(true);
  };

  const saveEditedNote = (updatedNote: EditorNote) => {
    setSongData(prev => ({
      ...prev,
      notes: prev.notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ).sort((a, b) => a.startTime - b.startTime)
    }));
    setEditingNote(null);
    setShowAddNoteDialog(false);
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

    // Convert EditorNote[] to INotes[] format expected by the game
    const gameNotes: INotes[] = songData.notes.map(note => ({
      note: note.note,
      offset: note.offset,
      type: note.type,
      displayAftertimeSeconds: note.startTime
    }));

    const exportData = {
      name: songData.name,
      artist: songData.artist,
      notes: gameNotes,
      duration: songData.duration,
      createdAt: new Date().toISOString()
    };

    // Download as JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccess('Song exported successfully!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    // Convert EditorNote[] to INotes[] format expected by the game
    const gameNotes: INotes[] = songData.notes.map(note => ({
      note: note.note,
      offset: note.offset,
      type: note.type,
      displayAftertimeSeconds: note.startTime
    }));

    if (onPlaySong) {
      onPlaySong(gameNotes);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        mb: 3
      }}>
        🎵 Interactive Song Editor
      </Typography>

      <Grid container spacing={3}>
        {/* Left Panel - Controls */}
        <Grid item xs={12} md={4}>
          {/* Song Info */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Song Information</Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Song Name"
                  value={songData.name}
                  onChange={(e) => setSongData(prev => ({ ...prev, name: e.target.value }))}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Artist"
                  value={songData.artist}
                  onChange={(e) => setSongData(prev => ({ ...prev, artist: e.target.value }))}
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Audio Upload */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Audio File</Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Audio
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                {songData.audioFile && (
                  <Chip
                    label={songData.audioFile.name}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Note Selection */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Select Notes to Add</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select notes, then click on the falling notes area or use the Add button
              </Typography>
              <Grid container spacing={1}>
                {noteOptions.map((noteOption) => (
                  <Grid item key={noteOption.key}>
                    <Chip
                      label={noteOption.label}
                      onClick={() => {
                        setSelectedNoteTypes(prev => 
                          prev.includes(noteOption.key)
                            ? prev.filter(key => key !== noteOption.key)
                            : [...prev, noteOption.key]
                        );
                      }}
                      color={selectedNoteTypes.includes(noteOption.key) ? 'primary' : 'default'}
                      variant={selectedNoteTypes.includes(noteOption.key) ? 'filled' : 'outlined'}
                      sx={{ 
                        backgroundColor: selectedNoteTypes.includes(noteOption.key) 
                          ? noteOption.type === 'white' ? '#2196F3' : '#424242'
                          : undefined
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={addNoteAtCurrentTime}
                disabled={selectedNoteTypes.length === 0 || !songData.audioFile}
                sx={{ mt: 2 }}
                fullWidth
              >
                Add Note(s) at {formatTime(currentTime)}
              </Button>
            </CardContent>
          </Card>

          {/* Export */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Export & Play</Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<GetApp />}
                  onClick={exportSong}
                  disabled={!songData.name.trim() || songData.notes.length === 0}
                  color="success"
                  fullWidth
                >
                  Export Song Data
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={playSong}
                  disabled={!songData.name.trim() || songData.notes.length === 0}
                  color="primary"
                  fullWidth
                >
                  Test in Game
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Game View */}
        <Grid item xs={12} md={8}>
          {/* Waveform and Controls */}
          {songData.audioFile && (
            <Card elevation={3} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Audio Controls</Typography>
                
                {/* Waveform */}
                <Box ref={waveformRef} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 1 }} />
                
                {/* Controls */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <IconButton
                    onClick={() => skipTime(-5)}
                    color="primary"
                  >
                    <SkipPrevious />
                  </IconButton>
                  <IconButton
                    onClick={togglePlayback}
                    color="primary"
                    size="large"
                  >
                    {isPlaying ? <Pause /> : <PlayArrow />}
                  </IconButton>
                  <IconButton onClick={stopPlayback}>
                    <Stop />
                  </IconButton>
                  <IconButton
                    onClick={() => skipTime(5)}
                    color="primary"
                  >
                    <SkipNext />
                  </IconButton>
                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                    {formatTime(currentTime)} / {formatTime(songData.duration)}
                  </Typography>
                  <Slider
                    value={currentTime}
                    max={songData.duration}
                    onChange={(_, value) => seekToTime(value as number)}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Game-like Visualization */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Note Visualization - Click to Add Notes
              </Typography>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  backgroundColor: '#f5f5f5',
                  border: '2px solid #ddd',
                  borderRadius: 2
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
                    cursor: selectedNoteTypes.length > 0 ? 'crosshair' : 'default',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </Paper>
              
              {/* Piano Component with better overflow protection and responsive scaling */}
              <Box sx={{ 
                mt: 2,
                width: '100%',
                overflow: 'hidden', // Prevent overflow
                border: '1px solid #ddd',
                borderRadius: 1,
                backgroundColor: '#f8f8f8',
                p: 1
              }}>
                <Box sx={{
                  width: 'fit-content',
                  maxWidth: '100%',
                  transform: {
                    xs: 'scale(0.6)', // Extra small screens
                    sm: 'scale(0.7)', // Small screens  
                    md: 'scale(0.8)', // Medium screens
                    lg: 'scale(0.9)', // Large screens
                    xl: 'scale(1.0)'  // Extra large screens
                  },
                  transformOrigin: 'center top',
                  mx: 'auto',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Piano />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Notes Timeline */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notes Timeline ({songData.notes.length} notes)
              </Typography>
              
              {songData.notes.length === 0 ? (
                <Alert severity="info">No notes added yet. Upload an audio file and start adding notes!</Alert>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {songData.notes.map((note, index) => (
                    <React.Fragment key={note.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${note.note} (${note.type} key)`}
                          secondary={`Time: ${formatTime(note.startTime)} | Duration: ${note.duration}s`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => editNote(note)}
                            sx={{ mr: 1 }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => removeNote(note.id)}
                            color="error"
                          >
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
        </Grid>
      </Grid>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={showAddNoteDialog} onClose={() => {
        setShowAddNoteDialog(false);
        setEditingNote(null);
      }}>
        <DialogTitle>
          {editingNote ? 'Edit Note' : 'Add Note'}
        </DialogTitle>
        <DialogContent>
          {editingNote && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Start Time (seconds)"
                type="number"
                value={editingNote.startTime}
                onChange={(e) => setEditingNote(prev => prev ? {
                  ...prev,
                  startTime: parseFloat(e.target.value) || 0
                } : null)}
                inputProps={{ step: 0.1, min: 0, max: songData.duration }}
              />
              <TextField
                label="Duration (seconds)"
                type="number"
                value={editingNote.duration}
                onChange={(e) => setEditingNote(prev => prev ? {
                  ...prev,
                  duration: parseFloat(e.target.value) || 1
                } : null)}
                inputProps={{ step: 0.1, min: 0.1 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddNoteDialog(false);
            setEditingNote(null);
          }}>
            Cancel
          </Button>
          {editingNote && (
            <Button 
              onClick={() => saveEditedNote(editingNote)}
              variant="contained"
            >
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Back Button */}
      <Button
        variant="contained"
        startIcon={<ArrowBack />}
        onClick={onBackToMenu}
        sx={{ mt: 3 }}
      >
        Back to Menu
      </Button>
    </Box>
  );
};

export default SongEditor; 