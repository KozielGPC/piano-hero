import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { INotes, IScore } from "../utils/interfaces";
import { getAllSongs, addUploadedSong, importSongFromJSON } from "../utils/songLibrary";

type GameState = "MENU" | "PLAYING" | "PAUSED" | "ENDED" | "LOADING" | "SONG_EDITOR";

interface GameContextValue {
	gameState: GameState;
	selectedSongId: string;
	accuracy: number;
	combo: number;
	maxCombo: number;
	currentTime: number;
	animationRef: React.MutableRefObject<number | undefined>;
	isLoading: boolean;
	loadingMessage: string;
	importError: string;
	importSuccess: string;
	error: string;
	prevScoreRef: React.MutableRefObject<{ correctNotes: number; wrongNotes: number } | null>;
	allSongs: ReturnType<typeof getAllSongs>;
	currentSong: INotes[] | null;
	score: IScore;
	actions: {
		resetScore: () => void;
		handleSongSelect: (id: string) => void;
		handleJSONImport: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
		startGame: () => void;
		pauseGame: () => void;
		resumeGame: () => void;
		stopGame: () => void;
		returnToMenu: () => void;
		playEditorSong: (songNotes: INotes[]) => void;
		setAccuracy: React.Dispatch<React.SetStateAction<number>>;
		setCombo: React.Dispatch<React.SetStateAction<number>>;
		setMaxCombo: React.Dispatch<React.SetStateAction<number>>;
		setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
		setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
		setImportError: React.Dispatch<React.SetStateAction<string>>;
		setImportSuccess: React.Dispatch<React.SetStateAction<string>>;
		setError: React.Dispatch<React.SetStateAction<string>>;
		setGameState: React.Dispatch<React.SetStateAction<GameState>>;
		incrementCorrect: () => void;
		incrementWrong: () => void;
		addPoints: (amount: number) => void;
	};
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [gameState, setGameState] = useState<GameState>("MENU");
	const [selectedSongId, setSelectedSongId] = useState<string>("interstellar");
	const [accuracy, setAccuracy] = useState<number>(0);
	const [combo, setCombo] = useState<number>(0);
	const [maxCombo, setMaxCombo] = useState<number>(0);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const animationRef = useRef<number>();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [loadingMessage] = useState<string>("");
	const [importError, setImportError] = useState<string>("");
	const [importSuccess, setImportSuccess] = useState<string>("");
	const [error, setError] = useState<string>("");
	const prevScoreRef = useRef<{ correctNotes: number; wrongNotes: number } | null>(null);
	const [currentSong, setCurrentSong] = useState<INotes[] | null>(null);

	const [score, setScore] = useState<IScore>({
		correctNotes: 0,
		wrongNotes: 0,
		points: 0,
	});

	const resetScore = () => {
		setScore({ correctNotes: 0, wrongNotes: 0, points: 0 });
	};

	const allSongs = getAllSongs();

	const handleSongSelect = (songId: string) => {
		setSelectedSongId(songId);
		const song = allSongs[songId];
		if (song) {
			setCurrentSong(song.notes);
		}
	};

	const handleJSONImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsLoading(true);
		setImportError("");
		setImportSuccess("");

		try {
			const fileContent = await file.text();
			const songData = await importSongFromJSON(fileContent);

			await addUploadedSong(songData);

			setImportSuccess(`Successfully imported "${songData.name}" by ${songData.artist}`);

			setSelectedSongId(`uploaded_${Date.now()}`);
		} catch (err) {
			console.error("Import error:", err);
			setImportError(err instanceof Error ? err.message : "Failed to import song");
		} finally {
			setIsLoading(false);
			event.target.value = "";
		}
	};

	const startGame = useCallback(() => {
		if (!selectedSongId) {
			setError("Please select a song first");
			return;
		}

		const selectedSong = allSongs[selectedSongId];
		if (!selectedSong) {
			setError("Selected song not found");
			return;
		}

		setError("");
		setCombo(0);
		setMaxCombo(0);
		setAccuracy(0);
		prevScoreRef.current = null;
		setScore({ correctNotes: 0, wrongNotes: 0, points: 0 });
		setCurrentTime(0);

		setCurrentSong(selectedSong.notes);
		setGameState("PLAYING");
	}, [selectedSongId, allSongs, setCurrentSong]);

	const pauseGame = useCallback(() => setGameState("PAUSED"), []);
	const resumeGame = useCallback(() => setGameState("PLAYING"), []);
	const stopGame = useCallback(() => setGameState("ENDED"), []);

	const returnToMenu = useCallback(() => {
		setGameState("MENU");
		setCurrentSong(null);
		setCombo(0);
		setMaxCombo(0);
		setAccuracy(0);
		prevScoreRef.current = null;
		setScore({ correctNotes: 0, wrongNotes: 0, points: 0 });
	}, [setCurrentSong]);

	const playEditorSong = useCallback(
		(songNotes: INotes[]) => {
			setCurrentSong(songNotes);
			setGameState("PLAYING");
		},
		[setCurrentSong],
	);

	const contextValue: GameContextValue = {
		gameState,
		selectedSongId,
		accuracy,
		combo,
		maxCombo,
		currentTime,
		animationRef,
		isLoading,
		loadingMessage,
		importError,
		importSuccess,
		error,
		prevScoreRef,
		allSongs,
		currentSong,
		score,
		actions: {
			resetScore,
			handleSongSelect,
			handleJSONImport,
			startGame,
			pauseGame,
			resumeGame,
			stopGame,
			returnToMenu,
			playEditorSong,
			setAccuracy,
			setCombo,
			setMaxCombo,
			setCurrentTime,
			setIsLoading,
			setImportError,
			setImportSuccess,
			setError,
			setGameState,
			incrementCorrect: () =>
				setScore((prev) => ({ ...prev, correctNotes: prev.correctNotes + 1 })),
			incrementWrong: () =>
				setScore((prev) => ({ ...prev, wrongNotes: prev.wrongNotes + 1 })),
			addPoints: (amount: number) =>
				setScore((prev) => ({ ...prev, points: prev.points + amount })),
		},
	};

	return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

const useGame = () => {
	const ctx = useContext(GameContext);
	if (!ctx) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return ctx;
};

// eslint-disable-next-line react-refresh/only-export-components
export { GameProvider, useGame };
