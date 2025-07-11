import { Card, CardContent, Stack, Typography, Chip, IconButton } from "@mui/material";

import { Slide } from "@mui/material";

import { Box } from "@mui/material";
import { useGame } from "../../../../../context/GameContext";
import InteractivePianoCanvas, { IFallingNote } from "../../../../PianoCanvas";
import { CheckCircle, Cancel, EmojiEvents, Star, Pause as PauseIcon, Stop } from "@mui/icons-material";
import { notes } from "../../../../../utils/constants";

export const Play = () => {
	const { gameState, actions, combo, maxCombo, selectedSongId, allSongs, currentTime, score, currentSong } =
		useGame();

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

	return (
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
									<PauseIcon />
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
};
