import { NoteType } from "../../utils/constants";

export interface EditorNote {
	id: string;
	time: number;
	duration: number;
	keys: string[];
	note: string;
	offset: number;
	type: NoteType;
}

export interface SongData {
	name: string;
	artist: string;
	audioFile: File | null;
	duration: number;
	notes: EditorNote[];
}
