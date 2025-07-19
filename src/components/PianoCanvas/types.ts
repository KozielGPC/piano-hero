import { NoteType } from "../../utils/constants";

export interface IFallingNote {
	note: string;
	offset: number;
	type: NoteType;
	time: number; // displayAftertimeSeconds or editor time
	duration: number;
}

export type ActiveKeys = Map<string, { expiry: number; color: string; label: string }>;