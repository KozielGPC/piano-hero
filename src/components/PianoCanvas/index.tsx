import React, { useRef, useEffect } from "react";
import RhythmEngine, { NoteEvent, Judgement } from "../../engine/RhythmEngine";
import { useGame } from "../../context/GameContext";
import { notes, NoteType } from "../../utils/constants";
import {
	CANVAS_HEIGHT_DEFAULT,
	KEY_HIGHLIGHT_MS,
	PIANO_HEIGHT,
	WHITE_KEY_WIDTH,
	BLACK_KEY_WIDTH,
	LOOKAHEAD_TIME,
} from "./constants";
import { getKeyCenterX } from "./utils";

export interface IFallingNote {
	note: string;
	offset: number;
	type: NoteType;
	time: number; // displayAftertimeSeconds or editor time
	duration: number;
}

interface Props {
	notes: IFallingNote[];
	currentTime: number;
	selectedNotes?: string[]; // if provided, click on falling area will invoke onAddNote
	onAddNote?: () => void;
	width?: number;
	height?: number;
}

// Active key highlight state: stores expiry timestamp and visual info per key
const activeKeys: Map<string, { expiry: number; color: string; label: string }> = new Map();

const InteractivePianoCanvas: React.FC<Props> = ({
	notes: songNotes,
	currentTime,
	selectedNotes = [],
	onAddNote,
	width = 800,
	height = CANVAS_HEIGHT_DEFAULT,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { actions } = useGame();
	// Keep current time in a ref to avoid stale values inside event handlers
	const currentTimeRef = useRef(currentTime);

	// Build rhythm engine once per song change
	const engineRef = useRef<RhythmEngine | null>(null);
	useEffect(() => {
		const noteEvents: NoteEvent[] = songNotes.map((n, idx) => ({
			id: String(idx),
			keys: [n.note],
			start: n.time,
		}));
		engineRef.current = new RhythmEngine(noteEvents);
		// reset hits tracking
		hitNoteIndexesRef.current.clear();
	}, [songNotes]);
	useEffect(() => {
		currentTimeRef.current = currentTime;
	}, [currentTime]);
	// Keep track of which notes were already evaluated to avoid double counting
	const hitNoteIndexesRef = useRef<Set<number>>(new Set());
	// The RhythmEngine handles timing windows internally

	// Helper: map judgement to points & feedback style
	const judgementInfo: Record<Judgement, { points: number; text: string; color: string }> = {
		perfect: { points: 300, text: "Perfect!", color: "#ffd700" },
		great: { points: 200, text: "Great!", color: "#4caf50" },
		good: { points: 100, text: "Good", color: "#2196f3" },
		hit: { points: 50, text: "Hit", color: "#9e9e9e" },
		miss: { points: 0, text: "Miss", color: "#f44336" },
		wrongKey: { points: 0, text: "Wrong Key", color: "#f44336" },
	};

	function evaluateNoteHit(keyLabel: string) {
		if (!engineRef.current) return;
		const verdict: Judgement = engineRef.current.handleKeyPress(keyLabel, currentTimeRef.current);

		// Update score counts
		if (verdict === "miss" || verdict === "wrongKey") {
			actions.incrementWrong();
		} else {
			actions.incrementCorrect();
		}

		// Add points
		const info = judgementInfo[verdict];
		if (info.points > 0) actions.addPoints(info.points);

		// Highlight this key with verdict color and label
		activeKeys.set(keyLabel, {
			expiry: performance.now() + KEY_HIGHLIGHT_MS,
			color: info.color,
			label: info.text,
		});
	}

	// Audio helper
	const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
	const playNoteAudio = (keyLabel: string) => {
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
		evaluateNoteHit(keyLabel);
		// No immediate full redraw – the highlight timer will pick it up, avoiding note flash
	};

	// Drawing helpers
	const drawPianoKeys = (ctx: CanvasRenderingContext2D, canvasWidth: number) => {
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

	const drawCanvas = () => {
		const canvas = canvasRef.current;
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
		drawPianoKeys(ctx, canvas.width);
	};

	// Redraw just the piano strip (used for key-flash updates). Avoids touching the falling-note area.
	const redrawPianoStrip = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Clear only the piano region
		ctx.clearRect(0, canvas.height - PIANO_HEIGHT, canvas.width, PIANO_HEIGHT);
		// Repaint background strip
		ctx.fillStyle = "#e0e0e0";
		ctx.fillRect(0, canvas.height - PIANO_HEIGHT, canvas.width, PIANO_HEIGHT);
		// Draw keys (with current highlight state)
		drawPianoKeys(ctx, canvas.width);
	};

	// Redraw whenever props change (currentTime, songNotes length, highlights)
	useEffect(() => {
		drawCanvas();
	});

	// Cleanup expired active keys
	useEffect(() => {
		const handle = setInterval(() => {
			const now = performance.now();
			let needsRepaint = false;
			activeKeys.forEach((state, k) => {
				if (state.expiry < now) {
					activeKeys.delete(k);
					needsRepaint = true;
				}
			});
			// Only touch the piano strip so falling notes keep their smooth trajectory
			if (activeKeys.size || needsRepaint) {
				redrawPianoStrip();
			}
		}, 50);
		return () => clearInterval(handle);
	}, []);

	// Keydown listener
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			const char = e.key.toLowerCase();
			const entry = Object.entries(notes).find(([, v]) => v.note.toLowerCase() === char);
			if (entry) playNoteAudio(entry[0]);
		};
		window.addEventListener("keydown", down);
		return () => window.removeEventListener("keydown", down);
	}, []);

	// Click handler
	const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		if (y < height - PIANO_HEIGHT) {
			if (selectedNotes.length && onAddNote) onAddNote();
		} else {
			// play key
			let nearest: string | null = null;
			let min = Infinity;
			Object.keys(notes).forEach((k) => {
				const cx = getKeyCenterX(notes[k as keyof typeof notes].offset, width / 2);
				const d = Math.abs(cx - x);
				if (d < min) {
					min = d;
					nearest = k;
				}
			});
			if (nearest && min <= WHITE_KEY_WIDTH / 2) playNoteAudio(nearest);
		}
	};

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{ width: "100%", height: "auto", cursor: selectedNotes.length ? "crosshair" : "default" }}
			onClick={onCanvasClick}
		/>
	);
};

export default InteractivePianoCanvas;
