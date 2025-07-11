import { useEffect } from "react";
import { Box } from "@mui/material";
import SongEditor from "../SongEditor";
import { Menu } from "./components/Stages/Menu";
import { useGame } from "../../context/GameContext";
import { EndGame } from "./components/Stages/EndGame";
import { Pause } from "./components/Stages/Pause";
import { Play } from "./components/Stages/Play";
import { Loading } from "./components/Stages/Loading";

const GameController = () => {
	const { gameState, currentTime, animationRef, actions, prevScoreRef, score } = useGame();

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

	const renderSongEditorState = () => (
		<SongEditor onBack={() => actions.setGameState("MENU")} onPlaySong={actions.playEditorSong} />
	);

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
			{gameState === "LOADING" && <Loading />}
			{gameState === "SONG_EDITOR" && renderSongEditorState()}
		</Box>
	);
};

export default GameController;
