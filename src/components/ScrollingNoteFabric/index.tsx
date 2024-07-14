import { useEffect } from "react";
import * as fabric from "fabric";
import { useCanvasContext } from "../../context/CanvasContext";

export const ScrollingNoteFabric = () => {
	const { canvas } = useCanvasContext();

	useEffect(() => {
		if (canvas) {
			const noteBlue = new fabric.Rect({
				left: 500,
				top: 500,
				fill: "blue",
				width: 20,
				height: 20,
			});
			console.log("adding note");

			canvas.add(noteBlue);
		}
	}, [canvas]);

	// const [isVisible, setIsVisible] = useState(false);

	// const { addNote, removeNote } = useNoteContext();

	// useEffect(() => {
	// 	const renderComponent = () => {
	// 		setIsVisible(true);
	// 	};

	// 	const timeoutDisplay = setTimeout(
	// 		renderComponent,
	// 		displayAftertimeSeconds * 1000
	// 	);

	// 	const hideComponent = () => {
	// 		setIsVisible(false);
	// 	};

	// 	const timeoutHide = setTimeout(() => {
	// 		removeNote(note);
	// 		hideComponent();
	// 	}, (displayAftertimeSeconds + 2.8) * 1000);

	// 	const timeoutClick = setTimeout(() => {
	// 		addNote({ note, leftOffset });
	// 	}, (displayAftertimeSeconds + 2.3) * 1000);

	// 	return () => {
	// 		clearTimeout(timeoutDisplay);
	// 		clearTimeout(timeoutHide);
	// 		clearTimeout(timeoutClick);
	// 	};
	// }, []);

	// const isWhite = type === NoteType.white;

	// const keyStyles = isWhite
	// 	? {
	// 			position: "absolute",
	// 			width: "60px",
	// 			height: "50px",
	// 			backgroundColor: "white",
	// 			color: "black",
	// 			border: "1px solid black",
	// 			margin: "2px",
	// 			marginLeft: `${leftOffset * 32}px`,
	// 	  }
	// 	: {
	// 			width: "40px",
	// 			height: "50px",
	// 			backgroundColor: "black",
	// 			color: "white",
	// 			border: "1px solid black",
	// 			margin: "2px",
	// 			marginLeft: `${leftOffset * 20}px`,
	// 			zIndex: "1",
	// 	  };

	// if (!isVisible) {
	// 	return null;
	// }
	// return (
	// 	<Box
	// 		sx={{
	// 			...keyStyles,
	// 			position: "absolute",
	// 			boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
	// 			display: "flex",
	// 			justifyContent: "center",
	// 			animation: "scroll 3s linear infinite",
	// 			"@keyframes scroll": {
	// 				from: {
	// 					top: 0,
	// 				},
	// 				to: {
	// 					top: "100%",
	// 				},
	// 			},
	// 		}}
	// 	>
	// 		{note}
	// 	</Box>
	// );
	return null;
};
