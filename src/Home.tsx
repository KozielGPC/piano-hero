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
					backgroundColor: "gray",
					color: "white",
					display: "flex",
					flexDirection: "column",
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
						}}
					>
						<Typography variant="h1" sx={{ fontSize: "5rem" }}>
							<strong>Piano Hero</strong>
						</Typography>
						<Score />
					</Box>

					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							flexGrow: 1,
							padding: "2rem",
						}}
					>
						<Box
							sx={{
								width: "800px",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<NoteCanvas />
							<Piano />
						</Box>
					</Box>
				</NoteProvider>
			</Container>
		</>
	);
};
