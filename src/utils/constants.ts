export enum NoteType {
	white = "white",
	black = "black",
}

export const keys = [
	{
		offset: 2,
		note: "w",
		type: NoteType.black,
		fileName: "do-sharp-C-sharp.mp3",
	},
	{ offset: 1, note: "s", type: NoteType.white, fileName: "do-C.mp3" },
	{
		offset: 4,
		note: "e",
		type: NoteType.black,
		fileName: "re-sharp-D-sharp.mp3",
	},
	{ offset: 3, note: "d", type: NoteType.white, fileName: "re-D.mp3" },
	{ offset: 5, note: "f", type: NoteType.white, fileName: "mi-E.mp3" },
	{
		offset: 7,
		note: "t",
		type: NoteType.black,
		fileName: "fa-sharp-F-sharp.mp3",
	},
	{ offset: 6, note: "g", type: NoteType.white, fileName: "fa-F.mp3" },
	{
		offset: 9,
		note: "i",
		type: NoteType.black,
		fileName: "sol-sharp-G-sharp.mp3",
	},
	{ offset: 8, note: "h", type: NoteType.white, fileName: "sol-G.mp3" },
	{
		offset: 11,
		note: "u",
		type: NoteType.black,
		fileName: "la-sharp-A-sharp.mp3",
	},
	{ offset: 10, note: "j", type: NoteType.white, fileName: "la-A.mp3" },
	{ offset: 12, note: "k", type: NoteType.white, fileName: "si-B.mp3" },
];
