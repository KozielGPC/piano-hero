import { Box, Chip, Stack, Typography, IconButton } from "@mui/material";
import { useGame } from "../../../../../../../context/GameContext";
import { CheckCircle, EmojiEvents, Star, Cancel, Pause, Stop } from "@mui/icons-material";

export const Header = () => {
	const { allSongs, selectedSongId, score, combo, maxCombo, actions } = useGame();
	return (
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
					label={`Score: ${score && typeof score === "object" ? score.points : 0}`}
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
	);
};
