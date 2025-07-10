import React, { useEffect } from "react";
import {
	Box,
	Button,
	Typography,
	Card,
	CardContent,
	LinearProgress,
	Chip,
	Stack,
	Fade,
	Slide,
	IconButton,
} from "@mui/material";
import {
	PlayArrow,
	Pause,
	Stop,
	CheckCircle,
	Cancel,
	EmojiEvents,
	Speed,
	Star,
} from "@mui/icons-material";
import { useNoteContext } from "../../context/NotesContext";
import InteractivePianoCanvas, { IFallingNote } from "../PianoCanvas";
import { notes } from "../../utils/constants";
import SongEditor from "../SongEditor";
import { Menu } from "./components/Menu";
import { useGame } from "../../context/GameContext";

const GameController: React.FC = () => {
	// const [gameState, setGameState] = useState<GameState>("MENU");
	// const [selectedSongId, setSelectedSongId] = useState<string>("interstellar");
	// const [accuracy, setAccuracy] = useState<number>(0);
	// const [combo, setCombo] = useState<number>(0);
	// const [maxCombo, setMaxCombo] = useState<number>(0);
	// // Track game time for canvas animation
	// const [currentTime, setCurrentTime] = useState<number>(0);
	// const animationRef = useRef<number>();
	// const [isLoading, setIsLoading] = useState<boolean>(false);
	// const [loadingMessage] = useState<string>("");
	// const [importError, setImportError] = useState<string>("");
	// const [importSuccess, setImportSuccess] = useState<string>("");
	// const [error, setError] = useState<string>("");

	// // Add ref to track previous score for combo calculation
	// const prevScoreRef = useRef<{ correctNotes: number; wrongNotes: number } | null>(null);

	// const { score, setCurrentSong, resetScore, currentSong } = useNoteContext();

	// // Get all songs including uploaded ones
	// const allSongs = getAllSongs();

	const { currentSong, score } = useNoteContext();

	const {
		gameState,
		accuracy,
		combo,
		maxCombo,
		currentTime,
		animationRef,
		loadingMessage,
		actions,
		prevScoreRef,
		selectedSongId,
		allSongs,
	} = useGame();

	// Update game stats when score changes
	useEffect(() => {
		if (score && typeof score === "object") {
			// Calculate accuracy based on score
			const totalNotes = score.correctNotes + score.wrongNotes;
			const calculatedAccuracy = totalNotes > 0 ? (score.correctNotes / totalNotes) * 100 : 0;
			actions.setAccuracy(calculatedAccuracy);

			// Handle combo logic
			const prevScore = prevScoreRef.current;
			if (prevScore) {
				// Check if wrong notes increased (combo breaker)
				if (score.wrongNotes > prevScore.wrongNotes) {
					actions.setCombo(0);
				}
				// Check if correct notes increased (combo increment)
				else if (score.correctNotes > prevScore.correctNotes) {
					actions.setCombo((prevCombo) => {
						const newCombo = prevCombo + 1;
						// Update max combo if current combo is higher
						actions.setMaxCombo((prevMax) => Math.max(prevMax, newCombo));
						return newCombo;
					});
				}
			} else {
				// First score update, initialize combo
				if (score.correctNotes > 0) {
					actions.setCombo(score.correctNotes);
					actions.setMaxCombo(score.correctNotes);
				}
			}

			// Update previous score reference
			prevScoreRef.current = { correctNotes: score.correctNotes, wrongNotes: score.wrongNotes };
		}
	}, [score]);

	// Drive time progression while playing
	useEffect(() => {
		if (gameState !== "PLAYING") {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
			return;
		}
		const start = performance.now() - currentTime * 1000; // resume support
		const step = (ts: number) => {
			actions.setCurrentTime((ts - start) / 1000);
			animationRef.current = requestAnimationFrame(step);
		};
		animationRef.current = requestAnimationFrame(step);
		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, [gameState]);

	// Convert current song notes to falling-note format for the canvas. We need the note key (e.g., "Q", "Qb")
	// so that InteractivePianoCanvas can look it up in the global `notes` map.
	const fallingNotes: IFallingNote[] = (currentSong || []).map((n) => {
		// Find the constant-key (e.g., "Q", "Qb", "Z") whose `note` char matches the saved value
		const entry = Object.entries(notes).find(([, v]) => v.note.toLowerCase() === n.note.toLowerCase());
		const keyName = entry ? entry[0] : n.note; // fallback to original if not found

		return {
			note: keyName,
			offset: n.offset,
			type: n.type,
			time: n.displayAftertimeSeconds,
			duration: 1,
		} as IFallingNote;
	});

	// const handleSongSelect = (songId: string) => {
	// 	actions.setSelectedSongId(songId);
	// 	const song = allSongs[songId];
	// 	if (song) {
	// 		setCurrentSong(song.notes);
	// 	}
	// };

	// const handleJSONImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
	// 	const file = event.target.files?.[0];
	// 	if (!file) return;

	// 	setIsLoading(true);
	// 	setImportError("");
	// 	setImportSuccess("");

	// 	try {
	// 		const fileContent = await file.text();
	// 		const songData = await importSongFromJSON(fileContent);

	// 		// Add to uploaded songs
	// 		await addUploadedSong(songData);

	// 		setImportSuccess(`Successfully imported "${songData.name}" by ${songData.artist}`);

	// 		// Auto-select the imported song
	// 		setSelectedSongId(`uploaded_${Date.now()}`);
	// 	} catch (error) {
	// 		console.error("Import error:", error);
	// 		setImportError(error instanceof Error ? error.message : "Failed to import song");
	// 	} finally {
	// 		setIsLoading(false);
	// 		// Clear the file input
	// 		event.target.value = "";
	// 	}
	// };

	// const startGame = useCallback(() => {
	// 	if (!selectedSongId) {
	// 		setError("Please select a song first");
	// 		return;
	// 	}

	// 	const selectedSong = allSongs[selectedSongId];
	// 	if (!selectedSong) {
	// 		setError("Selected song not found");
	// 		return;
	// 	}

	// 	setError("");
	// 	// Reset game stats for new game
	// 	setCombo(0);
	// 	setMaxCombo(0);
	// 	setAccuracy(0);
	// 	prevScoreRef.current = null;
	// 	// Reset score in context
	// 	resetScore();
	// 	setCurrentTime(0);

	// 	setCurrentSong(selectedSong.notes);
	// 	setGameState("PLAYING");
	// }, [selectedSongId, setCurrentSong, allSongs, resetScore]);

	// const pauseGame = useCallback(() => {
	// 	setGameState("PAUSED");
	// }, []);

	// const resumeGame = useCallback(() => {
	// 	setGameState("PLAYING");
	// }, []);

	// const stopGame = useCallback(() => {
	// 	setGameState("ENDED");
	// }, []);

	// const returnToMenu = useCallback(() => {
	// 	setGameState("MENU");
	// 	setCurrentSong(null);
	// 	// Reset game stats when returning to menu
	// 	setCombo(0);
	// 	setMaxCombo(0);
	// 	setAccuracy(0);
	// 	prevScoreRef.current = null;
	// }, [setCurrentSong]);

	// const playEditorSong = useCallback(
	// 	(songNotes: INotes[]) => {
	// 		setCurrentSong(songNotes);
	// 		setGameState("PLAYING");
	// 	},
	// 	[setCurrentSong],
	// );

	const renderPlayingState = () => (
		<Box sx={{ width: "100%", maxWidth: "1200px" }}>
			{/* Game Header with Controls */}
			<Slide direction="down" in={gameState === "PLAYING"} timeout={500}>
				<Card
					elevation={4}
					sx={{
						background: "rgba(0,0,0,0.8)",
						backdropFilter: "blur(10px)",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: 2,
						mb: 2,
					}}
				>
					<CardContent>
						<Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
							<Box>
								<Typography variant="h6" color="white">
									{allSongs[selectedSongId]?.name || "Playing..."}
								</Typography>
								<Typography variant="body2" color="rgba(255,255,255,0.7)">
									Use keyboard keys to play the falling notes
								</Typography>
							</Box>

							<Stack direction="row" spacing={1} alignItems="center">
								<Chip icon={<CheckCircle />} label={`Combo: ${combo}`} color="success" size="small" />
								<Chip
									icon={<Star />}
									label={`Max: ${maxCombo}`}
									sx={{
										backgroundColor: "#ffd700",
										color: "#333",
										"& .MuiChip-icon": { color: "#333" },
									}}
									size="small"
								/>
								<Chip
									icon={<EmojiEvents />}
									label={`Score: ${score && typeof score === "object" ? score.correctNotes * 10 : 0}`}
									color="primary"
									variant="filled"
								/>
								<Chip
									icon={<CheckCircle />}
									label={`Correct: ${score && typeof score === "object" ? score.correctNotes : 0}`}
									sx={{
										backgroundColor: "#4caf50",
										color: "white",
										fontWeight: "bold",
										"& .MuiChip-icon": { color: "white" },
									}}
									size="small"
								/>
								<Chip
									icon={<Cancel />}
									label={`Wrong: ${score && typeof score === "object" ? score.wrongNotes : 0}`}
									sx={{
										backgroundColor: "#f44336",
										color: "white",
										fontWeight: "bold",
										"& .MuiChip-icon": { color: "white" },
									}}
									size="small"
								/>

								<IconButton onClick={actions.pauseGame} sx={{ color: "white", ml: 2 }}>
									<Pause />
								</IconButton>
								<IconButton onClick={actions.stopGame} sx={{ color: "white" }}>
									<Stop />
								</IconButton>
							</Stack>
						</Stack>
					</CardContent>
				</Card>
			</Slide>

			{/* Game Area */}
			<Slide direction="up" in={gameState === "PLAYING"} timeout={700}>
				<Box>
					{/* Combined falling notes + piano canvas */}
					<Box sx={{ mb: 2 }}>
						<InteractivePianoCanvas
							notes={fallingNotes}
							currentTime={currentTime}
							width={800}
							height={400}
						/>
					</Box>
				</Box>
			</Slide>
		</Box>
	);

	const renderPausedState = () => (
		<Fade in={gameState === "PAUSED"} timeout={300}>
			<Card
				elevation={8}
				sx={{
					background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255,255,255,0.1)",
					borderRadius: 3,
					maxWidth: 400,
					width: "100%",
				}}
			>
				<CardContent sx={{ textAlign: "center", p: 4 }}>
					<Pause sx={{ fontSize: 48, color: "#ffa726", mb: 2 }} />
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
							onClick={actions.resumeGame}
							sx={{
								background: "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)",
							}}
						>
							Resume
						</Button>
						<Button variant="outlined" startIcon={<Stop />} onClick={actions.stopGame}>
							End Game
						</Button>
					</Stack>
				</CardContent>
			</Card>
		</Fade>
	);

	const renderEndedState = () => (
		<Fade in={gameState === "ENDED"} timeout={500}>
			<Card
				elevation={8}
				sx={{
					background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255,255,255,0.1)",
					borderRadius: 3,
					maxWidth: 500,
					width: "100%",
				}}
			>
				<CardContent sx={{ textAlign: "center", p: 4 }}>
					<EmojiEvents sx={{ fontSize: 48, color: "#ffd700", mb: 2 }} />
					<Typography variant="h4" gutterBottom>
						Game Complete!
					</Typography>

					<Stack spacing={2} sx={{ my: 3 }}>
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography variant="h6">Final Score:</Typography>
							<Typography variant="h6" color="primary.main" fontWeight="bold">
								{score && typeof score === "object" ? score.correctNotes * 10 : 0}
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
								{score && typeof score === "object" ? score.correctNotes : 0}
							</Typography>
						</Box>

						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Wrong Notes:</Typography>
							<Typography color="error.main" fontWeight="bold">
								{score && typeof score === "object" ? score.wrongNotes : 0}
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
							onClick={actions.startGame}
							sx={{
								background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
							}}
						>
							Play Again
						</Button>
						<Button variant="outlined" onClick={actions.returnToMenu}>
							Main Menu
						</Button>
					</Stack>
				</CardContent>
			</Card>
		</Fade>
	);

	const renderLoadingState = () => (
		<Fade in={gameState === "LOADING"} timeout={300}>
			<Card
				elevation={8}
				sx={{
					background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255,255,255,0.1)",
					borderRadius: 3,
					maxWidth: 400,
					width: "100%",
				}}
			>
				<CardContent sx={{ textAlign: "center", p: 4 }}>
					<Speed sx={{ fontSize: 48, color: "#667eea", mb: 2 }} />
					<Typography variant="h6" gutterBottom>
						{loadingMessage || "Loading..."}
					</Typography>
					<LinearProgress
						sx={{
							mt: 2,
							"& .MuiLinearProgress-bar": {
								background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
							},
						}}
					/>
				</CardContent>
			</Card>
		</Fade>
	);

	const renderSongEditorState = () => (
		<SongEditor onBack={() => actions.setGameState("MENU")} onPlaySong={actions.playEditorSong} />
	);

	useEffect(() => {
		console.log("gameState", gameState);
	}, [gameState]);

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="50vh"
			p={2}
			sx={{
				width: "100%",
				...(gameState === "PLAYING" && {
					minHeight: "80vh",
					alignItems: "flex-start",
					pt: 2,
				}),
				...(gameState === "SONG_EDITOR" && {
					minHeight: "100vh",
					alignItems: "flex-start",
					pt: 1,
					p: 1,
				}),
			}}
		>
			{gameState === "MENU" && <Menu />}
			{gameState === "PLAYING" && renderPlayingState()}
			{gameState === "PAUSED" && renderPausedState()}
			{gameState === "ENDED" && renderEndedState()}
			{gameState === "LOADING" && renderLoadingState()}
			{gameState === "SONG_EDITOR" && renderSongEditorState()}
		</Box>
	);
};

export default GameController;
