import { NoteType } from "./constants";

export interface IActiveNote {
	note: string;
	leftOffset: number;
}

export interface IScore {
	correctNotes: number;
	wrongNotes: number;
}

export interface INotes {
	note: string;
	offset: number;
	type: NoteType;
	displayAftertimeSeconds: number;
}
