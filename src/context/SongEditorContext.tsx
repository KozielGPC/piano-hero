import React, { createContext, useContext, useState } from "react";
import { EditorNote } from "../components/SongEditor/types";
import { SongData } from "../components/SongEditor/types";
import { notes, NoteType } from "../utils/constants";
import { IFallingNote } from "../components/PianoCanvas/types";

export interface SongEditorContextValue {
	songData: SongData;
	selectedNotes: string[];
	error: string;
	success: string;
	noteDuration: number;
	editingNote: EditorNote | null;
	editDialogOpen: boolean;
	actions: {
		addNote: (currentTime: number, time?: number) => void;
		addNoteAtKey: (key: string, time: number) => void;
		deleteNote: (noteId: string) => void;
		setEditingNote: React.Dispatch<React.SetStateAction<EditorNote | null>>;
		setEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
		setNoteDuration: React.Dispatch<React.SetStateAction<number>>;	
		updateNoteTime: (noteIndex: number, newTime: number, fallingNotes: IFallingNote[]) => void;
		updateNoteDuration: (noteIndex: number, newDuration: number, fallingNotes: IFallingNote[]) => void;
		setError: React.Dispatch<React.SetStateAction<string>>;
		setSuccess: React.Dispatch<React.SetStateAction<string>>;
		setSelectedNotes: React.Dispatch<React.SetStateAction<string[]>>;
		setSongData: React.Dispatch<React.SetStateAction<SongData>>;
	};
}

const SongEditorContext = createContext<SongEditorContextValue | undefined>(undefined);

const SongEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

	const addNote = (currentTime: number, time?: number) => {
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

    const updateNoteTime = (noteIndex: number, newTime: number, fallingNotes: IFallingNote[]) => {
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

    const updateNoteDuration = (noteIndex: number, newDuration: number, fallingNotes: IFallingNote[]) => {
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

	const contextValue: SongEditorContextValue = {
		songData,
		selectedNotes,
		error,
		success,
		noteDuration,
		editingNote,
		editDialogOpen,
		actions: {
			addNote,
			addNoteAtKey,
			deleteNote,
			setEditingNote,
			setEditDialogOpen,
			setNoteDuration,
			updateNoteTime,
			updateNoteDuration,
            setError,
            setSuccess,
            setSelectedNotes,
            setSongData,
		},
	};

	return <SongEditorContext.Provider value={contextValue}>{children}</SongEditorContext.Provider>;
};

const useSongEditor = () => {
	const ctx = useContext(SongEditorContext);
	if (!ctx) {
		throw new Error("useSongEditor must be used within a SongEditorProvider");
	}
	return ctx;
};

// eslint-disable-next-line react-refresh/only-export-components
export { SongEditorProvider, useSongEditor };
