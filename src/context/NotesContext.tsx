import React, { createContext, useContext, useState } from "react";
import { IActiveNote, IScore } from "../utils/interfaces";

interface NoteContextType {
	activeNotes: IActiveNote[];
	score: IScore;
	addWrongNote: () => void;
	addCorrectNote: () => void;
	addNote: (input: IActiveNote) => void;
	removeNote: (noteToBeRemoved: string) => void;
}

const NoteContext = createContext<NoteContextType>({
	activeNotes: [],
	score: { correctNotes: 0, wrongNotes: 0 },
	addWrongNote: () => {},
	addCorrectNote: () => {},
	addNote: () => {},
	removeNote: () => {},
});

export const NoteProvider = ({ children }: { children: React.ReactNode }) => {
	const [activeNotes, setActiveNotes] = useState<IActiveNote[]>([]);
	const [score, setScore] = useState<IScore>({
		correctNotes: 0,
		wrongNotes: 0,
	});

	const addNote = ({ note, leftOffset }: IActiveNote) => {
		setActiveNotes((prevNotes) => [...prevNotes, { note, leftOffset }]);
	};

	const removeNote = (noteToBeRemoved: string) => {
		setActiveNotes((prevNotes) => {
			return prevNotes.filter((note) => note.note !== noteToBeRemoved);
		});
	};

	const addWrongNote = () => {
		setScore((prevScore) => ({
			...prevScore,
			wrongNotes: prevScore.wrongNotes + 1,
		}));
	};

	const addCorrectNote = () => {
		setScore((prevScore) => ({
			...prevScore,
			correctNotes: prevScore.correctNotes + 1,
		}));
	};

	return (
		<NoteContext.Provider
			value={{
				activeNotes,
				addNote,
				removeNote,
				score,
				addWrongNote,
				addCorrectNote,
			}}
		>
			{children}
		</NoteContext.Provider>
	);
};

export const useNoteContext = () => useContext(NoteContext);