import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { NoteType } from "../../utils/constants";
import { useNoteContext } from "../../context/NotesContext";

interface IProps {
	note: string;
	type: NoteType;
	fileName: string;
}

export const Key = ({ note, type, fileName }: IProps) => {
	const { activeNotes, addCorrectNote, addWrongNote } = useNoteContext();

	const [isPressed, setIsPressed] = useState(false);

	const playSound = () => {
		const audio = new Audio(`/sounds/${fileName}`);
		audio.play();
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === note) {
				setIsPressed(true);
				playSound();
				if (activeNotes.find((n) => n.note === note)) {
					addCorrectNote(note);
				} else {
					addWrongNote();
				}
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === note) {
				setIsPressed(false);
			}
		};

		addEventListener("keydown", handleKeyDown);
		addEventListener("keyup", handleKeyUp);
		return () => {
			removeEventListener("keydown", handleKeyDown);
			removeEventListener("keyup", handleKeyUp);
		};
	}, [note, activeNotes]);

	const isWhite = type === NoteType.white;

	const keyStyles = isWhite
		? {
				width: "60px",
				height: isPressed ? "145px" : "150px",
				backgroundColor: isPressed ? "#ddd" : "white",
				color: "black",
				border: "1px solid black",
		  }
		: {
				width: "40px",
				height: isPressed ? "95px" : "100px",
				backgroundColor: isPressed ? "#333" : "black",
				color: "white",
				border: "1px solid black",
				position: "absolute",
				top: "0px",
				left: "40px",
				zIndex: "1",
		  };

	return (
		<Box
			sx={{
				...keyStyles,
				margin: "2px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
			}}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onClick={playSound}
		>
			{note}
		</Box>
	);
};
