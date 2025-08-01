import { Box, LinearProgress, Stack, Typography, IconButton, Chip } from "@mui/material";
import { Pause, Stop, CheckCircle, EmojiEvents, Star, Cancel } from "@mui/icons-material";
import { useGame } from "../../../../../../../context/GameContext";
import { INotes } from "../../../../../../../utils/interfaces";

export const Header = () => {
	const { allSongs, selectedSongId, score, combo, maxCombo, actions, currentTime, currentSong } = useGame();

	// Calculate total song duration (last note time + 3 second buffer to match RhythmEngine)
	const totalDuration = currentSong && currentSong.length > 0 
		? Math.max(...currentSong.map((n: INotes) => n.displayAftertimeSeconds)) + 3 // 3 second buffer to match game end timing
		: 0;

	const progress = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;
	
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<Stack spacing={2}>
			{/* Main Header Row */}
			<Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
				{/* Left Side - Song Info */}
				<Box>
					<Typography variant="h6" color="white">
						{allSongs[selectedSongId]?.name || "Playing..."}
					</Typography>
					<Typography variant="body2" color="rgba(255,255,255,0.7)">
						Use keyboard keys to play the falling notes
					</Typography>
				</Box>

				{/* Right Side - Game Stats */}
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

			{/* Progress Bar Row - Right Aligned */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
				<Box sx={{ width: 600 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
							{formatTime(currentTime)}
						</Typography>
						<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'medium', fontSize: '0.9rem' }}>
							{progress.toFixed(1)}%
						</Typography>
						<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
							{formatTime(totalDuration)}
						</Typography>
					</Box>
					<LinearProgress 
						variant="determinate" 
						value={progress} 
						sx={{ 
							height: 10, 
							borderRadius: 5,
							backgroundColor: 'rgba(255, 255, 255, 0.2)',
							'& .MuiLinearProgress-bar': {
								background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
							}
						}} 
					/>
				</Box>
			</Box>
		</Stack>
	);
};
