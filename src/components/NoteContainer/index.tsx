import { Box } from "@mui/material";
import { ScrollingNote } from "../ScrollingNote";
import { useNoteContext } from "../../context/NotesContext";

export const NoteContainer = () => {
	const { currentSong } = useNoteContext();

	// If no current song is set, don't render any notes
	if (!currentSong || currentSong.length === 0) {
		return (
			<Box
				sx={{
					position: "relative",
					width: "100%",
					height: "400px",
					backgroundColor: "#eee",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					overflow: "hidden",
					border: "2px solid black",
				}}
			>
				<Box sx={{ textAlign: "center", color: "#666" }}>
					No song selected
				</Box>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				position: "relative",
				width: "100%",
				height: "400px",
				backgroundColor: "#eee",
				display: "flex",
				justifyContent: "center",
				overflow: "hidden",
				border: "2px solid black",
			}}
		>
			<Box
				sx={{
					position: "relative",
				}}
			>
				{currentSong.map((note, index) => (
					<ScrollingNote key={index} note={note} />
				))}
			</Box>
		</Box>
	);
};
