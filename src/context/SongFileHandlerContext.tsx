import { useState, useRef, useEffect, useContext, createContext } from "react";
import WaveSurfer from "wavesurfer.js";
import { useSongEditor } from "./SongEditorContext";

interface SongFileHandlerContextValue {
	currentTime: number;
	isPlaying: boolean;
	audioFile: File | null;
	duration: number;

	waveformRef: React.RefObject<HTMLDivElement>;

	actions: {
		handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
		togglePlayback: () => void;
		stopPlayback: () => void;
		skipTime: (seconds: number) => void;
		setAudioFile: (file: File | null) => void;
		setDuration: (duration: number) => void;
		loadImportedAudioFile: (file: File, duration: number) => void;
	};
}

const SongFileHandlerContext = createContext<SongFileHandlerContextValue | undefined>(undefined);

const SongFileHandlerProvider = ({ children }: { children: React.ReactNode }) => {
	const {
		actions: { setError, setSuccess },
	} = useSongEditor();

	// State
	const [currentTime, setCurrentTime] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [duration, setDuration] = useState(0);

	// Refs
	const waveformRef = useRef<HTMLDivElement>(null);
	const wavesurfer = useRef<WaveSurfer | null>(null);
	const lastTimeRef = useRef<number>(0);

	const initializeWaveSurfer = () => {
		if (!waveformRef.current) return null;

		const ws = WaveSurfer.create({
			container: waveformRef.current,
			waveColor: "#4fc3f7",
			progressColor: "#29b6f6",
			cursorColor: "#ff5722",
			barWidth: 2,
			barRadius: 3,
			height: 60,
			normalize: true,
			backend: "WebAudio",
			interact: true,
		});

		// Event handlers for time updates and interactions
		ws.on("audioprocess", (time: number) => {
			setCurrentTime(time);
			lastTimeRef.current = time;
		});

		ws.on("click", (progress: number) => {
			const duration = ws.getDuration();
			const time = progress * duration;
			setCurrentTime(time);
			lastTimeRef.current = time;
		});

		ws.on("play", () => {
			setIsPlaying(true);
		});

		ws.on("pause", () => {
			setIsPlaying(false);
		});

		ws.on("finish", () => {
			setIsPlaying(false);
			setCurrentTime(0);
		});

		ws.on("ready", () => {
			setDuration(ws.getDuration());
		});

		ws.on("error", (error: Error) => {
			setError(`Audio error: ${error.message}`);
			setIsPlaying(false);
		});

		return ws;
	};

	// Initialize WaveSurfer
	useEffect(() => {
		if (waveformRef.current && !wavesurfer.current) {
			wavesurfer.current = initializeWaveSurfer();
		}

		return () => {
			if (wavesurfer.current) {
				wavesurfer.current.destroy();
				wavesurfer.current = null;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const seekToTime = (time: number) => {
		if (!wavesurfer.current || duration === 0) return;

		// Clamp the time to valid range
		const clampedTime = Math.max(0, Math.min(duration, time));

		// Calculate seek position as a percentage (0 to 1)
		const seekPosition = clampedTime / duration;

		// Seek to the position
		wavesurfer.current.seekTo(seekPosition);

		// Update current time immediately for better UX
		setCurrentTime(clampedTime);
	};

	const skipTime = (seconds: number) => {
		const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
		seekToTime(newTime);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("audio/")) {
			setError("Please select a valid audio file");
			return;
		}

		setAudioFile(file);

		try {
			setCurrentTime(0);
			setIsPlaying(false);

			if (wavesurfer.current) {
				wavesurfer.current.destroy();
				wavesurfer.current = null;
			}

			wavesurfer.current = initializeWaveSurfer();

			if (wavesurfer.current) {
				const url = URL.createObjectURL(file);
				wavesurfer.current.load(url);
			}

			setSuccess("Audio file loaded successfully!");
		} catch (error) {
			console.error("Error loading audio file:", error);
			setError("Failed to load audio file. Please try again.");
		}
	};

	// New function to load imported audio files properly
	const loadImportedAudioFile = (file: File, importedDuration: number) => {
		setAudioFile(file);

		try {
			setCurrentTime(0);
			setIsPlaying(false);

			if (wavesurfer.current) {
				wavesurfer.current.destroy();
				wavesurfer.current = null;
			}

			wavesurfer.current = initializeWaveSurfer();

			if (wavesurfer.current) {
				const url = URL.createObjectURL(file);
				wavesurfer.current.load(url);

				// Set the imported duration immediately
				setDuration(importedDuration);
			}

			setSuccess("Imported audio file loaded successfully!");
		} catch (error) {
			console.error("Error loading imported audio file:", error);
			setError("Failed to load imported audio file. Please try again.");
		}
	};

	const togglePlayback = () => {
		if (!wavesurfer.current || !audioFile) {
			setError("Please upload an audio file first");
			return;
		}

		if (isPlaying) {
			wavesurfer.current.pause();
		} else {
			wavesurfer.current.play();
		}
	};

	const stopPlayback = () => {
		if (!wavesurfer.current) return;
		wavesurfer.current.stop();
		setCurrentTime(0);
		setIsPlaying(false);
	};

	const contextValue: SongFileHandlerContextValue = {
		currentTime,
		isPlaying,
		audioFile,
		duration,

		waveformRef,

		actions: {
			handleFileUpload,
			togglePlayback,
			stopPlayback,
			skipTime,
			setAudioFile,
			setDuration,
			loadImportedAudioFile,
		},
	};

	return <SongFileHandlerContext.Provider value={contextValue}>{children}</SongFileHandlerContext.Provider>;
};

const useSongFileHandler = () => {
	const ctx = useContext(SongFileHandlerContext);
	if (!ctx) {
		throw new Error("useSongFileHandler must be used within a SongFileHandlerProvider");
	}
	return ctx;
};

// eslint-disable-next-line react-refresh/only-export-components
export { SongFileHandlerProvider, useSongFileHandler };
