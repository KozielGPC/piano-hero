import { Box, Container, CssBaseline, Typography } from "@mui/material";
import { NoteProvider } from "./context/NotesContext";
import GameController from "./components/GameController";

export const Home = () => {
	return (
		<>
			<CssBaseline />

			<Container
				sx={{
					backgroundColor: "gray",
					color: "white",
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
				}}
				maxWidth={false}
				disableGutters
			>
				<NoteProvider>
					<Box
						sx={{
							width: "100%",
							textAlign: "center",
							padding: "1rem",
							backgroundColor: "black",
							height: "5%",
						}}
					>
						<Typography variant="h1" sx={{ fontSize: "3rem" }}>
							<strong>Piano Hero</strong>
						</Typography>
					</Box>

					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							margin: "auto",
							flexGrow: 1,
							minWidth: "800px",
							minHeight: "500px",
							backgroundColor: "white",
							marginTop: "2rem",
							marginBottom: "2rem",
							borderRadius: "10px",
							justifyContent: "center",
							alignItems: "center",
							border: "2px solid black",
						}}
					>
						<GameController />
					</Box>
				</NoteProvider>
			</Container>
		</>
	);
};
