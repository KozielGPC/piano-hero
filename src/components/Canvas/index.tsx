import { useEffect } from "react";
import * as fabric from "fabric";
import useContainerHandler from "./useContainerHandler";
import { useCanvasContext } from "../../context/CanvasContext";

export const Canvas = () => {
	const containerRef = useContainerHandler();
	const { setCanvas } = useCanvasContext();
	useEffect(() => {
		const initialHeigh = containerRef?.current?.clientHeight;
		const initialWidth = containerRef?.current?.clientWidth;

		const canvas = new fabric.Canvas("canvas", {
			backgroundColor: "#ecf0f1",
			height: initialHeigh,
			width: initialWidth,
		});

		setCanvas(canvas);
		const workarea = new fabric.Rect({
			//@ts-ignore
			id: "workarea",
			width: 600,
			height: 400,
			absolutePositioned: true,
			fill: "#ffffff",
			selectable: false,
			hoverCursor: "default",
		});
		canvas.add(workarea);

		return () => {
			canvas.dispose();
		};
	}, []);
	return (
		<div className="editor-canvas" ref={containerRef}>
			<canvas id="canvas"></canvas>
		</div>
	);
};
