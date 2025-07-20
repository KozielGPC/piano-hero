import { notes } from "../utils/constants";
import { INotes } from "../utils/interfaces";
import { EditorNote, SongData } from "../components/SongEditor/types";

interface UseSongExportProps {
	onError: (message: string) => void;
	onSuccess: (message: string) => void;
}

interface UseSongExportReturn {
	exportSong: (songData: SongData) => Promise<void>;
	validateSongForExport: (songData: SongData) => { isValid: boolean; error?: string };
	convertEditorNotesToGameFormat: (editorNotes: EditorNote[]) => INotes[];
	playSong: (songData: SongData, onPlaySong: (gameNotes: INotes[], audioUrl?: string) => void) => void;
}

export const useSongExport = ({ onError, onSuccess }: UseSongExportProps): UseSongExportReturn => {
	const validateSongForExport = (songData: SongData): { isValid: boolean; error?: string } => {
		if (!songData.name.trim()) {
			return { isValid: false, error: "Please enter a song name" };
		}

		if (songData.notes.length === 0) {
			return { isValid: false, error: "Please add at least one note" };
		}

		if (!songData.audioFile) {
			return { isValid: false, error: "Please upload an audio file to export" };
		}

		return { isValid: true };
	};

	const convertEditorNotesToGameFormat = (editorNotes: EditorNote[]): INotes[] => {
		const gameNotes: INotes[] = [];

		editorNotes.forEach((editorNote) => {
			editorNote.keys.forEach((key) => {
				const noteData = notes[key as keyof typeof notes];
				if (noteData) {
					gameNotes.push({
						note: key,
						offset: noteData.offset,
						type: noteData.type,
						displayAftertimeSeconds: editorNote.time,
					});
				}
			});
		});

		return gameNotes;
	};

	const downloadJsonFile = (data: Record<string, unknown>, filename: string) => {
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${filename.replace(/\s+/g, "_")}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const convertAudioToBase64 = (audioFile: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === 'string') {
					resolve(reader.result);
				} else {
					reject(new Error('Failed to convert audio to base64'));
				}
			};
			reader.onerror = () => reject(new Error('Failed to read audio file'));
			reader.readAsDataURL(audioFile);
		});
	};

	const exportSong = async (songData: SongData) => {
		const validation = validateSongForExport(songData);

		if (!validation.isValid) {
			onError(validation.error!);
			return;
		}

		try {
			const exportNotes = convertEditorNotesToGameFormat(songData.notes);
			
			// Convert audio file to base64
			const audioBase64 = await convertAudioToBase64(songData.audioFile!);

			const exportData = {
				name: songData.name,
				artist: songData.artist,
				notes: exportNotes,
				audioUrl: audioBase64,
				audioDuration: songData.duration,
				audioFileName: songData.audioFile!.name,
				audioType: songData.audioFile!.type,
			};

			downloadJsonFile(exportData, songData.name);
			onSuccess("Song with audio exported successfully!");
		} catch (error) {
			console.error("Error exporting song:", error);
			onError("Failed to export song. Please try again.");
		}
	};

	const playSong = (songData: SongData, onPlaySong: (gameNotes: INotes[], audioUrl?: string) => void) => {
		// For play, we only need basic validation (not requiring audio file)
		if (!songData.name.trim()) {
			onError("Please enter a song name");
			return;
		}

		if (songData.notes.length === 0) {
			onError("Please add at least one note");
			return;
		}

		try {
			const gameNotes = convertEditorNotesToGameFormat(songData.notes);
			const audioUrl = songData.audioFile ? URL.createObjectURL(songData.audioFile) : undefined;
			onPlaySong(gameNotes, audioUrl);
		} catch (error) {
			console.error("Error preparing song for play:", error);
			onError("Failed to prepare song for play. Please try again.");
		}
	};

	return {
		exportSong,
		validateSongForExport,
		convertEditorNotesToGameFormat,
		playSong,
	};
};
