import { IMidiData, INotes } from "./interfaces";

export enum NoteType {
	white = "white",
	black = "black",
}

export const notes = {
	Qb: {
		offset: -13,
		note: "2",
		type: NoteType.black,
		fileName: "Db4.mp3",
	},
	Q: { offset: -14, note: "q", type: NoteType.white, fileName: "C4.mp3" },
	Wb: {
		offset: -11,
		note: "3",
		type: NoteType.black,
		fileName: "Eb4.mp3",
	},
	W: { offset: -12, note: "w", type: NoteType.white, fileName: "D4.mp3" },
	E: { offset: -10, note: "e", type: NoteType.white, fileName: "E4.mp3" },
	Rb: {
		offset: -7,
		note: "4",
		type: NoteType.black,
		fileName: "Gb4.mp3",
	},
	R: { offset: -8, note: "r", type: NoteType.white, fileName: "F4.mp3" },
	Tb: {
		offset: -5,
		note: "5",
		type: NoteType.black,
		fileName: "Ab4.mp3",
	},
	T: { offset: -6, note: "t", type: NoteType.white, fileName: "G4.mp3" },
	Ub: {
		offset: -3,
		note: "6",
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

export const keys = Object.values(notes);

const noteMapping = {
	48: notes.Q,   // C3
	49: notes.Qb,  // C#3
	50: notes.W,   // D3
	51: notes.Wb,  // D#3
	52: notes.E,   // E3
	53: notes.R,   // F3
	54: notes.Rb,  // F#3
	55: notes.T,   // G3
	56: notes.Tb,  // G#3
	57: notes.Y,   // A3
	58: notes.Ub,  // A#3
	59: notes.U,   // B3
	60: notes.Z,   // C4
	61: notes.S,   // C#4
	62: notes.X,   // D4
	63: notes.D,   // D#4
	64: notes.C,   // E4
	65: notes.V,   // F4
	66: notes.G,   // F#4
	67: notes.B,   // G4
	68: notes.H,   // G#4
	69: notes.N,   // A4
	70: notes.J,   // A#4
	71: notes.M,   // B4
};


export function generateScrollingNotes(json: IMidiData) {
	const scrollingNotes: INotes[] = [];
	const { tracks } = json;
	let currentTime = 0;

	tracks.forEach((track) => {
		track.notes.forEach((note) => {
			// @ts-expect-error TODO
			const mappedNote = noteMapping[note.midi];
			if (mappedNote) {
				const displayAftertimeSeconds = note.duration + currentTime;
				currentTime += note.duration;

				scrollingNotes.push({
					...mappedNote,
					displayAftertimeSeconds,
				});
			}
		});
	});

	return scrollingNotes;
}

export const musicJson: IMidiData = {
	header: {
		keySignatures: [],
		meta: [],
		name: "",
		ppq: 96,
		tempos: [
			{
				bpm: 140.00014000014,
				ticks: 0,
			},
		],
		timeSignatures: [],
	},
	tracks: [
		{
			channel: 0,
			instrument: {
				family: "piano",
				number: 0,
				name: "acoustic grand piano",
			},
			name: "reFX Nexus (MIDI)",
			notes: [
				{
					duration: 3.42410371875,
					durationTicks: 767,
					midi: 60,
					name: "C4",
					ticks: 0,
					time: 0,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.42410371875,
					durationTicks: 767,
					midi: 69,
					name: "A4",
					ticks: 0,
					time: 0,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 67,
					name: "G4",
					ticks: 768,
					time: 3.4285680000000003,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 64,
					name: "E4",
					ticks: 768,
					time: 3.4285680000000003,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 71,
					name: "B4",
					ticks: 1536,
					time: 6.857136000000001,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 67,
					name: "G4",
					ticks: 1536,
					time: 6.857136000000001,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 62,
					name: "D4",
					ticks: 2304,
					time: 10.285704,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 66,
					name: "F#4",
					ticks: 2304,
					time: 10.285704,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 62,
					name: "D4",
					ticks: 2304,
					time: 10.285704,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 60,
					name: "C4",
					ticks: 3072,
					time: 13.714272000000001,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.4241037187500005,
					durationTicks: 767,
					midi: 69,
					name: "A4",
					ticks: 3072,
					time: 13.714272000000001,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.424103718750004,
					durationTicks: 767,
					midi: 71,
					name: "B4",
					ticks: 3840,
					time: 17.14284,
					velocity: 0.7874015748031497,
				},
				{
					duration: 3.424103718750004,
					durationTicks: 767,
					midi: 64,
					name: "E4",
					ticks: 3840,
					time: 17.14284,
					velocity: 0.7874015748031497,
				},
			],
			endOfTrackTicks: 4608,
		},
	],
};

export const scrollingNotes = generateScrollingNotes(musicJson);
