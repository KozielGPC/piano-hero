import { Box } from "@mui/material";
import { NoteType } from "../../utils/constants";
import { useEffect, useState } from "react";

interface IProps {
	note: string;
	leftOffset: number;
	type: NoteType;
	displayAftertimeSeconds: number;
}

export const ScrollingNote = ({
	note,
	leftOffset,
	type,
	displayAftertimeSeconds,
}: IProps) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const renderComponent = () => {
			setIsVisible(true);
		};

		const timeoutDisplay = setTimeout(
			renderComponent,
			displayAftertimeSeconds * 1000
		);

		const hideComponent = () => {
			setIsVisible(false);
		};

		const timeoutHide = setTimeout(
			hideComponent,
			(displayAftertimeSeconds + 2.8) * 1000
		);

		return () => {
			clearTimeout(timeoutDisplay);
			clearTimeout(timeoutHide);
		};
	}, []);

	const isWhite = type === NoteType.white;

	const keyStyles = isWhite
		? {
				position: "absolute",
				width: "60px",
				height: "150px",
				backgroundColor: "white",
				color: "black",
				border: "1px solid black",
				margin: "2px",
				marginLeft: `${leftOffset * 32}px`,
		  }
		: {
				width: "40px",
				height: "100px",
				backgroundColor: "black",
				color: "white",
				border: "1px solid black",
				margin: "2px",
				marginLeft: `${leftOffset * 20}px`,
				zIndex: "1",
		  };

	if (!isVisible) {
		return null;
	}
	return (
		<Box
			sx={{
				...keyStyles,
				position: "absolute",
				boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
				display: "flex",
				justifyContent: "center",
				animation: "scroll 3s linear infinite",
				"@keyframes scroll": {
					from: {
						top: 0,
					},
					to: {
						top: "100%",
					},
				},
			}}
		>
			{note}
		</Box>
	);
};
