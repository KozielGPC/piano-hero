import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Alert } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { notes, NoteType } from "../../utils/constants";
import { IFallingNote } from "../PianoCanvas/types";
import { INotes } from "../../utils/interfaces";
import { EditorNote, SongData } from "./types";
import { SongInformation } from "./components/SongInformation";
import { NotesList } from "./components/NotesList";
import { ExportControls } from "./components/ExportControls";
import { EditNoteDialog } from "./components/EditNoteDialog";
import { NoteSelection } from "./components/NoteSelection";
import { InteractiveGamePreview } from "./components/InteractiveGamePreview";
import { AudioUpload } from "./components/AudioUpload";
import { useSongFileHandler } from "../../hooks/useSongFileHandler";
import { useSongExport } from "../../hooks/useSongExport";

interface SongEditorProps {
	onBack: () => void;
	onPlaySong: (songData: INotes[], audioUrl?: string) => void;
}

const SongEditor: React.FC<SongEditorProps> = ({ onBack, onPlaySong }) => {
	const [songData, setSongData] = useState<SongData>({
		name: "",
		artist: "",
		audioFile: null,
		duration: 0,
		notes: [],
	});
	const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
	const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");
	const [editingNote, setEditingNote] = useState<EditorNote | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [noteDuration, setNoteDuration] = useState(1);

	const {
		currentTime,
		isPlaying,
		audioFile,
		duration,
		waveformRef,
		actions: { handleFileUpload, togglePlayback, stopPlayback, skipTime },
	} = useSongFileHandler({
		onError: (errorMessage: string) => {
			setError(errorMessage);
		},
		onSuccess: (successMessage: string) => {
			setSuccess(successMessage);
			setTimeout(() => setSuccess(""), 3000);
		},
	});

	const { exportSong, playSong } = useSongExport({
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

	const addNote = (time?: number) => {
		if (selectedNotes.length === 0) {
			setError("Please select at least one note to add");
			return;
		}

		const noteTime = time !== undefined ? time : currentTime;
		const newNote: EditorNote = {
			id: Date.now().toString(),
			time: noteTime,
			duration: noteDuration,
			keys: selectedNotes,
			note: selectedNotes[0], // Use first selected note as primary
			offset: notes[selectedNotes[0] as keyof typeof notes]?.offset || 0,
			type: notes[selectedNotes[0] as keyof typeof notes]?.type || NoteType.white,
		};

		setSongData((prev) => ({
			...prev,
			notes: [...prev.notes, newNote].sort((a, b) => a.time - b.time),
		}));

		setSuccess(`Note added at ${noteTime.toFixed(2)}s`);
		setTimeout(() => setSuccess(""), 2000);
	};

	const addNoteAtKey = (key: string, time: number) => {
		const noteData = notes[key as keyof typeof notes];
		if (!noteData) {
			setError(`Invalid note key: ${key}`);
			return;
		}

		const newNote: EditorNote = {
			id: Date.now().toString(),
			time: time,
			duration: noteDuration,
			keys: [key],
			note: key,
			offset: noteData.offset,
			type: noteData.type,
		};

		setSongData((prev) => ({
			...prev,
			notes: [...prev.notes, newNote].sort((a, b) => a.time - b.time),
		}));
	};

	const deleteNote = (noteId: string) => {
		setSongData((prev) => ({
			...prev,
			notes: prev.notes.filter((note) => note.id !== noteId),
		}));
	};

	const updateNoteTime = (noteIndex: number, newTime: number) => {
		const fallingNoteIndex = noteIndex;
		if (fallingNoteIndex < 0 || fallingNoteIndex >= fallingNotes.length) return;

		// Find the corresponding editor note
		const fallingNote = fallingNotes[fallingNoteIndex];
		const editorNoteIndex = songData.notes.findIndex(note => 
			note.time === fallingNote.time && 
			note.keys.includes(fallingNote.note)
		);

		if (editorNoteIndex === -1) return;

		setSongData((prev) => {
			const newNotes = [...prev.notes];
			newNotes[editorNoteIndex] = {
				...newNotes[editorNoteIndex],
				time: newTime
			};
			// Sort notes by time after updating
			newNotes.sort((a, b) => a.time - b.time);
			return {
				...prev,
				notes: newNotes,
			};
		});

		// No success message for drag operations - visual feedback is sufficient
	};

	const updateNoteDuration = (noteIndex: number, newDuration: number) => {
		const fallingNoteIndex = noteIndex;
		if (fallingNoteIndex < 0 || fallingNoteIndex >= fallingNotes.length) return;

		// Find the corresponding editor note
		const fallingNote = fallingNotes[fallingNoteIndex];
		const editorNoteIndex = songData.notes.findIndex(note => 
			note.time === fallingNote.time && 
			note.keys.includes(fallingNote.note)
		);

		if (editorNoteIndex === -1) return;

		setSongData((prev) => {
			const newNotes = [...prev.notes];
			newNotes[editorNoteIndex] = {
				...newNotes[editorNoteIndex],
				duration: newDuration
			};
			return {
				...prev,
				notes: newNotes,
			};
		});

		// No success message for drag operations - visual feedback is sufficient
	};

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

			<SongInformation songData={songData} setSongData={setSongData} />

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
				addNote={addNote}
				onAddNoteAtKey={addNoteAtKey}
				onUpdateNoteTime={updateNoteTime}
				onUpdateNoteDuration={updateNoteDuration}
			/>

			<NoteSelection
				selectedNotes={selectedNotes}
				setSelectedNotes={setSelectedNotes}
				noteDuration={noteDuration}
				setNoteDuration={setNoteDuration}
				addNote={addNote}
			/>

			<NotesList
				songData={songData}
				setEditingNote={setEditingNote}
				setEditDialogOpen={setEditDialogOpen}
				deleteNote={deleteNote}
			/>

			<ExportControls songData={songData} exportSong={exportSong} playSong={playSong} onPlaySong={onPlaySong} />

			<EditNoteDialog
				editDialogOpen={editDialogOpen}
				setEditDialogOpen={setEditDialogOpen}
				editingNote={editingNote}
				setEditingNote={setEditingNote}
				setSongData={setSongData}
			/>
		</Box>
	);
};

export default SongEditor;
