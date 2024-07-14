import React, { createContext, useContext, useRef, useState } from "react";
import { IActiveNote, IScore } from "../utils/interfaces";

interface NoteContextType {
	activeNotes: IActiveNote[];
	score: IScore;
	addWrongNote: () => void;
	addCorrectNote: (note: string) => void;
	addNote: (input: IActiveNote) => void;
	removeNote: (noteToBeRemoved: string) => void;
	targetDivRef: React.RefObject<HTMLDivElement> | null;
}

const NoteContext = createContext<NoteContextType>({
	activeNotes: [],
	score: { correctNotes: 0, wrongNotes: 0 },
	addWrongNote: () => {},
	addCorrectNote: () => {},
	addNote: () => {},
	removeNote: () => {},
	targetDivRef: null,
});

export const NoteProvider = ({ children }: { children: React.ReactNode }) => {
	const targetDivRef = useRef<HTMLDivElement | null>(null);

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

	const addCorrectNote = (note: string) => {
		setScore((prevScore) => ({
			...prevScore,
			correctNotes: prevScore.correctNotes + 1,
		}));

		setActiveNotes((prevNotes) => {
			return prevNotes.filter((item) => item.note !== note);
		});
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
				targetDivRef,
			}}
		>
			{children}
		</NoteContext.Provider>
	);
};

export const useNoteContext = () => useContext(NoteContext);
