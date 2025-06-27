import React, { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Fade,
	Slide,
	IconButton,
	LinearProgress,
	Alert,
	Chip,
	Stack,
	Divider
} from '@mui/material';
import {
	PlayArrow,
	Pause,
	Stop,
	Upload,
	MusicNote,
	EmojiEvents,
	Speed,
	CheckCircle,
	Cancel,
	Edit
} from '@mui/icons-material';
import { useNoteContext } from '../../context/NotesContext';
import { processMidiFile } from '../../utils/midiProcessor';
import { Song, getAllSongs, getSongById, createSongFromMidi } from '../../utils/songLibrary';
import { INotes } from '../../utils/interfaces';
import { Piano } from '../Piano';
import { NoteContainer } from '../NoteContainer';
import SongEditor from '../SongEditor';

type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'ENDED' | 'LOADING' | 'SONG_EDITOR';

interface GameStats {
	accuracy: number;
	totalNotes: number;
	correctNotes: number;
	wrongNotes: number;
	score: number;
}

const GameController: React.FC = () => {
	const [gameState, setGameState] = useState<GameState>('MENU');
	const [selectedSongId, setSelectedSongId] = useState<string>('interstellar');
	const [uploadedSongs, setUploadedSongs] = useState<Song[]>([]);
	const [loadingMessage, setLoadingMessage] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [gameStats, setGameStats] = useState<GameStats>({
		accuracy: 0,
		totalNotes: 0,
		correctNotes: 0,
		wrongNotes: 0,
		score: 0
	});

	const { 
		score, 
		setCurrentSong
	} = useNoteContext();

	// Get all available songs
	const allSongs = getAllSongs(uploadedSongs);

	// Update game stats when score changes
	useEffect(() => {
		const correctNotes = score.correctNotes;
		const wrongNotes = score.wrongNotes;
		const totalNotes = correctNotes + wrongNotes;
		const accuracy = totalNotes > 0 ? (correctNotes / totalNotes) * 100 : 0;
		
		setGameStats({
			accuracy,
			totalNotes,
			correctNotes,
			wrongNotes,
			score: correctNotes * 10 // Simple scoring system
		});
	}, [score]);

	const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
			setError('Please upload a valid MIDI file (.mid or .midi)');
			return;
		}

		setError('');
		setGameState('LOADING');
		setLoadingMessage('Processing MIDI file...');

		try {
			const notes = await processMidiFile(file);
			const newSong = createSongFromMidi(file.name, notes);
			
			setUploadedSongs(prev => [...prev, newSong]);
			setSelectedSongId(newSong.id);
			setLoadingMessage('MIDI file processed successfully!');
			
			setTimeout(() => {
				setGameState('MENU');
				setLoadingMessage('');
			}, 1500);
			
		} catch (err) {
			console.error('Error processing MIDI file:', err);
			setError('Failed to process MIDI file. Please try a different file.');
			setGameState('MENU');
			setLoadingMessage('');
		}

		// Reset file input
		event.target.value = '';
	}, []);

	const startGame = useCallback(() => {
		if (!selectedSongId) {
			setError('Please select a song first');
			return;
		}

		const selectedSong = getSongById(selectedSongId, uploadedSongs);
		if (!selectedSong) {
			setError('Selected song not found');
			return;
		}

		setError('');
		setCurrentSong(selectedSong.notes);
		setGameState('PLAYING');
	}, [selectedSongId, uploadedSongs, setCurrentSong]);

	const pauseGame = useCallback(() => {
		setGameState('PAUSED');
	}, []);

	const resumeGame = useCallback(() => {
		setGameState('PLAYING');
	}, []);

	const stopGame = useCallback(() => {
		setGameState('ENDED');
	}, []);

	const returnToMenu = useCallback(() => {
		setGameState('MENU');
		setCurrentSong(null);
		setError('');
	}, [setCurrentSong]);

	const openSongEditor = useCallback(() => {
		setGameState('SONG_EDITOR');
	}, []);

	const playEditorSong = useCallback((songNotes: INotes[]) => {
		setCurrentSong(songNotes);
		setGameState('PLAYING');
	}, [setCurrentSong]);

	const renderMenuState = () => (
		<Fade in={gameState === 'MENU'} timeout={500}>
			<Card 
				elevation={8}
				sx={{
					background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
					backdropFilter: 'blur(10px)',
					border: '1px solid rgba(255,255,255,0.1)',
					borderRadius: 3,
					maxWidth: 500,
					width: '100%'
				}}
			>
				<CardContent sx={{ p: 4 }}>
					<Stack spacing={3}>
						<Box textAlign="center">
							<MusicNote sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
							<Typography 
								variant="h4" 
								gutterBottom
								sx={{
									background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
									backgroundClip: 'text',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									fontWeight: 'bold'
								}}
							>
								Piano Hero
							</Typography>
							<Typography variant="body1" color="text.secondary">
								Choose your song and start playing!
							</Typography>
						</Box>

						<Divider />

						{/* Song Selection */}
						<FormControl fullWidth>
							<InputLabel>Select Song</InputLabel>
							<Select
								value={selectedSongId}
								label="Select Song"
								onChange={(e) => setSelectedSongId(e.target.value)}
							>
								{allSongs.map((song) => (
									<MenuItem key={song.id} value={song.id}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
											<Box sx={{ flexGrow: 1 }}>
												<Typography variant="body1">{song.name}</Typography>
												{song.artist && (
													<Typography variant="caption" color="text.secondary">
														by {song.artist}
													</Typography>
												)}
											</Box>
											{song.difficulty && (
												<Chip 
													label={song.difficulty} 
													size="small" 
													color={
														song.difficulty === 'Easy' ? 'success' : 
														song.difficulty === 'Medium' ? 'warning' : 'error'
													}
												/>
											)}
										</Box>
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* File Upload */}
						<Box>
							<input
								accept=".mid,.midi"
								style={{ display: 'none' }}
								id="midi-upload"
								type="file"
								onChange={handleFileUpload}
							/>
							<label htmlFor="midi-upload">
								<Button
									variant="outlined"
									component="span"
									startIcon={<Upload />}
									fullWidth
									sx={{
										borderColor: 'rgba(255,255,255,0.3)',
										color: 'text.primary',
										'&:hover': {
											borderColor: '#667eea',
											backgroundColor: 'rgba(102, 126, 234, 0.1)'
										}
									}}
								>
									Upload MIDI File
								</Button>
							</label>
							<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
								Supported formats: .mid, .midi
							</Typography>
						</Box>

						{error && (
							<Alert severity="error" sx={{ mt: 2 }}>
								{error}
							</Alert>
						)}

						{/* Action Buttons */}
						<Stack spacing={2}>
							<Button
								variant="contained"
								size="large"
								startIcon={<PlayArrow />}
								onClick={startGame}
								disabled={!selectedSongId}
								sx={{
									background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
									boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
									'&:hover': {
										background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
									}
								}}
							>
								Start Game
							</Button>
							
							<Button
								variant="outlined"
								size="large"
								startIcon={<Edit />}
								onClick={openSongEditor}
								sx={{
									borderColor: 'rgba(255,255,255,0.3)',
									color: 'text.primary',
									'&:hover': {
										borderColor: '#667eea',
										backgroundColor: 'rgba(102, 126, 234, 0.1)'
									}
								}}
							>
								Song Editor
							</Button>
						</Stack>
					</Stack>
				</CardContent>
			</Card>
		</Fade>
	);

	const renderPlayingState = () => (
		<Box sx={{ width: '100%', maxWidth: '1200px' }}>
			{/* Game Header with Controls */}
			<Slide direction="down" in={gameState === 'PLAYING'} timeout={500}>
				<Card 
					elevation={4}
					sx={{
						background: 'rgba(0,0,0,0.8)',
						backdropFilter: 'blur(10px)',
						border: '1px solid rgba(255,255,255,0.1)',
						borderRadius: 2,
						mb: 2
					}}
				>
					<CardContent>
						<Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
							<Box>
								<Typography variant="h6" color="white">
									{getSongById(selectedSongId, uploadedSongs)?.name || 'Playing...'}
								</Typography>
								<Typography variant="body2" color="rgba(255,255,255,0.7)">
									Use keyboard keys to play the falling notes
								</Typography>
							</Box>
							
							<Stack direction="row" spacing={1} alignItems="center">
								<Chip 
									icon={<CheckCircle />} 
									label={`${gameStats.correctNotes}`} 
									color="success" 
									size="small"
								/>
								<Chip 
									icon={<Cancel />} 
									label={`${gameStats.wrongNotes}`} 
									color="error" 
									size="small"
								/>
								<Chip 
									icon={<EmojiEvents />} 
									label={`Score: ${gameStats.score}`} 
									color="primary" 
									variant="filled"
								/>
								
								<IconButton 
									onClick={pauseGame}
									sx={{ color: 'white', ml: 2 }}
								>
									<Pause />
								</IconButton>
								<IconButton 
									onClick={stopGame}
									sx={{ color: 'white' }}
								>
									<Stop />
								</IconButton>
							</Stack>
						</Stack>
					</CardContent>
				</Card>
			</Slide>

			{/* Game Area */}
			<Slide direction="up" in={gameState === 'PLAYING'} timeout={700}>
				<Box>
					{/* Falling Notes Area */}
					<Box sx={{ mb: 2 }}>
						<NoteContainer />
					</Box>
					
					{/* Piano */}
					<Box>
						<Piano />
					</Box>
				</Box>
			</Slide>
		</Box>
	);

	const renderPausedState = () => (
		<Fade in={gameState === 'PAUSED'} timeout={300}>
			<Card 
				elevation={8}
				sx={{
					background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
					backdropFilter: 'blur(10px)',
					border: '1px solid rgba(255,255,255,0.1)',
					borderRadius: 3,
					maxWidth: 400,
					width: '100%'
				}}
			>
				<CardContent sx={{ textAlign: 'center', p: 4 }}>
					<Pause sx={{ fontSize: 48, color: '#ffa726', mb: 2 }} />
					<Typography variant="h5" gutterBottom>
						Game Paused
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Take a break and resume when ready
					</Typography>
					
					<Stack direction="row" spacing={2} justifyContent="center">
						<Button
							variant="contained"
							startIcon={<PlayArrow />}
							onClick={resumeGame}
							sx={{
								background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
							}}
						>
							Resume
						</Button>
						<Button
							variant="outlined"
							startIcon={<Stop />}
							onClick={stopGame}
						>
							End Game
						</Button>
					</Stack>
				</CardContent>
			</Card>
		</Fade>
	);

	const renderEndedState = () => (
		<Fade in={gameState === 'ENDED'} timeout={500}>
			<Card 
				elevation={8}
				sx={{
					background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
					backdropFilter: 'blur(10px)',
					border: '1px solid rgba(255,255,255,0.1)',
					borderRadius: 3,
					maxWidth: 500,
					width: '100%'
				}}
			>
				<CardContent sx={{ textAlign: 'center', p: 4 }}>
					<EmojiEvents sx={{ fontSize: 48, color: '#ffd700', mb: 2 }} />
					<Typography variant="h4" gutterBottom>
						Game Complete!
					</Typography>
					
					<Stack spacing={2} sx={{ my: 3 }}>
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography variant="h6">Final Score:</Typography>
							<Typography variant="h6" color="primary.main" fontWeight="bold">
								{gameStats.score}
							</Typography>
						</Box>
						
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Accuracy:</Typography>
							<Typography color="primary.main" fontWeight="bold">
								{gameStats.accuracy.toFixed(1)}%
							</Typography>
						</Box>
						
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Correct Notes:</Typography>
							<Typography color="success.main" fontWeight="bold">
								{gameStats.correctNotes}
							</Typography>
						</Box>
						
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Wrong Notes:</Typography>
							<Typography color="error.main" fontWeight="bold">
								{gameStats.wrongNotes}
							</Typography>
						</Box>
						
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Total Notes:</Typography>
							<Typography fontWeight="bold">
								{gameStats.totalNotes}
							</Typography>
						</Box>
					</Stack>

					<Stack direction="row" spacing={2} justifyContent="center">
						<Button
							variant="contained"
							startIcon={<PlayArrow />}
							onClick={startGame}
							sx={{
								background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
							}}
						>
							Play Again
						</Button>
						<Button
							variant="outlined"
							onClick={returnToMenu}
						>
							Main Menu
						</Button>
					</Stack>
				</CardContent>
			</Card>
		</Fade>
	);

	const renderLoadingState = () => (
		<Fade in={gameState === 'LOADING'} timeout={300}>
			<Card 
				elevation={8}
				sx={{
					background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
					backdropFilter: 'blur(10px)',
					border: '1px solid rgba(255,255,255,0.1)',
					borderRadius: 3,
					maxWidth: 400,
					width: '100%'
				}}
			>
				<CardContent sx={{ textAlign: 'center', p: 4 }}>
					<Speed sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
					<Typography variant="h6" gutterBottom>
						{loadingMessage || 'Loading...'}
					</Typography>
					<LinearProgress 
						sx={{ 
							mt: 2,
							'& .MuiLinearProgress-bar': {
								background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
							}
						}} 
					/>
				</CardContent>
			</Card>
		</Fade>
	);

	const renderSongEditorState = () => (
		<SongEditor onBackToMenu={returnToMenu} onPlaySong={playEditorSong} />
	);

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="50vh"
			p={2}
			sx={{
				width: '100%',
				...(gameState === 'PLAYING' && {
					minHeight: '80vh',
					alignItems: 'flex-start',
					pt: 2
				}),
				...(gameState === 'SONG_EDITOR' && {
					minHeight: '100vh',
					alignItems: 'flex-start',
					pt: 1,
					p: 1
				})
			}}
		>
			{gameState === 'MENU' && renderMenuState()}
			{gameState === 'PLAYING' && renderPlayingState()}
			{gameState === 'PAUSED' && renderPausedState()}
			{gameState === 'ENDED' && renderEndedState()}
			{gameState === 'LOADING' && renderLoadingState()}
			{gameState === 'SONG_EDITOR' && renderSongEditorState()}
		</Box>
	);
};

export default GameController;
