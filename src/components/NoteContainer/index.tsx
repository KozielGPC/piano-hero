import { Box } from "@mui/material";
import { ScrollingNote } from "../ScrollingNote";
import { notes } from "../../utils/constants";
import { INotes } from "../../utils/interfaces";

const scrollingNotes: INotes[] = [
	{
		...notes.G,
		displayAftertimeSeconds: 0,
	},
	{
		...notes.D,
		displayAftertimeSeconds: 1,
	},
	{
		...notes.S,
		displayAftertimeSeconds: 3,
	},
	// {
	// 	...notes.F,
	// 	displayAftertimeSeconds: 3,
	// },
	// {
	// 	...notes.F,
	// 	displayAftertimeSeconds: 5,
	// },
	{
		...notes.T,
		displayAftertimeSeconds: 7,
	},
	{
		...notes.U,
		displayAftertimeSeconds: 8,
	},
];

export const NoteContainer = () => {
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
				{scrollingNotes.map((note, index) => (
					<ScrollingNote key={index} note={note} />
				))}
			</Box>
		</Box>
	);
};
