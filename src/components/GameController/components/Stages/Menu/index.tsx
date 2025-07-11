import { Alert, Button, Card, Select, MenuItem } from "@mui/material";

import { Typography } from "@mui/material";

import { Box } from "@mui/material";
import { Upload } from "@mui/icons-material";
import { PlayArrow } from "@mui/icons-material";
import { Edit } from "@mui/icons-material";
import { useGame } from "../../../../../context/GameContext";

export const Menu = () => {
	const { selectedSongId, allSongs, isLoading, importError, importSuccess, error, actions } = useGame();

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
				padding: "2rem",
				textAlign: "center",
			}}
		>
			<Typography
				variant="h3"
				sx={{
					marginBottom: "3rem",
					color: "#333",
					fontWeight: "bold",
					textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
				}}
			>
				Choose Your Challenge
			</Typography>

			{/* Error and Success Messages */}
			{error && (
				<Alert
					severity="error"
					sx={{ mb: 2, width: "100%", maxWidth: 400 }}
					onClose={() => actions.setError("")}
				>
					{error}
				</Alert>
			)}

			{importError && (
				<Alert
					severity="error"
					sx={{ mb: 2, width: "100%", maxWidth: 400 }}
					onClose={() => actions.setImportError("")}
				>
					{importError}
				</Alert>
			)}

			{importSuccess && (
				<Alert
					severity="success"
					sx={{ mb: 2, width: "100%", maxWidth: 400 }}
					onClose={() => actions.setImportSuccess("")}
				>
					{importSuccess}
				</Alert>
			)}

			{/* Song Selection */}
			<Card
				elevation={6}
				sx={{
					padding: "2rem",
					marginBottom: "2rem",
					minWidth: "400px",
					backgroundColor: "rgba(255,255,255,0.9)",
				}}
			>
				<Typography variant="h6" sx={{ marginBottom: "1rem", color: "#555" }}>
					Select a Song
				</Typography>
				<Select
					value={selectedSongId}
					onChange={(e) => actions.handleSongSelect(e.target.value)}
					fullWidth
					sx={{ marginBottom: "1rem" }}
				>
					{Object.entries(allSongs).map(([id, song]) => (
						<MenuItem key={id} value={id}>
							{song.name} - {song.artist}
						</MenuItem>
					))}
				</Select>

				{/* JSON Import */}
				<Box sx={{ mt: 2, mb: 2 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						Or import a custom song:
					</Typography>
					<input
						type="file"
						accept=".json"
						onChange={actions.handleJSONImport}
						style={{ display: "none" }}
						id="json-upload"
					/>
					<label htmlFor="json-upload">
						<Button
							variant="outlined"
							component="span"
							startIcon={<Upload />}
							disabled={isLoading}
							fullWidth
						>
							Import Song JSON
						</Button>
					</label>
				</Box>

				<Button
					variant="contained"
					size="large"
					onClick={actions.startGame}
					disabled={!selectedSongId || isLoading}
					startIcon={<PlayArrow />}
					sx={{
						padding: "1rem 2rem",
						fontSize: "1.2rem",
						background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
						boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
						"&:hover": {
							background: "linear-gradient(45deg, #FE8B8B 30%, #FFAE53 90%)",
						},
					}}
				>
					Start Game
				</Button>
			</Card>

			{/* Song Editor Button */}
			<Button
				variant="outlined"
				size="large"
				onClick={() => actions.setGameState("SONG_EDITOR")}
				startIcon={<Edit />}
				sx={{
					padding: "1rem 2rem",
					fontSize: "1.1rem",
					marginBottom: "1rem",
					borderColor: "#FF8E53",
					color: "#FF8E53",
					"&:hover": {
						borderColor: "#FE6B8B",
						backgroundColor: "rgba(254, 107, 139, 0.1)",
					},
				}}
			>
				Song Editor
			</Button>

			{/* Instructions */}
			<Typography variant="body1" sx={{ marginTop: "1rem", color: "#666", maxWidth: "600px" }}>
				Use your keyboard to play the falling notes! Match the timing and build your combo for a higher score.
			</Typography>
		</Box>
	);
};
