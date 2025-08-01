import { Card, CardContent } from "@mui/material";

import { Slide } from "@mui/material";

import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../../../../../context/GameContext";
import { InteractivePianoCanvas } from "../../../../PianoCanvas";
import { IFallingNote } from "../../../../PianoCanvas/types";
import { notes } from "../../../../../utils/constants";
import { Header } from "./components/Header";

export const Play = () => {
	const { gameState, currentTime, currentSong, currentSongAudioUrl, actions } = useGame();
	const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
	const audioStartedRef = useRef<boolean>(false);
	const syncIntervalRef = useRef<number | null>(null);
	const [waitingForStart, setWaitingForStart] = useState(true);
	const previousGameStateRef = useRef<string>("");

	// Reset waiting state ONLY when starting a NEW game (from MENU), not when resuming
	useEffect(() => {
		if (gameState === "PLAYING" && previousGameStateRef.current !== "PLAYING") {
			// Only reset if coming from MENU (new game), not from PAUSED (resume)
			if (previousGameStateRef.current === "MENU" || previousGameStateRef.current === "") {
				setWaitingForStart(true);
				actions.setCurrentTime(0); // Reset time to 0
				audioStartedRef.current = false; // Reset audio state
			}
			// If resuming from PAUSED, don't reset anything - just continue
		}
		previousGameStateRef.current = gameState;
	}, [gameState, actions]);

	// Create audio element but don't start it until user presses a key
	useEffect(() => {
		if (!currentSongAudioUrl) {
			// Clean up any existing audio
			if (backgroundAudioRef.current) {
				backgroundAudioRef.current.pause();
				backgroundAudioRef.current = null;
			}
			audioStartedRef.current = false;
			return;
		}

		// Create audio element but don't play yet
		const audio = new Audio(currentSongAudioUrl);
		audio.volume = 0.8;
		backgroundAudioRef.current = audio;

		return () => {
			// Cleanup
			if (backgroundAudioRef.current) {
				backgroundAudioRef.current.pause();
				backgroundAudioRef.current = null;
			}
			audioStartedRef.current = false;
		};
	}, [currentSongAudioUrl]);

	// Listen for any key press to start the game
	useEffect(() => {
		if (!waitingForStart || gameState !== "PLAYING") return;

		const startGame = (e: Event) => {
			e.preventDefault();
			e.stopPropagation();
			
			// Start background audio if available
			if (backgroundAudioRef.current) {
				backgroundAudioRef.current.currentTime = 0;
				backgroundAudioRef.current.play().then(() => {
					audioStartedRef.current = true;
					setWaitingForStart(false); // Only hide banner after audio actually starts
					actions.setCurrentTime(0); // Start from 0 after audio starts
				}).catch(error => {
					console.warn("Failed to start background audio:", error);
					setWaitingForStart(false);
					actions.setCurrentTime(0.01); // Start slightly above 0 to trigger GameController timing
				});
			} else {
				// No background audio - start with performance timing
				setWaitingForStart(false);
				actions.setCurrentTime(0.01); // Start slightly above 0 to trigger GameController timing
			}
		};

		const handleKeyPress = (e: KeyboardEvent) => {
			startGame(e);
		};

		const handleClick = (e: MouseEvent) => {
			startGame(e);
		};

		// Use capture phase to intercept events before they reach other handlers
		window.addEventListener("keydown", handleKeyPress, { capture: true, once: true });
		window.addEventListener("click", handleClick, { capture: true, once: true });

		return () => {
			window.removeEventListener("keydown", handleKeyPress, { capture: true });
			window.removeEventListener("click", handleClick, { capture: true });
		};
	}, [waitingForStart, gameState, actions]);

	// Simple pause/resume control with proper time syncing
	useEffect(() => {
		if (!backgroundAudioRef.current || !audioStartedRef.current || waitingForStart) {
			return;
		}

		const audio = backgroundAudioRef.current;
		
		if (gameState === "PLAYING") {
			if (audio.paused) {
				// When resuming, sync audio time to game time
				audio.currentTime = currentTime;
				audio.play().catch(error => {
					console.warn("Audio resume failed:", error);
				});
			}
		} else if (gameState === "PAUSED") {
			if (!audio.paused) {
				audio.pause();
			}
		}
	}, [gameState, waitingForStart, currentTime]);

	// Synchronize game time with audio time when background audio is playing
	useEffect(() => {
		if (!backgroundAudioRef.current || !audioStartedRef.current || gameState !== "PLAYING" || waitingForStart) {
			if (syncIntervalRef.current) {
				clearInterval(syncIntervalRef.current);
				syncIntervalRef.current = null;
			}
			return;
		}

		// Sync game time to audio time at 60fps for smooth note falling
		syncIntervalRef.current = window.setInterval(() => {
			if (backgroundAudioRef.current && !backgroundAudioRef.current.paused) {
				actions.setCurrentTime(backgroundAudioRef.current.currentTime);
			}
		}, 1000 / 60); // 60 FPS

		return () => {
			if (syncIntervalRef.current) {
				clearInterval(syncIntervalRef.current);
				syncIntervalRef.current = null;
			}
		};
	}, [gameState, actions, waitingForStart]);

	const fallingNotes: IFallingNote[] = (currentSong || []).map((n) => {
		// Find the constant-key (e.g., "Q", "E", "Z") whose `note` char matches the saved value
		const entry = Object.entries(notes).find(([, v]) => v.note.toLowerCase() === n.note.toLowerCase());
		const keyName = entry ? entry[0] : n.note; // fallback to original if not found

		return {
			note: keyName,
			offset: n.offset,
			type: n.type,
			time: n.displayAftertimeSeconds,
			duration: n.duration || 1,
		} as IFallingNote;
	});

	return (
		<Box sx={{ width: "100%", maxWidth: "1200px" }}>
			<Slide direction="down" in={gameState === "PLAYING"} timeout={500}>
				<Card
					elevation={4}
					sx={{
						background: "rgba(0,0,0,0.8)",
						backdropFilter: "blur(10px)",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: 2,
						mb: 2,
					}}
				>
					<CardContent>
						<Header />
					</CardContent>
				</Card>
			</Slide>

			<Slide direction="up" in={gameState === "PLAYING"} timeout={700}>
				<Box>
					<Box sx={{ mb: 2 }}>
						<Box sx={{ position: "relative" }}>
							<InteractivePianoCanvas
								notes={waitingForStart ? [] : fallingNotes}
								currentTime={waitingForStart ? 0 : currentTime}
								width={800}
								height={400}
								hasBackgroundAudio={!!currentSongAudioUrl}
							/>
							{waitingForStart && (
								<Box
									sx={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: "rgba(0, 0, 0, 0.8)",
										border: "2px solid #FF8E53",
										borderRadius: 2,
										flexDirection: "column",
										zIndex: 10,
									}}
								>
									<Typography
										variant="h4"
										sx={{
											color: "#FF8E53",
											fontWeight: "bold",
											textAlign: "center",
											mb: 2,
											textShadow: "0 0 10px rgba(255, 142, 83, 0.5)",
										}}
									>
										Press Any Key to Start
									</Typography>
									<Typography
										variant="body1"
										sx={{
											color: "rgba(255, 255, 255, 0.8)",
											textAlign: "center",
										}}
									>
										Get ready to play! {currentSongAudioUrl ? "🎵" : "🎹"}
									</Typography>
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</Slide>
		</Box>
	);
};
