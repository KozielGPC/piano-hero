import React, { useRef, useEffect, useState } from "react";
import RhythmEngine, { NoteEvent } from "../../engine/RhythmEngine";
import { useGame } from "../../context/GameContext";
import { notes, NoteType } from "../../utils/constants";
import { CANVAS_HEIGHT_DEFAULT, PIANO_HEIGHT, WHITE_KEY_WIDTH, BLACK_KEY_WIDTH, LOOKAHEAD_TIME, NOTE_AREA_TOP_PADDING, NOTE_AREA_BOTTOM_PADDING, MINIMUM_NOTE_HEIGHT, NOTE_HEIGHT_MULTIPLIER } from "./constants";
import { drawCanvas, getKeyCenterX, playNoteAudio, redrawPianoStrip } from "./utils";
import { ActiveKeys, IFallingNote } from "./types";

interface IProps {
	notes: IFallingNote[];
	currentTime: number;
	selectedNotes?: string[]; // if provided, click on falling area will invoke onAddNote
	onAddNote?: () => void;
	onUpdateNoteTime?: (noteIndex: number, newTime: number) => void; // New callback for updating note timing
	width?: number;
	height?: number;
	hasBackgroundAudio?: boolean; // Whether background song audio is playing
}

// Drag state interface
interface DragState {
	isDragging: boolean;
	noteIndex: number;
	startY: number;
	startTime: number;
	currentY: number;
}



const activeKeys: ActiveKeys = new Map();

export const InteractivePianoCanvas = ({
	notes: songNotes,
	currentTime,
	selectedNotes = [],
	onAddNote,
	onUpdateNoteTime,
	width = 800,
	height = CANVAS_HEIGHT_DEFAULT,
	hasBackgroundAudio = false,
}: IProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { actions } = useGame();
	// Keep current time in a ref to avoid stale values inside event handlers
	const currentTimeRef = useRef(currentTime);
	
	// Drag state
	const [dragState, setDragState] = useState<DragState | null>(null);

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

	// Helper function to find note at click position
	const findNoteAtPosition = (x: number, y: number): number | null => {
		const noteAreaHeight = height - PIANO_HEIGHT;
		
		// Check if click is in the falling notes area
		if (y >= noteAreaHeight) {
			console.log("Click is in piano area, not notes area");
			return null;
		}

		console.log(`Looking for note at position (${x.toFixed(1)}, ${y.toFixed(1)})`);
		console.log(`Note area height: ${noteAreaHeight}, current time: ${currentTime.toFixed(2)}`);

		for (let i = 0; i < songNotes.length; i++) {
			const note = songNotes[i];
			const noteStartTime = note.time;
			const noteEndTime = note.time + (note.duration || 1);
			const noteIsVisible = currentTime >= noteStartTime - LOOKAHEAD_TIME && currentTime <= noteEndTime + 1;

			if (!noteIsVisible) continue;

			const timeUntilNote = noteStartTime - currentTime;
			const fallProgress = (LOOKAHEAD_TIME - timeUntilNote) / LOOKAHEAD_TIME;
			const fallAreaHeight = noteAreaHeight - NOTE_AREA_BOTTOM_PADDING;
			const noteCenterY = fallProgress * fallAreaHeight + NOTE_AREA_TOP_PADDING;
			const noteHeight = Math.max(MINIMUM_NOTE_HEIGHT, (note.duration || 1) * NOTE_HEIGHT_MULTIPLIER);

			const noteData = notes[note.note as keyof typeof notes];
			if (!noteData) continue;

			const noteCenterX = getKeyCenterX(noteData.offset, width / 2);
			const noteWidth = noteData.type === NoteType.black ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH;

			const noteLeft = noteCenterX - noteWidth / 2;
			const noteRight = noteCenterX + noteWidth / 2;
			const noteTop = noteCenterY;
			const noteBottom = noteCenterY + noteHeight;

			console.log(`Note ${i} (${note.note}): bounds (${noteLeft.toFixed(1)}, ${noteTop.toFixed(1)}) to (${noteRight.toFixed(1)}, ${noteBottom.toFixed(1)})`);

			// Check if click is within note bounds
			if (x >= noteLeft && x <= noteRight && y >= noteTop && y <= noteBottom) {
				console.log(`Found note ${i} at position!`);
				return i;
			}
		}
		console.log("No note found at position");
		return null;
	};

	// Convert Y position to time
	const getTimeFromY = (y: number): number => {
		const noteAreaHeight = height - PIANO_HEIGHT;
		const fallAreaHeight = noteAreaHeight - NOTE_AREA_BOTTOM_PADDING;
		const fallProgress = (y - NOTE_AREA_TOP_PADDING) / fallAreaHeight;
		const timeUntilNote = LOOKAHEAD_TIME - (fallProgress * LOOKAHEAD_TIME);
		return currentTime + timeUntilNote;
	};

	useEffect(() => {
		// Create modified notes array for rendering if dragging
		let notesToRender = songNotes;
		if (dragState?.isDragging) {
			const newTime = getTimeFromY(dragState.currentY);
			notesToRender = [...songNotes];
			notesToRender[dragState.noteIndex] = {
				...notesToRender[dragState.noteIndex],
				time: newTime
			};
		}
		
		drawCanvas(canvasRef.current, notesToRender, currentTime, height, activeKeys);
	}, [songNotes, currentTime, height, canvasRef, dragState]);

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
					hasBackgroundAudio,
				);
		};
		window.addEventListener("keydown", down);
		return () => window.removeEventListener("keydown", down);
	}, [actions]);

	const getScaledCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = e.currentTarget;
		const rect = canvas.getBoundingClientRect();
		
		// Calculate scaling factors
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		
		// Get mouse position relative to canvas and scale it
		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;
		
		return { x, y };
	};

	const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const { x, y } = getScaledCoordinates(e);

		// Check if we clicked on a note
		const noteIndex = findNoteAtPosition(x, y);
		if (noteIndex !== null && onUpdateNoteTime) {
			setDragState({
				isDragging: true,
				noteIndex,
				startY: y,
				currentY: y,
				startTime: songNotes[noteIndex].time
			});
			e.preventDefault();
			return;
		}

		// Fall back to original click behavior
		onCanvasClick(e);
	};

	const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!dragState?.isDragging) return;

		const { y } = getScaledCoordinates(e);

		setDragState(prev => prev ? {
			...prev,
			currentY: y
		} : null);
	};

	const onMouseUp = () => {
		if (!dragState?.isDragging || !onUpdateNoteTime) return;

		const newTime = getTimeFromY(dragState.currentY);
		onUpdateNoteTime(dragState.noteIndex, Math.max(0, newTime)); // Ensure time is not negative

		setDragState(null);
	};

	const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (dragState?.isDragging) return; // Don't process clicks during drag

		const { x, y } = getScaledCoordinates(e);
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
					hasBackgroundAudio,
				);
		}
	};

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{ 
				width: "100%", 
				height: "auto", 
				cursor: dragState?.isDragging ? "grabbing" : (selectedNotes.length ? "crosshair" : "default")
			}}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			onMouseLeave={() => setDragState(null)} // Cancel drag if mouse leaves canvas
		/>
	);
};
