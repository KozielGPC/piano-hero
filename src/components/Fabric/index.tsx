import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
// import { useCanvasContext } from "../../context/CanvasContext";

const NoteCanvas: React.FC = () => {
	// const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = new fabric.Canvas(canvasRef.current);
			canvas.height = 400;
			canvas.width = 800;

			const note = new fabric.Rect({
				left: 100,
				top: 100,
				fill: "blue",
				width: 60,
				height: 50,
			});

			const note2 = new fabric.Rect({
				left: 200,
				top: 100,
				fill: "red",
				width: 60,
				height: 50,
			});

			const note3 = new fabric.Rect({
				left: 100,
				top: 200,
				opacity: 0.1,
				width: 600,
				height: 200,
			});
			

			note2.animate(
				{
					top: 300,
				},
				{
					duration: 3000,
					onChange: canvas.renderAll.bind(canvas),
					onComplete: () => console.log("completed"),
				}
			);

			canvas.add(note);
			canvas.add(note2);
			canvas.add(note3);

			const handleKeyDown = (event: KeyboardEvent) => {
				if (note3.isOverlapping(note2)) {
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

	return <canvas ref={canvasRef} />;
};

export default NoteCanvas;
