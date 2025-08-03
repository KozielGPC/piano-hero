import React, { useRef } from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";
import { Upload } from "@mui/icons-material";
import { SongData, EditorNote } from "../../types";
import { notes, NoteType } from "../../../../utils/constants";
import { INotes } from "../../../../utils/interfaces";
import { useSongEditor } from "../../../../context/SongEditorContext";
import { useSongFileHandler } from "../../../../context/SongFileHandlerContext";

interface ExportedSongData {
	name: string;
	artist: string;
	notes: INotes[];
	audioUrl?: string; // Base64 encoded audio
	audioDuration?: number;
	audioFileName?: string;
	audioType?: string;
}

export const SongImport = () => {
	const {
		actions: { setError, setSuccess, setSongData },
	} = useSongEditor();

	const {
		actions: { loadImportedAudioFile },
	} = useSongFileHandler();

	const handleImportSong = (importedSongData: SongData) => {
		setSongData(importedSongData);

		// If there's an audio file, load it properly with WaveSurfer initialization
		if (importedSongData.audioFile && importedSongData.duration) {
			loadImportedAudioFile(importedSongData.audioFile, importedSongData.duration);
		}
	};

	const fileInputRef = useRef<HTMLInputElement>(null);

	const convertGameNotesToEditorFormat = (gameNotes: INotes[]): EditorNote[] => {
		// Group notes by time to handle multiple keys at the same time
		const notesByTime = new Map<number, { keys: string[]; duration: number }>();

		gameNotes.forEach((note) => {
			const time = note.displayAftertimeSeconds;
			if (!notesByTime.has(time)) {
				notesByTime.set(time, { keys: [], duration: note.duration || 1 });
			}
			notesByTime.get(time)!.keys.push(note.note);
			// Use the maximum duration if multiple notes at the same time have different durations
			if (note.duration && note.duration > notesByTime.get(time)!.duration) {
				notesByTime.get(time)!.duration = note.duration;
			}
		});

		// Convert grouped notes to editor format
		const editorNotes: EditorNote[] = [];
		notesByTime.forEach(({ keys, duration }, time) => {
			// Use the first key's data for offset and type
			const primaryKey = keys[0];
			const noteData = notes[primaryKey as keyof typeof notes];

			editorNotes.push({
				id: `imported_${time}_${keys.join("_")}`,
				time: time,
				duration: duration, // Use imported duration instead of hardcoded 1
				keys: keys,
				note: primaryKey,
				offset: noteData?.offset || 0,
				type: noteData?.type || NoteType.white,
			});
		});

		return editorNotes.sort((a, b) => a.time - b.time);
	};

	const base64ToAudioFile = async (base64Data: string, fileName: string, mimeType: string): Promise<File> => {
		try {
			// Handle data URLs (data:audio/mp3;base64,xxx)
			const base64String = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

			// Convert base64 to blob
			const byteCharacters = atob(base64String);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: mimeType });

			// Create file from blob
			return new File([blob], fileName, { type: mimeType });
		} catch (error) {
			throw new Error(
				`Failed to convert audio data: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Clear the input so the same file can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}

		if (!file.name.endsWith(".json")) {
			setError("Please select a valid JSON file");
			return;
		}

		try {
			const fileContent = await file.text();
			const exportedData: ExportedSongData = JSON.parse(fileContent);

			// Validate required fields
			if (!exportedData.name || !Array.isArray(exportedData.notes)) {
				throw new Error("Invalid song file format: missing name or notes");
			}

			// Convert notes to editor format
			const editorNotes = convertGameNotesToEditorFormat(exportedData.notes);

			// Prepare audio file if present
			let audioFile: File | null = null;
			let duration = 0;

			if (exportedData.audioUrl && exportedData.audioFileName && exportedData.audioType) {
				try {
					audioFile = await base64ToAudioFile(
						exportedData.audioUrl,
						exportedData.audioFileName,
						exportedData.audioType,
					);
					duration = exportedData.audioDuration || 0;
					console.log("Audio file restored successfully:", exportedData.audioFileName);
				} catch (audioError) {
					console.warn("Failed to restore audio file:", audioError);
					// Don't throw error here, just continue without audio
					setError(
						"Song imported successfully, but audio file could not be restored. You can upload the audio file manually.",
					);
				}
			} else if (exportedData.audioUrl) {
				console.warn("Audio data found but missing metadata (fileName or type)");
			}

			// Create song data for editor
			const songData: SongData = {
				name: exportedData.name,
				artist: exportedData.artist || "",
				audioFile: audioFile,
				duration: duration,
				notes: editorNotes,
			};

			handleImportSong(songData);

			if (audioFile) {
				setSuccess(
					`Successfully imported "${exportedData.name}" with ${editorNotes.length} notes and audio file`,
				);
			} else {
				setSuccess(
					`Successfully imported "${exportedData.name}" with ${editorNotes.length} notes (no audio file included)`,
				);
			}
		} catch (error) {
			console.error("Import error:", error);
			setError(error instanceof Error ? error.message : "Failed to import song file");
		}
	};

	return (
		<Card elevation={3} sx={{ mb: 3 }}>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Import Song
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Import a previously exported song file to continue editing. This will load the song data, notes, and
					audio file (if available).
				</Typography>
				<Stack direction="row" spacing={2} alignItems="center">
					<input
						type="file"
						accept=".json"
						onChange={handleFileImport}
						style={{ display: "none" }}
						id="song-import"
						ref={fileInputRef}
					/>
					<label htmlFor="song-import">
						<Button variant="outlined" component="span" startIcon={<Upload />}>
							Import Song File
						</Button>
					</label>
					<Typography variant="body2" color="text.secondary">
						Select a .json file exported from this editor
					</Typography>
				</Stack>
			</CardContent>
		</Card>
	);
};
