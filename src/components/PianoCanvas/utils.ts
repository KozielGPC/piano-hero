import RhythmEngine, { Judgement } from "../../engine/RhythmEngine";
import { notes, NoteType } from "../../utils/constants";
import {
	OFFSET_UNIT,
	PIANO_HEIGHT,
	WHITE_KEY_WIDTH,
	BLACK_KEY_WIDTH,
	LOOKAHEAD_TIME,
	JUDGEMENT_INFO,
	KEY_HIGHLIGHT_MS,
} from "./constants";
import { ActiveKeys, IFallingNote } from "./types";

export const getKeyCenterX = (offset: number, canvasCenterX: number) => {
	return canvasCenterX + offset * OFFSET_UNIT;
};

export const drawPianoKeys = (
	ctx: CanvasRenderingContext2D,
	canvasWidth: number,
	activeKeys: ActiveKeys,
	height: number,
) => {
	// Draw white keys first
	Object.entries(notes).forEach(([key, value]) => {
		const noteData = value as (typeof notes)[keyof typeof notes];
		if (noteData.type !== NoteType.white) return;
		const x = getKeyCenterX(noteData.offset, canvasWidth / 2);
		const keyState = activeKeys.get(key);
		const isActive = keyState && keyState.expiry > performance.now();
		ctx.fillStyle = isActive ? keyState!.color : "#fff";
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
		ctx.fillRect(x - WHITE_KEY_WIDTH / 2, height - PIANO_HEIGHT, WHITE_KEY_WIDTH, PIANO_HEIGHT);
		ctx.strokeRect(x - WHITE_KEY_WIDTH / 2, height - PIANO_HEIGHT, WHITE_KEY_WIDTH, PIANO_HEIGHT);

		ctx.fillStyle = "#000";
		ctx.font = "10px Arial";
		ctx.textAlign = "center";
		ctx.fillText(key, x, height - 8);
	});

	// Then draw black keys on top
	Object.entries(notes).forEach(([key, value]) => {
		const noteData = value as (typeof notes)[keyof typeof notes];
		if (noteData.type !== NoteType.black) return;
		const x = getKeyCenterX(noteData.offset, canvasWidth / 2);
		const keyState = activeKeys.get(key);
		const isActive = keyState && keyState.expiry > performance.now();
		ctx.fillStyle = isActive ? keyState!.color : "#000";
		const blackH = PIANO_HEIGHT * 0.6;
		ctx.fillRect(x - BLACK_KEY_WIDTH / 2, height - PIANO_HEIGHT, BLACK_KEY_WIDTH, blackH);
		ctx.fillStyle = "#fff";
		ctx.font = "9px Arial";
		ctx.textAlign = "center";
		ctx.fillText(key, x, height - PIANO_HEIGHT + 12);
	});
};

