import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, Alert } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import WaveSurfer from "wavesurfer.js";
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

interface SongEditorProps {
	onBack: () => void;
	onPlaySong: (songData: INotes[]) => void;
}

const SongEditor: React.FC<SongEditorProps> = ({ onBack, onPlaySong }) => {
	// No hook needed for activeKeys (module-level map)
	const [songData, setSongData] = useState<SongData>({
		name: "",
		artist: "",
		audioFile: null,
		duration: 0,
		notes: [],
	});
	const [currentTime, setCurrentTime] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
	const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");
	const [editingNote, setEditingNote] = useState<EditorNote | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [noteDuration, setNoteDuration] = useState(1);

	const waveformRef = useRef<HTMLDivElement>(null);
	const wavesurfer = useRef<WaveSurfer | null>(null);
	const lastTimeRef = useRef<number>(0);

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

	// Initialize WaveSurfer
	useEffect(() => {
		if (waveformRef.current && !wavesurfer.current) {
			wavesurfer.current = WaveSurfer.create({
				container: waveformRef.current,
				waveColor: "#4fc3f7",
				progressColor: "#29b6f6",
				cursorColor: "#ff5722",
				barWidth: 2,
				barRadius: 3,
				height: 60,
				normalize: true,
				backend: "WebAudio",
				interact: true,
			});

			// Event handlers for time updates and interactions
			wavesurfer.current.on("audioprocess", (time: number) => {
				setCurrentTime(time);
				lastTimeRef.current = time;
			});

			wavesurfer.current.on("click", (progress: number) => {
				const time = progress * songData.duration;
				setCurrentTime(time);
				lastTimeRef.current = time;
			});

			wavesurfer.current.on("play", () => {
				setIsPlaying(true);
			});

			wavesurfer.current.on("pause", () => {
				setIsPlaying(false);
			});

			wavesurfer.current.on("finish", () => {
				setIsPlaying(false);
				setCurrentTime(0);
			});

			wavesurfer.current.on("ready", () => {
				if (wavesurfer.current) {
					setSongData((prev) => ({
						...prev,
						duration: wavesurfer.current!.getDuration(),
					}));
				}
			});

			wavesurfer.current.on("error", (error: Error) => {
				setError(`Audio error: ${error.message}`);
				setIsPlaying(false);
			});
		}

		return () => {
			if (wavesurfer.current) {
				wavesurfer.current.destroy();
				wavesurfer.current = null;
			}
		};
	}, [songData.duration]);

	const seekToTime = (time: number) => {
		if (!wavesurfer.current || songData.duration === 0) return;

		// Clamp the time to valid range
		const clampedTime = Math.max(0, Math.min(songData.duration, time));

		// Calculate seek position as a percentage (0 to 1)
		const seekPosition = clampedTime / songData.duration;

		// Seek to the position
		wavesurfer.current.seekTo(seekPosition);

		// Update current time immediately for better UX
		setCurrentTime(clampedTime);
	};

	const handleSliderChange = (_event: Event | React.SyntheticEvent<Element, Event>, newValue: number | number[]) => {
		const time = Array.isArray(newValue) ? newValue[0] : newValue;
		seekToTime(time);
	};

	const skipTime = (seconds: number) => {
		const newTime = Math.max(0, Math.min(songData.duration, currentTime + seconds));
		seekToTime(newTime);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("audio/")) {
			setError("Please select a valid audio file");
			return;
		}

		setSongData((prev) => ({ ...prev, audioFile: file }));

		if (wavesurfer.current) {
			const url = URL.createObjectURL(file);
			wavesurfer.current.load(url);
		}

		setError("");
		setSuccess("Audio file loaded successfully!");
		setTimeout(() => setSuccess(""), 3000);
	};

	const togglePlayback = () => {
		if (!wavesurfer.current || !songData.audioFile) {
			setError("Please upload an audio file first");
			return;
		}

		if (isPlaying) {
			wavesurfer.current.pause();
		} else {
			wavesurfer.current.play();
		}
	};

	const stopPlayback = () => {
		if (!wavesurfer.current) return;
		wavesurfer.current.stop();
		setCurrentTime(0);
		setIsPlaying(false);
	};

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

	const deleteNote = (noteId: string) => {
		setSongData((prev) => ({
			...prev,
			notes: prev.notes.filter((note) => note.id !== noteId),
		}));
	};

	const exportSong = () => {
		if (!songData.name.trim()) {
			setError("Please enter a song name");
			return;
		}

		if (songData.notes.length === 0) {
			setError("Please add at least one note");
			return;
		}

		// Convert EditorNote format to export format
		// Each EditorNote can have multiple keys, so we need to create separate notes for each key
		const exportNotes: INotes[] = [];

		songData.notes.forEach((editorNote) => {
			editorNote.keys.forEach((key) => {
				const noteData = notes[key as keyof typeof notes];
				if (noteData) {
					exportNotes.push({
						note: key,
						offset: noteData.offset,
						type: noteData.type,
						displayAftertimeSeconds: editorNote.time,
					});
				}
			});
		});

		const exportData = {
			name: songData.name,
			artist: songData.artist,
			notes: exportNotes,
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${songData.name.replace(/\s+/g, "_")}.json`;
		a.click();
		URL.revokeObjectURL(url);

		setSuccess("Song exported successfully!");
		setTimeout(() => setSuccess(""), 3000);
	};

	const playSong = () => {
		if (!songData.name.trim()) {
			setError("Please enter a song name");
			return;
		}

		if (songData.notes.length === 0) {
			setError("Please add at least one note");
			return;
		}

		// Convert EditorNote format to INotes format
		// Each EditorNote can have multiple keys, so we need to create separate notes for each key
		const gameNotes: INotes[] = [];

		songData.notes.forEach((editorNote) => {
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

		onPlaySong(gameNotes);
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
				handleSliderChange={handleSliderChange}
				waveformRef={waveformRef}
				isPlaying={isPlaying}
				stopPlayback={stopPlayback}
			/>

			<InteractiveGamePreview
				fallingNotes={fallingNotes}
				currentTime={currentTime}
				selectedNotes={selectedNotes}
				addNote={addNote}
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

			<ExportControls songData={songData} exportSong={exportSong} playSong={playSong} />

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
