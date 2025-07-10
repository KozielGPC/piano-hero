import { Box } from "@mui/material";

interface IProps {
	children: React.ReactNode;
}

export const GameArea = ({ children }: IProps) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				margin: "auto",
				flexGrow: 1,
				width: "95%",
				maxWidth: "1200px",
				minHeight: "600px",
				background: "rgba(255, 255, 255, 0.95)",
				backdropFilter: "blur(20px)",
				marginTop: "2rem",
				marginBottom: "2rem",
				borderRadius: "20px",
				justifyContent: "center",
				alignItems: "center",
				border: "1px solid rgba(255, 255, 255, 0.2)",
				boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
				position: "relative",
				overflow: "hidden",
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
					pointerEvents: "none",
				},
			}}
		>
			{children}
		</Box>
	);
};
