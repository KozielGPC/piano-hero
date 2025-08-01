import { Box, Typography, LinearProgress } from "@mui/material";
import { formatTime } from "../../../../../../../utils/time";
import { INotes } from "../../../../../../../utils/interfaces";

interface IProps {
	currentTime: number;
	currentSong: INotes[] | null;
}

export const ProgressBar = ({ currentTime, currentSong }: IProps) => {
	const getTotalDuration = () => {
		if (!currentSong) return 0;
		const lastNoteTime = Math.max(...currentSong.map((n: INotes) => n.displayAftertimeSeconds));
		const endGameDelay = 3;
		return lastNoteTime + endGameDelay;
	};

	const getProgress = (totalDuration: number) => {
		if (!currentTime || !totalDuration) return 0;
		return (currentTime / totalDuration) * 100;
	};

	const totalDuration = getTotalDuration();
	const progress = getProgress(totalDuration);

	return (
		<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
			<Box sx={{ width: 600 }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
					<Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.9rem" }}>
						{formatTime(currentTime)}
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: "medium", fontSize: "0.9rem" }}
					>
						{progress.toFixed(1)}%
					</Typography>
					<Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.9rem" }}>
						{formatTime(totalDuration)}
					</Typography>
				</Box>
				<LinearProgress
					variant="determinate"
					value={progress}
					sx={{
						height: 10,
						borderRadius: 5,
						backgroundColor: "rgba(255, 255, 255, 0.2)",
						"& .MuiLinearProgress-bar": {
							background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
						},
					}}
				/>
			</Box>
		</Box>
	);
};
