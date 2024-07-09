import { Box } from "@mui/material";
import { Key } from "../Key";

export const Piano = () => {
	const keys = [
		{ note: "a", type: "white" },
		{ note: "w", type: "black" },
		{ note: "s", type: "white" },
		{ note: "e", type: "black" },
		{ note: "d", type: "white" },
		{ note: "f", type: "white" },
		{ note: "t", type: "black" },
		{ note: "g", type: "white" },
		{ note: "y", type: "black" },
		{ note: "h", type: "white" },
		{ note: "u", type: "black" },
		{ note: "j", type: "white" },
		{ note: "k", type: "white" },
	];

	return (
		<Box
			sx={{
				position: "relative",
				display: "flex",
				flexDirection: "row",
				margin: "auto",
				backgroundColor: "#333",
				justifyContent: "center",
				padding: "10px",
				borderRadius: "10px",
				boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
				width: "100%",
			}}
		>
			{keys.map((key, index) => (
				<Box key={index} sx={{ position: "relative" }}>
					<Key note={key.note} type={key.type} />
				</Box>
			))}
		</Box>
	);
};
