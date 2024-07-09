import { Box } from "@mui/material";
import { useEffect } from "react";

interface IProps {
	note: string;
	type: string;
}

export const Key = ({ note, type }: IProps) => {
	const playSound = () => {
		const audio = new Audio(`/sounds/${note}.mp3`);
		audio.play();
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === note) {
				console.log(event.key);
				playSound();
			}
		};

		addEventListener("keydown", handleKeyDown);
		return () => {
			removeEventListener("keydown", handleKeyDown);
		};
	}, [note]);

	const isWhite = type === "white";
	const keyStyles = isWhite
		? {
				width: "60px",
				height: "150px",
				backgroundColor: "white",
				color: "black",
				border: "1px solid black",
		  }
		: {
				width: "40px",
				height: "100px",
				backgroundColor: "black",
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
		>
			{note}
		</Box>
	);
};
