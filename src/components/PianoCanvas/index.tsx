import React, { useRef, useEffect, useState } from "react";
import RhythmEngine, { NoteEvent } from "../../engine/RhythmEngine";
import { useGame } from "../../context/GameContext";
import { notes } from "../../utils/constants";
import {
	CANVAS_HEIGHT_DEFAULT,
	PIANO_HEIGHT,
	WHITE_KEY_WIDTH,
	LOOKAHEAD_TIME,
	NOTE_AREA_BOTTOM_PADDING,
} from "./constants";
import { drawCanvas, getKeyCenterX, playNoteAudio, redrawPianoStrip, getTimeFromY, findNoteAtPosition } from "./utils";
import { ActiveKeys, IFallingNote } from "./types";

interface IProps {
	notes: IFallingNote[];
	currentTime: number;
	selectedNotes?: string[];
	onAddNote?: () => void;
	onAddNoteAtKey?: (key: string, time: number) => void;
	onUpdateNoteTime?: (noteIndex: number, newTime: number) => void;
	onUpdateNoteDuration?: (noteIndex: number, newDuration: number) => void;
	width?: number;
	height?: number;
	hasBackgroundAudio?: boolean;
	isEditorMode?: boolean;
}

interface DragState {
	isDragging: boolean;
	noteIndex: number;
	startY: number;
	startTime: number;
	currentY: number;
	dragMode: "timing" | "duration-bottom";
	originalDuration?: number;
}

const activeKeys: ActiveKeys = new Map();

/**
 * Interactive piano canvas component
 * @param notes - Falling notes
 * @param currentTime - Current time
 * @param selectedNotes - Selected notes. If provided, click on falling area will invoke onAddNote
 * @param onAddNote - Callback for adding note
 * @param onAddNoteAtKey - Callback for adding note at specific key and time
 * @param onUpdateNoteTime - Callback for updating note timing
 * @param onUpdateNoteDuration - Callback for updating note duration
 * @param width - Width of the canvas
 * @param height - Height of the canvas
 * @param hasBackgroundAudio - Whether background song audio is playing
 * @param isEditorMode - Whether the canvas is being used in the song editor (disables game over detection)
 */
