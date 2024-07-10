import { Box } from "@mui/material";
import { NoteType } from "../../utils/constants";

interface IProps {
	note: string;
	leftOffset: number;
	type: NoteType;
}

export const ScrollingNote = ({ note, leftOffset, type }: IProps) => {
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
				// position: "absolute",
				// top: "0px",
				margin: "2px",
				marginLeft: `${leftOffset * 20}px`,
				zIndex: "1",
		  };

	return (
		<Box
			sx={{
				...keyStyles,
				position: "absolute",
				// backgroundColor: "yellow",
				boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
				// borderRadius: "50%",
				display: "flex",
				justifyContent: "center",
				animation: "scroll 5s linear infinite",
				// fontSize: "20px",
				// color: "black",
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
