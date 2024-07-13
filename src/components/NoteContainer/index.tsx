import { Box } from "@mui/material";
import { ScrollingNote } from "../ScrollingNote";
import { NoteType, notes } from "../../utils/constants";

interface INotes {
	note: string;
	offset: number;
	type: NoteType;
	displayAftertimeSeconds: number;
}

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
	{
		...notes.F,
		displayAftertimeSeconds: 3,
	},
	{
		...notes.F,
		displayAftertimeSeconds: 5,
	},
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
				marginBottom: "20px",
			}}
		>
			<Box
				sx={{
					position: "relative",
				}}
			>
				{scrollingNotes.map((note, index) => (
					<ScrollingNote
						key={index}
						note={note.note}
						type={note.type}
						leftOffset={note.offset}
						displayAftertimeSeconds={note.displayAftertimeSeconds}
					/>
				))}
			</Box>
		</Box>
	);
};
