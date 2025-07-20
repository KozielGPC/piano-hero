import { Card, CardContent } from "@mui/material";

import { Slide } from "@mui/material";

import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { useGame } from "../../../../../context/GameContext";
import { InteractivePianoCanvas } from "../../../../PianoCanvas";
import { IFallingNote } from "../../../../PianoCanvas/types";
import { notes } from "../../../../../utils/constants";
import { Header } from "./components/Header";

export const Play = () => {
	const { gameState, currentTime, currentSong, currentSongAudioUrl } = useGame();
	const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
	const audioStartedRef = useRef<boolean>(false);

	// Create audio element once and start it immediately
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

		// Create audio element
		const audio = new Audio(currentSongAudioUrl);
		audio.volume = 0.8;
		backgroundAudioRef.current = audio;

		// Start audio immediately and let it run on its own timeline
		audio.play().then(() => {
			audioStartedRef.current = true;
		}).catch(error => {
			console.warn("Failed to start background audio:", error);
		});

		return () => {
			// Cleanup
			if (backgroundAudioRef.current) {
				backgroundAudioRef.current.pause();
				backgroundAudioRef.current = null;
			}
			audioStartedRef.current = false;
		};
	}, [currentSongAudioUrl]);

	// Simple pause/resume control - NO time syncing
	useEffect(() => {
		if (!backgroundAudioRef.current || !audioStartedRef.current) {
			return;
		}

		const audio = backgroundAudioRef.current;
		
		if (gameState === "PLAYING") {
			if (audio.paused) {
				audio.play().catch(error => {
					console.warn("Audio resume failed:", error);
				});
			}
		} else if (gameState === "PAUSED") {
			if (!audio.paused) {
				audio.pause();
			}
		}
	}, [gameState]);



	const fallingNotes: IFallingNote[] = (currentSong || []).map((n) => {
		// Find the constant-key (e.g., "Q", "E", "Z") whose `note` char matches the saved value
		const entry = Object.entries(notes).find(([, v]) => v.note.toLowerCase() === n.note.toLowerCase());
		const keyName = entry ? entry[0] : n.note; // fallback to original if not found

		return {
			note: keyName,
			offset: n.offset,
			type: n.type,
			time: n.displayAftertimeSeconds,
			duration: 1,
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
						<InteractivePianoCanvas
							notes={fallingNotes}
							currentTime={currentTime}
							width={800}
							height={400}
							hasBackgroundAudio={!!currentSongAudioUrl}
						/>
					</Box>
				</Box>
			</Slide>
		</Box>
	);
};
