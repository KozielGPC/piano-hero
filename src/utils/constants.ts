export enum NoteType {
	white = "white",
	black = "black",
}

export const notes = {
	W: {
		offset: -5.5,
		note: "w",
		type: NoteType.black,
		fileName: "do-sharp-C-sharp.mp3",
	},
	S: { offset: -7, note: "s", type: NoteType.white, fileName: "do-C.mp3" },
	E: {
		offset: -3.5,
		note: "e",
		type: NoteType.black,
		fileName: "re-sharp-D-sharp.mp3",
	},
	D: { offset: -5, note: "d", type: NoteType.white, fileName: "re-D.mp3" },
	F: { offset: -3, note: "f", type: NoteType.white, fileName: "mi-E.mp3" },
	T: {
		offset: 0.5,
		note: "t",
		type: NoteType.black,
		fileName: "fa-sharp-F-sharp.mp3",
	},
	G: { offset: -1, note: "g", type: NoteType.white, fileName: "fa-F.mp3" },
	I: {
		offset: 2.5,
		note: "i",
		type: NoteType.black,
		fileName: "sol-sharp-G-sharp.mp3",
	},
	H: { offset: 1, note: "h", type: NoteType.white, fileName: "sol-G.mp3" },
	U: {
		offset: 4.5,
		note: "u",
		type: NoteType.black,
		fileName: "la-sharp-A-sharp.mp3",
	},
	J: { offset: 3, note: "j", type: NoteType.white, fileName: "la-A.mp3" },
	K: { offset: 5, note: "k", type: NoteType.white, fileName: "si-B.mp3" },
};

export const keys = Object.values(notes);
