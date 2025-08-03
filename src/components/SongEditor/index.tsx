import { Box, Typography, IconButton, Alert } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { SongInformation } from "./components/SongInformation";
import { NotesList } from "./components/NotesList";
import { ExportControls } from "./components/ExportControls";
import { EditNoteDialog } from "./components/EditNoteDialog";
import { NoteSelection } from "./components/NoteSelection";
import { InteractiveGamePreview } from "./components/InteractiveGamePreview";
import { AudioUpload } from "./components/AudioUpload";
import { SongImport } from "./components/SongImport";
import { useSongEditor } from "../../context/SongEditorContext";
import { useGame } from "../../context/GameContext";

const SongEditor = () => {
	const {
		error,
		success,
		actions: { setError, setSuccess },
	} = useSongEditor();

	const { actions: gameActions } = useGame();
	return (
		<Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
			<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
				<IconButton onClick={() => gameActions.setGameState("MENU")} sx={{ mr: 2 }}>
					<ArrowBack />
				</IconButton>
				<Typography variant="h4" component="h1" sx={{ color: "#FF8E53" }}>
					Song Editor
				</Typography>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
					{error}
				</Alert>
			)}

			{success && (
				<Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
					{success}
				</Alert>
			)}

			<SongImport />

			<SongInformation />

			<AudioUpload />

			<InteractiveGamePreview />

			<NoteSelection />

			<NotesList />

			<ExportControls />

			<EditNoteDialog />
		</Box>
	);
};

export default SongEditor;
