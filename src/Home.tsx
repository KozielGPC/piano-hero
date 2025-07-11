import { Container, CssBaseline } from "@mui/material";
import GameController from "./components/GameController";
import { GameArea } from "./components/GameArea";
import { Header } from "./components/Header";
import { GameProvider } from "./context/GameContext";

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
				<Header />

				<GameArea>
					<GameProvider>
						<GameController />
					</GameProvider>
				</GameArea>
			</Container>
		</>
	);
};
