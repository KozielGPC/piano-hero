import { Box, Typography } from "@mui/material";
import { useNoteContext } from "../../context/NotesContext";

export const Score = () => {
	const { score } = useNoteContext();

	return (
		<Box
			sx={{
				width: "100%",
				display: "flex",
				justifyContent: "space-evenly",
				borderBottom: "2px solid black",
				color: "black",
			}}
		>
			<Typography variant="h4">Correct notes: {score.correctNotes}</Typography>
			<Typography variant="h4">Wrong notes: {score.wrongNotes}</Typography>
		</Box>
	);
};
