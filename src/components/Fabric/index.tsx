import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
// import { INotes } from "../../utils/interfaces";
import { NoteType, scrollingNotes } from "../../utils/constants";
import { Box } from "@mui/material";
import { useNoteContext } from "../../context/NotesContext";
import { RectProps, TOptions } from "fabric";

// const scrollingNotes: INotes[] = [
// 	{
// 		...notes.G,
// 		displayAftertimeSeconds: 1,
// 	},
// 	{
// 		...notes.F,
// 		displayAftertimeSeconds: 3,
// 	},
// 	{
// 		...notes.S,
// 		displayAftertimeSeconds: 3,
// 	},
// 	{
// 		...notes.D,
// 		displayAftertimeSeconds: 7,
// 	},
// 	{
// 		...notes.G,
// 		displayAftertimeSeconds: 7,
// 	},
// 	{
// 		...notes.T,
// 		displayAftertimeSeconds: 9,
// 	},
// 	{
// 		...notes.U,
// 		displayAftertimeSeconds: 11,
// 	},
// 	{
// 		...notes.H,
// 		displayAftertimeSeconds: 13,
// 	},
// 	{
// 		...notes.J,
// 		displayAftertimeSeconds: 15,
// 	},
// 	{
// 		...notes.K,
// 		displayAftertimeSeconds: 17,
// 	},
// ];

// const scrollingNotes: INotes[] = [
// 	{
// 		...notes.M,
// 		displayAftertimeSeconds: 0,
// 	},
// 	// {
// 	// 	...notes.J,
// 	// 	displayAftertimeSeconds: 1,
// 	// },
// 	// {
// 	// 	...notes.J,
// 	// 	displayAftertimeSeconds: 1,
// 	// },
// 	// {
// 	// 	...notes.F,
// 	// 	displayAftertimeSeconds: 4,
// 	// },
// 	// {
// 	// 	...notes.H,
// 	// 	displayAftertimeSeconds: 4,
// 	// },
// 	// {
// 	// 	...notes.T,
// 	// 	displayAftertimeSeconds: 9,
// 	// },
// 	// {
// 	// 	...notes.U,
// 	// 	displayAftertimeSeconds: 11,
// 	// },
// 	// {
// 	// 	...notes.H,
// 	// 	displayAftertimeSeconds: 13,
// 	// },
// 	// {
// 	// 	...notes.J,
// 	// 	displayAftertimeSeconds: 15,
// 	// },
// 	// {
// 	// 	...notes.K,
// 	// 	displayAftertimeSeconds: 17,
// 	// },
// ];

const NoteCanvas: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const notesRef = useRef<fabric.Rect[]>([]);

	const { addNote, removeNote } = useNoteContext();

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = new fabric.StaticCanvas(canvasRef.current, {
				height: 300,
				width: 900,
			});

			const checkpoint = new fabric.Rect({
				left: 100,
				top: 300,
				opacity: 1,
				width: 900,
				height: 50,
				fill: "#000",
			});

			canvas.add(checkpoint);

			scrollingNotes.forEach((note) => {
				const whiteNoteProps: TOptions<RectProps> = {
					left: note.offset * 32 + 400,
					top: 0,
					fill: "white",
					width: 60,
					height: 50,
					strokeWidth: 1,
					stroke: "black",
					opacity: 0,
				};

				const blackNoteProps: TOptions<RectProps> = {
					left: note.offset * 32 + 393,
					top: 0,
					fill: "black",
					width: 40,
					height: 50,
					strokeWidth: 1,
					stroke: "black",
					opacity: 0,
				};

				const fabricNote = new fabric.Rect(note.type === NoteType.black ? blackNoteProps : whiteNoteProps);

				fabricNote.on("moving", () => {
					fabricNote.setCoords();
					canvas.renderAll();
				});

				fabricNote.animate(
					{
						top: 310,
					},
					{
						delay: note.displayAftertimeSeconds * 1000,
						duration: 6000,
						onStart: () => {
							fabricNote.opacity = 1;
						},
						onChange: () => {
							fabricNote.setCoords();
							canvas.renderAll();
							if (checkpoint.isOverlapping(fabricNote)) {
								addNote({ note: note.note, leftOffset: note.offset });
							}
						},
						onComplete: () => {
							canvas.remove(fabricNote);
							fabricNote.setCoords();
							fabricNote.dispose();
							notesRef.current = notesRef.current.filter((n) => n !== fabricNote);
							canvas.renderAll();
							removeNote(note.note);
						},
					},
				);

				canvas.add(fabricNote);
				notesRef.current.push(fabricNote);
			});

			return () => {
				canvas.dispose();
			};
		}
	}, []);

	return (
		<Box
			sx={{
				position: "relative",
				display: "flex",
				margin: "auto",
				justifyContent: "center",
				width: 900,
				height: 300,
				backgroundColor: "#eee",
			}}
		>
			<canvas ref={canvasRef} height={300} width={900} />
		</Box>
	);
};

export default NoteCanvas;
