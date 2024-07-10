import { Box } from "@mui/material";
import { Key } from "../Key";
import { keys } from "../../components/Piano/keys";

export const Piano = () => {
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
					<Key note={key.note} type={key.type} fileName={key.fileName} />
				</Box>
			))}
		</Box>
	);
};
