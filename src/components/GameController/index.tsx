import { useEffect } from "react";
import { Box, Typography, Card, CardContent, LinearProgress, Fade } from "@mui/material";
import { useNoteContext } from "../../context/NotesContext";
import SongEditor from "../SongEditor";
import { Menu } from "./components/Menu";
import { useGame } from "../../context/GameContext";
import { EndGame } from "./components/EndGame";
import { Pause } from "./components/Pause";
import { Play } from "./components/Play";
import { Speed } from "@mui/icons-material";

const GameController = () => {
	const { score } = useNoteContext();

	const {
		gameState,
		currentTime,
		animationRef,
		loadingMessage,
		actions,
		prevScoreRef,
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
			{gameState === "PLAYING" && <Play />}
			{gameState === "PAUSED" && <Pause />}
			{gameState === "ENDED" && <EndGame />}
			{gameState === "LOADING" && renderLoadingState()}
			{gameState === "SONG_EDITOR" && renderSongEditorState()}
		</Box>
	);
};

export default GameController;
