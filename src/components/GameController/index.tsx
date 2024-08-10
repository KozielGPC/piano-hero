import React, { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNoteContext } from "../../context/NotesContext";
import NoteCanvas from "../Fabric";
import { Piano } from "../Piano";
import { Score } from "../Score";

const GameController: React.FC = () => {
	const { score } = useNoteContext();
	const [gameStarted, setGameStarted] = useState(false);
	const [firstTime, setFirstTime] = useState(true);

	const totalNotes = score.correctNotes + score.wrongNotes;
	const accuracyPercentage = totalNotes > 0 ? (score.correctNotes / totalNotes) * 100 : 0;

	const handleStartGame = () => {
		setGameStarted(true);
		setFirstTime(false);
	};

	const handleRetryGame = () => {
		setGameStarted(true);
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
			}}
		>
			{!gameStarted ? (
				<>
					{!firstTime && !gameStarted && (
						<Box sx={{ textAlign: "center", marginTop: "2rem" }}>
							<Typography variant="h5">Scoreboard</Typography>
							<Typography>Total Notes: {totalNotes}</Typography>
							<Typography>Hit Notes: {score.correctNotes}</Typography>
							<Typography>Missed Notes: {score.wrongNotes}</Typography>
							<Typography>Accuracy: {accuracyPercentage.toFixed(2)}%</Typography>
						</Box>
					)}

					<Button
						variant="contained"
						color="primary"
						sx={{ padding: "1rem 2rem", fontSize: "1.5rem", marginBottom: "1rem" }}
						onClick={firstTime ? handleStartGame : handleRetryGame}
					>
						{firstTime ? "Start Game" : "Retry Game"}
					</Button>
				</>
			) : (
				<Box
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Score />
					<NoteCanvas />
					<Piano />
				</Box>
			)}
		</Box>
	);
};

export default GameController;
