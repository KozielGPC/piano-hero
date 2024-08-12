export enum NoteType {
	white = "white",
	black = "black",
}

export const notes = {
	E: {
		offset: -5.5,
		note: "e",
		type: NoteType.black,
		fileName: "Db4.mp3",
	},
	S: { offset: -7, note: "s", type: NoteType.white, fileName: "C4.mp3" },
	R: {
		offset: -3.5,
		note: "r",
		type: NoteType.black,
		fileName: "Eb4.mp3",
	},
	D: { offset: -5, note: "d", type: NoteType.white, fileName: "D4.mp3" },
	F: { offset: -3, note: "f", type: NoteType.white, fileName: "E4.mp3" },
	Y: {
		offset: 0.5,
		note: "y",
		type: NoteType.black,
		fileName: "Gb4.mp3",
	},
	G: { offset: -1, note: "g", type: NoteType.white, fileName: "F4.mp3" },
	U: {
		offset: 2.5,
		note: "u",
		type: NoteType.black,
		fileName: "Ab4.mp3",
	},
	H: { offset: 1, note: "h", type: NoteType.white, fileName: "G4.mp3" },
	I: {
		offset: 4.5,
		note: "i",
		type: NoteType.black,
		fileName: "Bb4.mp3",
	},
	J: { offset: 3, note: "j", type: NoteType.white, fileName: "A4.mp3" },
	K: { offset: 5, note: "k", type: NoteType.white, fileName: "B4.mp3" },
};

export const keys = Object.values(notes);

const noteMapping = {
	60: notes.S, // C4
	61: notes.E, // C#4
	62: notes.D, // D4
	63: notes.R, // D#4
	64: notes.F, // E4
	65: notes.G, // F4
	66: notes.Y, // F#4
	67: notes.H, // G4
	68: notes.U, // G#4
	69: notes.J, // A4
	70: notes.I, // A#4
	71: notes.K, // B4
};

export function generateScrollingNotes(json: any) {
	const scrollingNotes: any = [];
	const { tracks } = json;
	let currentTime = 0;

	tracks.forEach((track) => {
		track.notes.forEach((note) => {
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

export const musicJson = {
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
