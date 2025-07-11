import { NoteType } from "./constants";

export interface IActiveNote {
	note: string;
	leftOffset: number;
}

export interface IScore {
	correctNotes: number;
	wrongNotes: number;
	points: number;
}

export interface INotes {
	note: string;
	offset: number;
	type: NoteType;
	displayAftertimeSeconds: number;
}

// Simple MIDI data interface for uploaded songs
export interface IMidiSongData {
	name: string;
	artist?: string;
	duration: number;
	notes: INotes[];
	bpm?: number;
	timeSignature?: string;
}

// MIDI Parser interfaces (for the library we're using)
interface MidiEvent {
	type: number;
	deltaTime: number;
	data?: number[];
}

interface MidiTrack {
	event: MidiEvent[];
}

export interface MidiParserData {
	timeDivision: number;
	track: MidiTrack[];
}

// Original complex MIDI interface (keeping for compatibility)
interface Tempo {
	bpm: number;
	ticks: number;
}

interface Instrument {
	family: string;
	number: number;
	name: string;
}

interface Note {
	duration: number;
	durationTicks: number;
	midi: number;
	name: string;
	ticks: number;
	time: number;
	velocity: number;
}

interface Track {
	channel: number;
	instrument: Instrument;
	name: string;
	notes: Note[];
	endOfTrackTicks: number;
}

interface Header {
	keySignatures: string[];
	meta: string[]; 
	name: string;
	ppq: number;
	tempos: Tempo[];
	timeSignatures: string[]; 
}

export interface IMidiData {
	header: Header;
	tracks: Track[];
}
  