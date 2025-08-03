import React, { useEffect } from "react";
import { Box, Typography, IconButton, Alert } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { notes } from "../../utils/constants";
import { IFallingNote } from "../PianoCanvas/types";
import { SongData } from "./types";
import { SongInformation } from "./components/SongInformation";
import { NotesList } from "./components/NotesList";
import { ExportControls } from "./components/ExportControls";
import { EditNoteDialog } from "./components/EditNoteDialog";
import { NoteSelection } from "./components/NoteSelection";
import { InteractiveGamePreview } from "./components/InteractiveGamePreview";
import { AudioUpload } from "./components/AudioUpload";
import { SongImport } from "./components/SongImport";
import { useSongFileHandler } from "../../hooks/useSongFileHandler";
import { useSongEditor } from "../../context/SongEditorContext";

interface SongEditorProps {
	onBack: () => void;
}

const SongEditor: React.FC<SongEditorProps> = ({ onBack }) => {
	const {
		songData,
		selectedNotes,
		error,
		success,
		actions: { setError, setSuccess, setSongData },
	} = useSongEditor();

	const {
		currentTime,
		isPlaying,
		audioFile,
		duration,
		waveformRef,
		actions: { handleFileUpload, togglePlayback, stopPlayback, skipTime, loadImportedAudioFile },
	} = useSongFileHandler({
		onError: (errorMessage: string) => {
			setError(errorMessage);
		},
		onSuccess: (successMessage: string) => {
			setSuccess(successMessage);
			setTimeout(() => setSuccess(""), 3000);
		},
	});

	useEffect(() => {
		setSongData((prev) => ({
			...prev,
			audioFile,
			duration,
		}));
	}, [audioFile, duration]);

	// Handle imported song data
	const handleImportSong = (importedSongData: SongData) => {
		setSongData(importedSongData);

		// If there's an audio file, load it properly with WaveSurfer initialization
		if (importedSongData.audioFile && importedSongData.duration) {
			loadImportedAudioFile(importedSongData.audioFile, importedSongData.duration);
		}
	};

	// Convert editor notes to the format expected by the shared piano canvas
	const fallingNotes: IFallingNote[] = songData.notes
		.flatMap((n) =>
			n.keys.map((k) => {
				const data = notes[k as keyof typeof notes];
				if (!data) return null;
				return {
					note: k,
					offset: data.offset,
					type: data.type,
					time: n.time,
					duration: n.duration,
				} as IFallingNote;
			}),
		)
		.filter(Boolean) as IFallingNote[];

	return (
		<Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
			<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
				<IconButton onClick={onBack} sx={{ mr: 2 }}>
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

			<SongImport onImportSong={handleImportSong} onError={setError} onSuccess={setSuccess} />

			<SongInformation />

			<AudioUpload
				songData={songData}
				handleFileUpload={handleFileUpload}
				togglePlayback={togglePlayback}
				skipTime={skipTime}
				currentTime={currentTime}
				waveformRef={waveformRef}
				isPlaying={isPlaying}
				stopPlayback={stopPlayback}
			/>

			<InteractiveGamePreview
				fallingNotes={fallingNotes}
				currentTime={currentTime}
				selectedNotes={selectedNotes}
			/>

			<NoteSelection />

			<NotesList />

			<ExportControls />

			<EditNoteDialog />
		</Box>
	);
};

export default SongEditor;
