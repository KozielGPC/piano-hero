import { Box, Typography } from "@mui/material";

export const Header = () => {
	return (
		<Box
			sx={{
				width: "100%",
				textAlign: "center",
				padding: "2rem",
				background: "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)",
				backdropFilter: "blur(10px)",
				borderBottom: "2px solid rgba(255,255,255,0.1)",
				boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
			}}
		>
			<Typography
				variant="h1"
				sx={{
					fontSize: { xs: "2.5rem", md: "4rem" },
					fontWeight: 800,
					background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
					backgroundClip: "text",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					textShadow: "0 2px 10px rgba(0,0,0,0.3)",
					letterSpacing: "2px",
				}}
			>
				Piano Hero
			</Typography>
			<Typography
				variant="h6"
				sx={{
					opacity: 0.9,
					marginTop: "0.5rem",
					fontWeight: 300,
					letterSpacing: "1px",
				}}
			>
				Master the keys, feel the rhythm
			</Typography>
		</Box>
	);
};
