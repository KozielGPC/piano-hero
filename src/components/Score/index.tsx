import { Box, Typography } from "@mui/material";
import { useNoteContext } from "../../context/NotesContext";

export const Score = () => {
	const { score } = useNoteContext();

	return (
		<Box
			sx={{
				position: "relative",
				width: "100%",
				backgroundColor: "#eeeeee92",
				color: "black",
				display: "flex",
				justifyContent: "center",
				overflow: "hidden",
				border: "2px solid black",
				marginBottom: "20px",
			}}
		>
			<Box
				sx={{
					position: "relative",
				}}
			>
				<Typography variant="h3">
					Correct notes: {score.correctNotes}
				</Typography>
				<Typography variant="h3">Wrong notes: {score.wrongNotes}</Typography>
			</Box>
		</Box>
	);
};
