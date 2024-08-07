import { Box, Container, CssBaseline, Typography } from "@mui/material";
import { Piano } from "./components/Piano";
import { NoteProvider } from "./context/NotesContext";
import { Score } from "./components/Score";
import NoteCanvas from "./components/Fabric";

export const Home = () => {
	return (
		<>
			<CssBaseline />

			<Container
				sx={{
					textAlign: "center",
					backgroundColor: "gray",
					color: "white",
					height: "100vh",
				}}
				maxWidth={false}
				disableGutters
			>
				<Typography variant="h1" sx={{ fontSize: "5rem" }}>
					<strong>Piano Hero</strong>
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<NoteProvider>
						<Score />
						<NoteCanvas />
						<Piano />
					</NoteProvider>
				</Box>
			</Container>
		</>
	);
};
