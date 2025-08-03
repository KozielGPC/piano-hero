import React, { useRef, useEffect, useState, useCallback } from "react";
import RhythmEngine from "../../engine/RhythmEngine";
import { NoteEvent } from "../../engine/types";
import { useGame } from "../../context/GameContext";
import { notes } from "../../utils/constants";
import {
	CANVAS_HEIGHT_DEFAULT,
	PIANO_HEIGHT,
	WHITE_KEY_WIDTH,
	LOOKAHEAD_TIME,
	NOTE_AREA_BOTTOM_PADDING,
} from "./constants";
import {
	drawCanvas,
	playNoteAudio,
	redrawPianoStrip,
	getTimeFromY,
	findNoteAtPosition,
	getScaledCoordinates,
	findNearestKeyAndMinDistance,
} from "./utils";
import { ActiveKeys, DragState, IFallingNote } from "./types";
import { useSongEditor } from "../../context/SongEditorContext";

interface IProps {
	notes: IFallingNote[];
	currentTime: number;
	selectedNotes?: string[];
	width?: number;
	height?: number;
	hasBackgroundAudio?: boolean;
	isEditorMode?: boolean;
}

const activeKeys: ActiveKeys = new Map();

/**
 * Interactive piano canvas component
 * @param notes - Falling notes
 * @param currentTime - Current time
 * @param selectedNotes - Selected notes. If provided, click on falling area will invoke onAddNote
 * @param width - Width of the canvas
 * @param height - Height of the canvas
 * @param hasBackgroundAudio - Whether background song audio is playing
 * @param isEditorMode - Whether the canvas is being used in the song editor (disables game over detection)
 */
export const InteractivePianoCanvas = ({
	notes: songNotes,
	currentTime,
	selectedNotes = [],
	width = 800,
	height = CANVAS_HEIGHT_DEFAULT,
	hasBackgroundAudio = false,
	isEditorMode = false,
}: IProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const engineRef = useRef<RhythmEngine | null>(null);
	const currentTimeRef = useRef(currentTime);
	const hitNoteIndexesRef = useRef<Set<number>>(new Set());
	const gameOverTriggeredRef = useRef<boolean>(false);

	const { actions } = useGame();
	const { actions: songEditorActions } = useSongEditor();

	const [dragState, setDragState] = useState<DragState | null>(null);
	const [hoverCursor, setHoverCursor] = useState<string>("default");

	const startGame = useCallback(() => {
		const noteEvents: NoteEvent[] = songNotes.map((n, idx) => ({
			id: String(idx),
			keys: [n.note],
			start: n.time,
		}));
		engineRef.current = new RhythmEngine(noteEvents);
		hitNoteIndexesRef.current.clear();
		gameOverTriggeredRef.current = false;
	}, [songNotes]);

	useEffect(() => {
		startGame();
	}, [startGame]);

	useEffect(() => {
		currentTimeRef.current = currentTime;
	}, [currentTime]);

	// Game over detection
	useEffect(() => {
		if (isEditorMode || !engineRef.current || currentTime <= 0 || gameOverTriggeredRef.current) return;

		const getProgressState = (engine: RhythmEngine, currentTime: number) => {
			if (!engine) return { gameEndTime: 0, isFullyComplete: false };

			const gameEndTime = engine.getGameEndTime();
			const isFullyComplete = engine.isGameComplete(currentTime);

			return { gameEndTime, isFullyComplete };
		};

		const { gameEndTime, isFullyComplete } = getProgressState(engineRef.current, currentTimeRef.current);

		const shouldGameOver = (
			engine: RhythmEngine,
			currentTime: number,
			gameEndTime: number,
			isFullyComplete: boolean,
		) => {
			const isGameComplete = engine.isGameComplete(currentTime);
			const hasPassedEndTime = currentTime >= gameEndTime;
			const isVeryNearEnd = engine.isNearEnd(currentTime, 0.9);

			return isGameComplete || hasPassedEndTime || isVeryNearEnd || isFullyComplete;
		};

		if (shouldGameOver(engineRef.current, currentTime, gameEndTime, isFullyComplete)) {
			gameOverTriggeredRef.current = true;

			if (isFullyComplete) {
				actions.stopGame();
			} else {
				const timeoutId = setTimeout(() => {
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

	const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const { x, y } = getScaledCoordinates(e);

		// Always prevent default to avoid scroll issues
		e.preventDefault();

		// Check if we clicked on a note
		const noteResult = findNoteAtPosition(x, y, songNotes, currentTime, height, width);
		// if (noteResult && (songEditorActions.updateNoteTime || songEditorActions.updateNoteDuration)) {
		if (noteResult) {
			const { noteIndex, area } = noteResult;

			let dragMode: "timing" | "duration-bottom";
			// if (area === "bottom" && songEditorActions.updateNoteDuration) {
			if (area === "bottom") {
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
			if (noteResult) {
			// if (noteResult && songEditorActions.updateNoteDuration) {
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

		if (dragState.dragMode === "timing" && songEditorActions.updateNoteTime) {
			const newTime = getTimeFromY(dragState.currentY, height, currentTime);
			songEditorActions.updateNoteTime(dragState.noteIndex, Math.max(0, newTime), songNotes);
		} else if (dragState.dragMode === "duration-bottom" && songEditorActions.updateNoteDuration) {
			// For bottom handle, adjust duration based on how far we dragged
			const deltaY = dragState.currentY - dragState.startY;
			const deltaTime = (deltaY / (height - PIANO_HEIGHT - NOTE_AREA_BOTTOM_PADDING)) * LOOKAHEAD_TIME;
			const newDuration = Math.max(0.1, (dragState.originalDuration || 1) + deltaTime);
			songEditorActions.updateNoteDuration(dragState.noteIndex, newDuration, songNotes);
		}

		setDragState(null);
	};

	const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (dragState?.isDragging) return; // Don't process clicks during drag

		e.preventDefault();

		const { x } = getScaledCoordinates(e);
		const { nearest, min } = findNearestKeyAndMinDistance(x, width);

		if (nearest && min <= WHITE_KEY_WIDTH / 2) {
			// Song Editor mode - Add new key at current time
			if (songEditorActions.addNoteAtKey) {
				songEditorActions.addNoteAtKey(nearest, currentTimeRef.current);
			} else {
				// Play Mode - Fallback to just playing audio
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
				userSelect: "none",
				touchAction: "none",
			}}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			onMouseLeave={(e) => {
				e.preventDefault();
				setDragState(null);
			}}
		/>
	);
};
