import React, { useRef, useEffect } from "react";
import RhythmEngine, { NoteEvent } from "../../engine/RhythmEngine";
import { useGame } from "../../context/GameContext";
import { notes } from "../../utils/constants";
import { CANVAS_HEIGHT_DEFAULT, PIANO_HEIGHT, WHITE_KEY_WIDTH } from "./constants";
import { drawCanvas, getKeyCenterX, playNoteAudio, redrawPianoStrip } from "./utils";
import { ActiveKeys, IFallingNote } from "./types";

interface IProps {
	notes: IFallingNote[];
	currentTime: number;
	selectedNotes?: string[]; // if provided, click on falling area will invoke onAddNote
	onAddNote?: () => void;
	width?: number;
	height?: number;
}

const activeKeys: ActiveKeys = new Map();

export const InteractivePianoCanvas = ({
	notes: songNotes,
	currentTime,
	selectedNotes = [],
	onAddNote,
	width = 800,
	height = CANVAS_HEIGHT_DEFAULT,
}: IProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { actions } = useGame();
	// Keep current time in a ref to avoid stale values inside event handlers
	const currentTimeRef = useRef(currentTime);

	// Build rhythm engine once per song change
	const engineRef = useRef<RhythmEngine | null>(null);

	// Keep track of which notes were already evaluated to avoid double counting
	const hitNoteIndexesRef = useRef<Set<number>>(new Set());

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

	const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

	useEffect(() => {
		drawCanvas(canvasRef.current, songNotes, currentTime, height, activeKeys);
	}, [songNotes, currentTime, height, canvasRef]);

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
				redrawPianoStrip(canvasRef.current, activeKeys, height);
			}
		}, 50);
		return () => clearInterval(handle);
	}, [height]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			const char = e.key.toLowerCase();
			const entry = Object.entries(notes).find(([, v]) => v.note.toLowerCase() === char);
			if (entry)
				playNoteAudio(
					entry[0],
					engineRef.current,
					currentTimeRef.current,
					activeKeys,
					actions.incrementWrong,
					actions.incrementCorrect,
					actions.addPoints,
					audioCache,
				);
		};
		window.addEventListener("keydown", down);
		return () => window.removeEventListener("keydown", down);
	}, [actions]);

	const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		if (y < height - PIANO_HEIGHT) {
			if (selectedNotes.length && onAddNote) onAddNote();
		} else {
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
			if (nearest && min <= WHITE_KEY_WIDTH / 2)
				playNoteAudio(
					nearest,
					engineRef.current,
					currentTimeRef.current,
					activeKeys,
					actions.incrementWrong,
					actions.incrementCorrect,
					actions.addPoints,
					audioCache,
				);
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
