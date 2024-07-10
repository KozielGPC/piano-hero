import { Box } from "@mui/material";

interface IProps {
	note: string;
	leftOffset: number;
}

export const ScrollingNote = ({ note, leftOffset }: IProps) => {
	return (
		<Box
			sx={{
				position: "absolute",
				top: "50px",
				width: "30px",
				height: "30px",
				backgroundColor: "yellow",
				left: `${leftOffset}px`,
				marginLeft: "485px",
				borderRadius: "50%",
				display: "flex",
				justifyContent: "center",
				animation: "scroll 5s linear infinite",
				fontSize: "20px",
				color: "black",
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
