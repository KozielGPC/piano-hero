import { Box } from "@mui/material";

interface IProps {
	note: string;
}

export const ScrollingNote = ({ note }: IProps) => {
	return (
		<Box
			sx={{
				position: "absolute",
				top: 0,
				width: "40px",
				height: "40px",
				backgroundColor: "yellow",
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
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
