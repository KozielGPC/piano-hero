import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ScrollingNote } from "../ScrollingNote";
import { keys } from "../../utils/constants";

export const NoteContainer = () => {
	const [notes, setNotes] = useState<string[]>([]);

	useEffect(() => {
		const interval = setInterval(() => {
			const possibleNotes = keys.map((key) => key.note);
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
			{notes.map((note, index) => (
				<ScrollingNote key={index} note={note} />
			))}
		</Box>
	);
};