export const InteractivePianoCanvas = ({
	notes: songNotes,
	currentTime,
	selectedNotes = [],
	onAddNote,
	onAddNoteAtKey,
	onUpdateNoteTime,
	onUpdateNoteDuration,
	width = 800,
	height = CANVAS_HEIGHT_DEFAULT,
	hasBackgroundAudio = false,
	isEditorMode = false,
}: IProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { actions } = useGame();
	// Keep current time in a ref to avoid stale values inside event handlers
	const currentTimeRef = useRef(currentTime);

	const [dragState, setDragState] = useState<DragState | null>(null);
	const [hoverCursor, setHoverCursor] = useState<string>("default");

	const engineRef = useRef<RhythmEngine | null>(null);

	// Keep track of which notes were already evaluated to avoid double counting
	const hitNoteIndexesRef = useRef<Set<number>>(new Set());

	// Flag to prevent multiple game over triggers
	const gameOverTriggeredRef = useRef<boolean>(false);

	useEffect(() => {
		const noteEvents: NoteEvent[] = songNotes.map((n, idx) => ({
			id: String(idx),
			keys: [n.note],
			start: n.time,
		}));
		engineRef.current = new RhythmEngine(noteEvents);
		// reset hits tracking
		hitNoteIndexesRef.current.clear();
		// reset game over flag when song changes
		gameOverTriggeredRef.current = false;

		// Debug: log song info
		console.log(
			`Song loaded: ${songNotes.length} notes, last note at ${Math.max(...songNotes.map((n) => n.time)).toFixed(
				2,
			)}s`,
		);
		if (engineRef.current) {
			console.log(`Game should end at: ${engineRef.current.getGameEndTime().toFixed(2)}s`);
		}
	}, [songNotes]);

	useEffect(() => {
		currentTimeRef.current = currentTime;
	}, [currentTime]);

	// Game over detection effect
	useEffect(() => {
		// Skip game over detection when in editor mode
		if (isEditorMode || !engineRef.current || currentTime <= 0 || gameOverTriggeredRef.current) return;

		// Debug: log progress
		const progress = engineRef.current.getProgress(currentTime);
		const gameEndTime = engineRef.current.getGameEndTime();

		// Multiple conditions for game over to make it more reliable
		const isGameComplete = engineRef.current.isGameComplete(currentTime);
		const hasPassedEndTime = currentTime >= gameEndTime;
		const isVeryNearEnd = progress >= 99; // 99% completion as fallback
		const isFullyComplete = progress >= 100; // 100% completion for immediate trigger

		if (isGameComplete || hasPassedEndTime || isVeryNearEnd || isFullyComplete) {
			console.log("Game over detected!", {
				currentTime: currentTime.toFixed(2),
				gameEndTime: gameEndTime.toFixed(2),
				progress: progress.toFixed(1) + "%",
			});
			gameOverTriggeredRef.current = true;

			// If we're at 100%, trigger immediately
			if (isFullyComplete) {
				console.log("100% completion - triggering immediately");
				actions.stopGame();
			} else {
				// Small delay for other conditions
				const timeoutId = setTimeout(() => {
					console.log("Game ending after delay");
					actions.stopGame();
				}, 200);

				return () => clearTimeout(timeoutId);
			}
		}
	}, [currentTime, actions, isEditorMode]);

	const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

	useEffect(() => {
		// Create modified notes array for rendering if dragging
		let notesToRender = songNotes;
		if (dragState?.isDragging) {
			notesToRender = [...songNotes];

			if (dragState.dragMode === "timing") {
				const newTime = getTimeFromY(dragState.currentY, height, currentTime);
				notesToRender[dragState.noteIndex] = {
					...notesToRender[dragState.noteIndex],
					time: newTime,
				};
			} else if (dragState.dragMode === "duration-bottom") {
				const deltaY = dragState.currentY - dragState.startY;
				const deltaTime = (deltaY / (height - PIANO_HEIGHT - NOTE_AREA_BOTTOM_PADDING)) * LOOKAHEAD_TIME;
				const newDuration = Math.max(0.1, (dragState.originalDuration || 1) + deltaTime);
				notesToRender[dragState.noteIndex] = {
					...notesToRender[dragState.noteIndex],
					duration: newDuration,
				};
			}
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

		// Always prevent default to avoid scroll issues
		e.preventDefault();

		// Check if we clicked on a note
		const noteResult = findNoteAtPosition(x, y, songNotes, currentTime, height, width);
		if (noteResult && (onUpdateNoteTime || onUpdateNoteDuration)) {
			const { noteIndex, area } = noteResult;

			let dragMode: "timing" | "duration-bottom";
			if (area === "bottom" && onUpdateNoteDuration) {
				dragMode = "duration-bottom";
			} else {
				dragMode = "timing";
			}

			setDragState({
				isDragging: true,
				noteIndex,
				startY: y,
				currentY: y,
				startTime: songNotes[noteIndex].time,
				dragMode,
				originalDuration: songNotes[noteIndex].duration,
			});
			return;
		}

		// Fall back to original click behavior
		onCanvasClick(e);
	};

	const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const { x, y } = getScaledCoordinates(e);

		if (dragState?.isDragging) {
			// Prevent default to avoid scroll issues during drag
			e.preventDefault();

			setDragState((prev) =>
				prev
					? {
							...prev,
							currentY: y,
					  }
					: null,
			);
		} else {
			// Update cursor based on hover position when not dragging
			const noteResult = findNoteAtPosition(x, y, songNotes, currentTime, height, width);
			if (noteResult && onUpdateNoteDuration) {
				const { area } = noteResult;
				if (area === "bottom") {
					setHoverCursor("ns-resize"); // North-south resize cursor
				} else {
					setHoverCursor("move"); // Move cursor for timing drag
				}
			} else if (selectedNotes.length) {
				setHoverCursor("crosshair"); // Crosshair for adding notes
			} else {
				setHoverCursor("default");
			}
		}
	};

	const onMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
		if (!dragState?.isDragging) return;

		// Prevent default to avoid any unwanted browser behavior
		if (e) e.preventDefault();

		if (dragState.dragMode === "timing" && onUpdateNoteTime) {
			const newTime = getTimeFromY(dragState.currentY, height, currentTime);
			onUpdateNoteTime(dragState.noteIndex, Math.max(0, newTime));
		} else if (dragState.dragMode === "duration-bottom" && onUpdateNoteDuration) {
			// For bottom handle, adjust duration based on how far we dragged
			const deltaY = dragState.currentY - dragState.startY;
			const deltaTime = (deltaY / (height - PIANO_HEIGHT - NOTE_AREA_BOTTOM_PADDING)) * LOOKAHEAD_TIME;
			const newDuration = Math.max(0.1, (dragState.originalDuration || 1) + deltaTime);
			onUpdateNoteDuration(dragState.noteIndex, newDuration);
		}

		setDragState(null);
	};

	const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (dragState?.isDragging) return; // Don't process clicks during drag

		// Prevent default to avoid any unwanted browser behavior
		e.preventDefault();

		const { x, y } = getScaledCoordinates(e);
		if (y < height - PIANO_HEIGHT) {
			// Click in falling notes area
			if (selectedNotes.length && onAddNote) onAddNote();
		} else {
			// Click on piano keys
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

			if (nearest && min <= WHITE_KEY_WIDTH / 2) {
				// Add note at this key and current time if callback is provided
				if (onAddNoteAtKey) {
					onAddNoteAtKey(nearest, currentTimeRef.current);
				} else {
					// Fallback to just playing audio (original behavior)
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
			}
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
				cursor: dragState?.isDragging ? "grabbing" : hoverCursor,
				userSelect: "none", // Prevent text selection during dragging
				touchAction: "none", // Prevent touch scrolling on mobile
			}}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			onMouseLeave={(e) => {
				e.preventDefault();
				setDragState(null); // Cancel drag if mouse leaves canvas
			}}
		/>
	);
};