export const drawCanvas = (
	canvas: HTMLCanvasElement | null,
	songNotes: IFallingNote[],
	currentTime: number,
	height: number,
	activeKeys: ActiveKeys,
) => {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#fafafa";
	ctx.fillRect(0, 0, canvas.width, height - PIANO_HEIGHT);
	ctx.fillStyle = "#e0e0e0";
	ctx.fillRect(0, height - PIANO_HEIGHT, canvas.width, PIANO_HEIGHT);

	// draw notes first (so piano keys will overlay them when they reach the keyboard)
	songNotes.forEach((note) => {
		const start = note.time;
		const end = note.time + (note.duration || 1);
		if (currentTime < start - LOOKAHEAD_TIME || currentTime > end + 1) return;

		const timeUntilNote = start - currentTime;
		const fallProgress = (LOOKAHEAD_TIME - timeUntilNote) / LOOKAHEAD_TIME;
		const y = fallProgress * (height - PIANO_HEIGHT - 50) + 10;
		if (y < -50 || y > height) return;

		const noteData = notes[note.note as keyof typeof notes];
		if (!noteData) return;
		const x = getKeyCenterX(noteData.offset, canvas.width / 2);
		// Match the rectangle width to the actual key width for perfect alignment
		const keyWidth = noteData.type === NoteType.black ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH;

		ctx.fillStyle = noteData.type === NoteType.black ? "#000" : "#fff";
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;

		const noteHeight = Math.max(20, (note.duration || 1) * 30);
		ctx.fillRect(x - keyWidth / 2, y, keyWidth, noteHeight);
		ctx.strokeRect(x - keyWidth / 2, y, keyWidth, noteHeight);

		// Draw feedback label above active key
		const keyState = activeKeys.get(note.note);
		if (keyState && keyState.expiry > performance.now()) {
			ctx.fillStyle = keyState.color;
			ctx.font = "12px Arial";
			ctx.textAlign = "center";
			const labelY = height - PIANO_HEIGHT - 8; // just above white key top
			ctx.fillText(keyState.label, x, labelY);
		}
	});

	// finally draw piano keys on top of everything
	drawPianoKeys(ctx, canvas.width, activeKeys, height);
};

/**
 * Redraw just the piano strip (used for key-flash updates). Avoids touching the falling-note area.
 */
export const redrawPianoStrip = (canvas: HTMLCanvasElement | null, activeKeys: ActiveKeys, height: number) => {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	// Clear only the piano region
	ctx.clearRect(0, canvas.height - PIANO_HEIGHT, canvas.width, PIANO_HEIGHT);
	// Repaint background strip
	ctx.fillStyle = "#e0e0e0";
	ctx.fillRect(0, canvas.height - PIANO_HEIGHT, canvas.width, PIANO_HEIGHT);
	// Draw keys (with current highlight state)
	drawPianoKeys(ctx, canvas.width, activeKeys, height);
};

export const evaluateNoteHit = (
	keyLabel: string,
	engine: RhythmEngine | null,
	currentTime: number,
	activeKeys: ActiveKeys,
	incrementWrong: () => void,
	incrementCorrect: () => void,
	addPoints: (points: number) => void,
) => {
	if (!engine) return;
	const verdict: Judgement = engine.handleKeyPress(keyLabel, currentTime);

	// Update score counts
	if (verdict === "miss" || verdict === "wrongKey") {
		incrementWrong();
	} else {
		incrementCorrect();
	}

	// Add points
	const info = JUDGEMENT_INFO[verdict];
	if (info.points > 0) addPoints(info.points);

	// Highlight this key with verdict color and label
	activeKeys.set(keyLabel, {
		expiry: performance.now() + KEY_HIGHLIGHT_MS,
		color: info.color,
		label: info.text,
	});
};

export const playNoteAudio = (
	keyLabel: string,
	engine: RhythmEngine | null,
	currentTime: number,
	activeKeys: ActiveKeys,
	incrementWrong: () => void,
	incrementCorrect: () => void,
	addPoints: (points: number) => void,
	audioCache: React.MutableRefObject<Map<string, HTMLAudioElement>>,
) => {
	const noteData = notes[keyLabel as keyof typeof notes];
	if (!noteData) return;

	let audio = audioCache.current.get(keyLabel);
	if (!audio) {
		audio = new Audio(`/sounds/${noteData.fileName}`);
		audioCache.current.set(keyLabel, audio);
	}
	audio.currentTime = 0;
	audio.play().catch(() => {});
	activeKeys.set(keyLabel, {
		expiry: performance.now() + KEY_HIGHLIGHT_MS,
		color: "#ffeb3b", // Default highlight color
		label: "", // No label for audio play
	});

	// Evaluate if this key press was a hit or miss
	evaluateNoteHit(keyLabel, engine, currentTime, activeKeys, incrementWrong, incrementCorrect, addPoints);
	// No immediate full redraw – the highlight timer will pick it up, avoiding note flash
};
