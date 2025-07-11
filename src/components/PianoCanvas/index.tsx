import React, { useRef, useEffect } from "react";
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

const activeKeys: Map<string, number> = new Map();

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
	useEffect(() => {
		currentTimeRef.current = currentTime;
	}, [currentTime]);
	// Keep track of which notes were already evaluated to avoid double counting
	const hitNoteIndexesRef = useRef<Set<number>>(new Set());
	// Timing windows (in seconds) for scoring
	const HIT_EARLY_WINDOW = 0.05; // allow up to 50 ms early
	const HIT_LATE_WINDOW = 0.4; // allow up to 400 ms late – user perception matches when note visually reaches keys

	// Determine whether the pressed key matches an upcoming note within the hit window
	function evaluateNoteHit(keyLabel: string) {
		let wasHit = false;
		for (let i = 0; i < songNotes.length; i++) {
			if (hitNoteIndexesRef.current.has(i)) continue; // already evaluated
			const n = songNotes[i];
			if (n.note !== keyLabel) continue;
			const delta = currentTimeRef.current - n.time; // positive => late, negative => early
			if (delta >= -HIT_EARLY_WINDOW && delta <= HIT_LATE_WINDOW) {
				// Register a successful hit
				hitNoteIndexesRef.current.add(i);
				actions.incrementCorrect();
				wasHit = true;
				break;
			}
		}
		if (!wasHit) {
			// No matching note within window – count as wrong
			actions.incrementWrong();
		}
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
		activeKeys.set(keyLabel, performance.now() + KEY_HIGHLIGHT_MS);

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
			const isActive = activeKeys.has(key) && activeKeys.get(key)! > performance.now();
			ctx.fillStyle = isActive ? "#ffeb3b" : "#fff";
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
			const isActive = activeKeys.has(key) && activeKeys.get(key)! > performance.now();
			ctx.fillStyle = isActive ? "#ffeb3b" : "#000";
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
			activeKeys.forEach((expiry, k) => {
				if (expiry < now) {
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
