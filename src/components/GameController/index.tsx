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
	const { gameState, currentTime, animationRef, actions, prevScoreRef, score, currentSongAudioUrl } = useGame();

	useEffect(() => {
		if (score && typeof score === "object") {
			actions.updateAccuracy(score);

			const prevScore = prevScoreRef.current;
			actions.handleComboLogic(score, prevScore);

			// Update previous score reference
			prevScoreRef.current = { correctNotes: score.correctNotes, wrongNotes: score.wrongNotes };
		}
	}, [score, prevScoreRef, actions]);

	// Drive time progression while playing - only when there's no background audio
	// When there's background audio, the Play component handles time synchronization
	useEffect(() => {
		if (gameState !== "PLAYING" || currentSongAudioUrl) {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
			return;
		}

		// Only start timing if currentTime is greater than 0 (indicates user has started)
		if (currentTime <= 0) {
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
	}, [gameState, currentTime, actions, animationRef, currentSongAudioUrl]);

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="50vh"
			p={2}
			position="relative"
			sx={{
				width: "100%",
				...(gameState === "PLAYING" && {
					minHeight: "80vh",
					alignItems: "flex-start",
					pt: 2,
				}),
				...(gameState === "PAUSED" && {
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
			{(gameState === "PLAYING" || gameState === "PAUSED") && <Play />}
			{gameState === "ENDED" && <EndGame />}
			{gameState === "LOADING" && <Loading />}
			{gameState === "SONG_EDITOR" && <SongEditor />}

			{gameState === "PAUSED" && (
				<Box
					position="absolute"
					top={0}
					left={0}
					right={0}
					bottom={0}
					display="flex"
					justifyContent="center"
					alignItems="center"
					sx={{
						backgroundColor: "rgb(255, 255, 255)",
						zIndex: 1000,
					}}
				>
					<Pause />
				</Box>
			)}
		</Box>
	);
};

export default GameController;
