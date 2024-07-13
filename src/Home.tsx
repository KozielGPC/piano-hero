import { Box, Container, CssBaseline, Typography } from "@mui/material";
import { Piano } from "./components/Piano";
import { NoteContainer } from "./components/NoteContainer";
import { NoteProvider } from "./context/NotesContext";

function App() {
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
						<NoteContainer />
						<Piano />
					</NoteProvider>
				</Box>
			</Container>
		</>
	);
}

export default App;
