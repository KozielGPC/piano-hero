import React, { useState, useCallback, useEffect } from 'react';
import {
	Box,
	Button,
	Typography,
	Card,
	CardContent,
	Select,
	MenuItem,
	LinearProgress,
	Chip,
	Stack,
	Alert,
	Fade,
	Slide,
	IconButton,
} from '@mui/material';
import { 
	PlayArrow, 
	Pause, 
	Stop,
	Edit, 
	Upload,
	CheckCircle,
	Cancel,
	EmojiEvents,
	Speed
} from '@mui/icons-material';
import { getAllSongs, addUploadedSong, importSongFromJSON } from '../../utils/songLibrary';
import { useNoteContext } from '../../context/NotesContext';
import { Piano } from '../Piano';
import { NoteContainer } from '../NoteContainer';
import SongEditor from '../SongEditor';
import { INotes } from '../../utils/interfaces';

type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'ENDED' | 'LOADING' | 'SONG_EDITOR';

const GameController: React.FC = () => {
	const [gameState, setGameState] = useState<GameState>('MENU');
	const [selectedSongId, setSelectedSongId] = useState<string>('interstellar');
	const [accuracy, setAccuracy] = useState<number>(0);
	const [combo, setCombo] = useState<number>(0);
	const [maxCombo, setMaxCombo] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [loadingMessage, setLoadingMessage] = useState<string>('');
	const [importError, setImportError] = useState<string>('');
	const [importSuccess, setImportSuccess] = useState<string>('');
	const [error, setError] = useState<string>('');
	
	const { 
		score,
		setCurrentSong
	} = useNoteContext();

	// Get all songs including uploaded ones
	const allSongs = getAllSongs();

	// Update game stats when score changes
	useEffect(() => {
		if (score && typeof score === 'object') {
			// Calculate accuracy based on score
			const totalNotes = score.correctNotes + score.wrongNotes;
			const calculatedAccuracy = totalNotes > 0 ? (score.correctNotes / totalNotes) * 100 : 0;
			setAccuracy(calculatedAccuracy);
			
			// Update max combo if current combo is higher
			if (combo > maxCombo) {
				setMaxCombo(combo);
			}
		}
	}, [score, combo, maxCombo]);

	const handleSongSelect = (songId: string) => {
		setSelectedSongId(songId);
		const song = allSongs[songId];
		if (song) {
			setCurrentSong(song.notes);
		}
	};

	const handleJSONImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsLoading(true);
		setImportError('');
		setImportSuccess('');

		try {
			const fileContent = await file.text();
			const songData = await importSongFromJSON(fileContent);
			
			// Add to uploaded songs
			await addUploadedSong(songData);
			
			setImportSuccess(`Successfully imported "${songData.name}" by ${songData.artist}`);
			
			// Auto-select the imported song
			setSelectedSongId(`uploaded_${Date.now()}`);
			
		} catch (error) {
			console.error('Import error:', error);
			setImportError(error instanceof Error ? error.message : 'Failed to import song');
		} finally {
			setIsLoading(false);
			// Clear the file input
			event.target.value = '';
		}
	};

	const startGame = useCallback(() => {
		if (!selectedSongId) {
			setError('Please select a song first');
			return;
		}

		const selectedSong = allSongs[selectedSongId];
		if (!selectedSong) {
			setError('Selected song not found');
			return;
		}

		setError('');
		setCurrentSong(selectedSong.notes);
		setGameState('PLAYING');
	}, [selectedSongId, setCurrentSong, allSongs]);

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
	}, [setCurrentSong]);

	const openSongEditor = useCallback(() => {
		setGameState('SONG_EDITOR');
	}, []);

	const playEditorSong = useCallback((songNotes: INotes[]) => {
		setCurrentSong(songNotes);
		setGameState('PLAYING');
	}, [setCurrentSong]);

	const renderMenuState = () => (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				padding: '2rem',
				textAlign: 'center',
			}}
		>
			<Typography
				variant="h3"
				sx={{
					marginBottom: '3rem',
					color: '#333',
					fontWeight: 'bold',
					textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
				}}
			>
				Choose Your Challenge
			</Typography>

			{/* Error and Success Messages */}
			{importError && (
				<Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 400 }} onClose={() => setImportError('')}>
					{importError}
				</Alert>
			)}

			{importSuccess && (
				<Alert severity="success" sx={{ mb: 2, width: '100%', maxWidth: 400 }} onClose={() => setImportSuccess('')}>
					{importSuccess}
				</Alert>
			)}

			{/* Song Selection */}
			<Card elevation={6} sx={{ padding: '2rem', marginBottom: '2rem', minWidth: '400px', backgroundColor: 'rgba(255,255,255,0.9)' }}>
				<Typography variant="h6" sx={{ marginBottom: '1rem', color: '#555' }}>
					Select a Song
				</Typography>
				<Select
					value={selectedSongId}
					onChange={(e) => handleSongSelect(e.target.value)}
					fullWidth
					sx={{ marginBottom: '1rem' }}
				>
					{Object.entries(allSongs).map(([id, song]) => (
						<MenuItem key={id} value={id}>
							{song.name} - {song.artist}
						</MenuItem>
					))}
				</Select>

				{/* JSON Import */}
				<Box sx={{ mt: 2, mb: 2 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						Or import a custom song:
					</Typography>
					<input
						type="file"
						accept=".json"
						onChange={handleJSONImport}
						style={{ display: 'none' }}
						id="json-upload"
					/>
					<label htmlFor="json-upload">
						<Button
							variant="outlined"
							component="span"
							startIcon={<Upload />}
							disabled={isLoading}
							fullWidth
						>
							Import Song JSON
						</Button>
					</label>
				</Box>

				<Button
					variant="contained"
					size="large"
					onClick={startGame}
					disabled={!selectedSongId || isLoading}
					startIcon={<PlayArrow />}
					sx={{
						padding: '1rem 2rem',
						fontSize: '1.2rem',
						background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
						boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
						'&:hover': {
							background: 'linear-gradient(45deg, #FE8B8B 30%, #FFAE53 90%)',
						},
					}}
				>
					Start Game
				</Button>
			</Card>

			{/* Song Editor Button */}
			<Button
				variant="outlined"
				size="large"
				onClick={() => setGameState('SONG_EDITOR')}
				startIcon={<Edit />}
				sx={{
					padding: '1rem 2rem',
					fontSize: '1.1rem',
					marginBottom: '1rem',
					borderColor: '#FF8E53',
					color: '#FF8E53',
					'&:hover': {
						borderColor: '#FE6B8B',
						backgroundColor: 'rgba(254, 107, 139, 0.1)',
					},
				}}
			>
				Song Editor
			</Button>

			{/* Instructions */}
			<Typography variant="body1" sx={{ marginTop: '1rem', color: '#666', maxWidth: '600px' }}>
				Use your keyboard to play the falling notes! Match the timing and build your combo for a higher score.
			</Typography>
		</Box>
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
									{allSongs[selectedSongId]?.name || 'Playing...'}
								</Typography>
								<Typography variant="body2" color="rgba(255,255,255,0.7)">
									Use keyboard keys to play the falling notes
								</Typography>
							</Box>
							
							<Stack direction="row" spacing={1} alignItems="center">
								<Chip 
									icon={<CheckCircle />} 
									label={`Combo: ${combo}`} 
									color="success" 
									size="small"
								/>
								<Chip 
									icon={<Cancel />} 
									label={`Max: ${maxCombo}`} 
									color="error" 
									size="small"
								/>
								<Chip 
									icon={<EmojiEvents />} 
									label={`Score: ${score}`} 
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
								{(score && typeof score === 'object' ? score.correctNotes * 10 : 0)}
							</Typography>
						</Box>
						
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Accuracy:</Typography>
							<Typography color="primary.main" fontWeight="bold">
								{accuracy.toFixed(1)}%
							</Typography>
						</Box>
						
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Correct Notes:</Typography>
							<Typography color="success.main" fontWeight="bold">
								{(score && typeof score === 'object' ? score.correctNotes : 0)}
							</Typography>
						</Box>
						
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Wrong Notes:</Typography>
							<Typography color="error.main" fontWeight="bold">
								{(score && typeof score === 'object' ? score.wrongNotes : 0)}
							</Typography>
						</Box>
						
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Max Combo:</Typography>
							<Typography color="primary.main" fontWeight="bold">
								{maxCombo}
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
		<SongEditor 
			onBack={() => setGameState('MENU')}
			onPlaySong={(songNotes) => {
				setCurrentSong(songNotes);
				setGameState('PLAYING');
			}}
		/>
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
