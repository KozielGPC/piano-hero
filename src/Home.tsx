import { Box, Container, CssBaseline, Typography } from "@mui/material";
import { Piano } from "./components/Piano";

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
				{/* <Box sx={{ my: 4, backgroundColor: "white", color: "black" }}> */}
				<Piano />
				{/* </Box> */}
			</Container>
		</>
	);
}

export default App;
