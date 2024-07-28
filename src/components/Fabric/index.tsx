import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { INotes } from "../../utils/interfaces";
import { NoteType, notes } from "../../utils/constants";
import { Box } from "@mui/material";
import { useNoteContext } from "../../context/NotesContext";
// import { useCanvasContext } from "../../context/CanvasContext";

const scrollingNotes: INotes[] = [
	// {
	// 	...notes.G,
	// 	displayAftertimeSeconds: 0,
	// },
	// {
	// 	...notes.D,
	// 	displayAftertimeSeconds: 1,
	// },
	{
		...notes.S,
		displayAftertimeSeconds: 3,
	},
	{
		...notes.F,
		displayAftertimeSeconds: 3,
	},
	// {
	// 	...notes.F,
	// 	displayAftertimeSeconds: 5,
	// },
	// {
	// 	...notes.T,
	// 	displayAftertimeSeconds: 7,
	// },
	// {
	// 	...notes.U,
	// 	displayAftertimeSeconds: 8,
	// },
];

const NoteCanvas: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const notesRef = useRef<fabric.Rect[]>([]);

	const { addNote, removeNote, targetDivRef } = useNoteContext();
	
	useEffect(() => {
		if (canvasRef.current) {
			const canvas = new fabric.StaticCanvas(canvasRef.current);
			canvas.height = 200;
			canvas.width = 800;

			const checkpoint = new fabric.Rect({
				left: 100,
				top: 190,
				opacity: 0.5,
				width: 800,
				height: 50,
				fill: "#eee",
			});

			canvas.add(checkpoint);

			scrollingNotes.forEach((note) => {
				const fabricNote = new fabric.Rect({
					left: note.offset * 32 + 550,
					top: 0,
					fill: note.type === NoteType.black ? "black" : "white",
					width: 60,
					height: 50,
					strokeWidth: 1,
					stroke: "black",
				});

				fabricNote.on("moving", () => {
					fabricNote.setCoords();
					canvas.renderAll();
				});

				fabricNote.animate(
					{
						top: 200,
					},
					{
						delay: note.displayAftertimeSeconds * 1000,
						duration: 3000,
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

			

			const handleKeyDown = () => {
				const isOverlapping = () => {
					let isOverlapping = false;
					notesRef.current.forEach((note) => {
						if (checkpoint.isOverlapping(note)) {
							isOverlapping = true;
						}
					});

					return isOverlapping;
				};

				if (isOverlapping()) {
					console.log("is overlapping");
				} else {
					console.log("is not overlapping");
				}
			};

			addEventListener("keydown", handleKeyDown);

			return () => {
				canvas.dispose();
				removeEventListener("keydown", handleKeyDown);
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
				width: "100%",
				height: 200,
				backgroundColor: "#eee"
			}}
		>
			<canvas ref={canvasRef} />
		</Box>
	);
};

export default NoteCanvas;
