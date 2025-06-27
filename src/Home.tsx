import { Box, Container, CssBaseline, Typography } from "@mui/material";
import { NoteProvider } from "./context/NotesContext";
import GameController from "./components/GameController";

export const Home = () => {
	return (
		<>
			<CssBaseline />

			<Container
				sx={{
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					color: "white",
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					overflow: "hidden",
				}}
				maxWidth={false}
				disableGutters
			>
				<NoteProvider>
					{/* Header Section */}
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
								letterSpacing: "1px"
							}}
						>
							Master the keys, feel the rhythm
						</Typography>
					</Box>

					{/* Game Area */}
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
							}
						}}
					>
						<GameController />
					</Box>
				</NoteProvider>
			</Container>
		</>
	);
};
