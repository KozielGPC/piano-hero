import { Box } from "@mui/material";
import { ScrollingNote } from "../ScrollingNote";
import { NoteType } from "../../utils/constants";

interface INotes {
	note: string;
	offset: number;
	type: NoteType;
	displayAftertimeSeconds: number;
}

const notes: INotes[] = [
	{
		offset: -5,
		note: "d",
		type: NoteType.white,
		displayAftertimeSeconds: 1,
	},
	{
		offset: -1,
		note: "g",
		type: NoteType.white,
		displayAftertimeSeconds: 1,
	},
	{
		offset: -3,
		note: "f",
		type: NoteType.white,
		displayAftertimeSeconds: 1,
	},
	{
		offset: -3,
		note: "f",
		type: NoteType.white,
		displayAftertimeSeconds: 8,
	},
	{
		offset: 0.5,
		note: "t",
		type: NoteType.black,
		displayAftertimeSeconds: 10,
	},
	{
		offset: 7,
		note: "u",
		type: NoteType.black,
		displayAftertimeSeconds: 10,
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
				{notes.map((note, index) => (
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
