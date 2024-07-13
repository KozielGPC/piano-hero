import React, { createContext, useContext, useState } from "react";
import { IActiveNote } from "../utils/interfaces";

interface NoteContextType {
	activeNotes: IActiveNote[];
	addNote: (input: IActiveNote) => void;
	removeNote: (noteToBeRemoved: string) => void;
}

const NoteContext = createContext<NoteContextType>({
	activeNotes: [],
	addNote: () => {},
	removeNote: () => {},
});

export const NoteProvider = ({ children }: { children: React.ReactNode }) => {
	const [activeNotes, setActiveNotes] = useState<IActiveNote[]>([]);

	const addNote = ({ note, leftOffset }: IActiveNote) => {
		setActiveNotes((prevNotes) => [...prevNotes, { note, leftOffset }]);
	};

	const removeNote = (noteToBeRemoved: string) => {
		setActiveNotes((prevNotes) => {
			return prevNotes.filter((note) => note.note !== noteToBeRemoved);
		});
	};

	return (
		<NoteContext.Provider value={{ activeNotes, addNote, removeNote }}>
			{children}
		</NoteContext.Provider>
	);
};

export const useNoteContext = () => useContext(NoteContext);
