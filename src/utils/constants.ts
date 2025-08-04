export enum NoteType {
	white = "white",
	black = "black",
}

export const notes = {
	2: {
		offset: -13,
		note: "2",
		type: NoteType.black,
		fileName: "Db4.mp3",
	},
	Q: { offset: -14, note: "q", type: NoteType.white, fileName: "C4.mp3" },
	3: {
		offset: -11,
		note: "3",
		type: NoteType.black,
		fileName: "Eb4.mp3",
	},
	W: { offset: -12, note: "w", type: NoteType.white, fileName: "D4.mp3" },
	E: { offset: -10, note: "e", type: NoteType.white, fileName: "E4.mp3" },
	5: {
		offset: -7,
		note: "5",
		type: NoteType.black,
		fileName: "Gb4.mp3",
	},
	R: { offset: -8, note: "r", type: NoteType.white, fileName: "F4.mp3" },
	6: {
		offset: -5,
		note: "6",
		type: NoteType.black,
		fileName: "Ab4.mp3",
	},
	T: { offset: -6, note: "t", type: NoteType.white, fileName: "G4.mp3" },
	7: {
		offset: -3,
		note: "7",
		type: NoteType.black,
		fileName: "Bb4.mp3",
	},
	Y: { offset: -4, note: "y", type: NoteType.white, fileName: "A4.mp3" },
	U: { offset: -2, note: "u", type: NoteType.white, fileName: "B4.mp3" },

	S: {
		offset: 1,
		note: "s",
		type: NoteType.black,
		fileName: "Db5.mp3",
	},
	Z: { offset: 0, note: "z", type: NoteType.white, fileName: "C5.mp3" },
	D: {
		offset: 3,
		note: "d",
		type: NoteType.black,
		fileName: "Eb5.mp3",
	},
	X: { offset: 2, note: "x", type: NoteType.white, fileName: "D5.mp3" },
	C: { offset: 4, note: "c", type: NoteType.white, fileName: "E5.mp3" },
	G: {
		offset: 7,
		note: "g",
		type: NoteType.black,
		fileName: "Gb5.mp3",
	},
	V: { offset: 6, note: "v", type: NoteType.white, fileName: "F5.mp3" },
	H: {
		offset: 9,
		note: "h",
		type: NoteType.black,
		fileName: "Ab5.mp3",
	},
	B: { offset: 8, note: "b", type: NoteType.white, fileName: "G5.mp3" },
	J: {
		offset: 11,
		note: "j",
		type: NoteType.black,
		fileName: "Bb5.mp3",
	},
	N: { offset: 10, note: "n", type: NoteType.white, fileName: "A5.mp3" },
	M: { offset: 12, note: "m", type: NoteType.white, fileName: "B5.mp3" },
};
