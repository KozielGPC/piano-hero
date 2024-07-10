import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ScrollingNote } from "../ScrollingNote";
import { keys, NoteType } from "../../utils/constants";

interface INotes {
	note: string;
	offset: number;
	type: NoteType;
}

export const NoteContainer = () => {
	const [notes, setNotes] = useState<INotes[]>([]);

	useEffect(() => {
		const interval = setInterval(() => {
			const possibleNotes = keys.map((key) => ({
				note: key.note,
				offset: key.offset,
				type: key.type,
			}));
			const randomNote =
				possibleNotes[Math.floor(Math.random() * possibleNotes.length)];
			setNotes((prevNotes) => [...prevNotes, randomNote]);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

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
					/>
				))}
			</Box>
		</Box>
	);
};
