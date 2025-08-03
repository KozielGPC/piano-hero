import { Card, CardContent, Typography, Stack, Button } from "@mui/material";
import { GetApp, PlayArrow } from "@mui/icons-material";
import { useState } from "react";
import { useSongExport } from "../../../../hooks/useSongExport";
import { useSongEditor } from "../../../../context/SongEditorContext";
import { useGame } from "../../../../context/GameContext";

export const ExportControls = () => {
	const {
		songData,
		actions: { setError, setSuccess },
	} = useSongEditor();

	const { exportSong, playSong } = useSongExport({
		onError: (errorMessage: string) => {
			setError(errorMessage);
		},
		onSuccess: (successMessage: string) => {
			setSuccess(successMessage);
			setTimeout(() => setSuccess(""), 3000);
		},
	});

	const {
		actions: { playEditorSong },
	} = useGame();

	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			await exportSong(songData);
		} finally {
			setIsExporting(false);
		}
	};
	return (
		<Card elevation={3}>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Export & Test
				</Typography>
				<Stack direction="row" spacing={2}>
					<Button
						variant="contained"
						startIcon={<GetApp />}
						onClick={handleExport}
						disabled={
							!songData.name.trim() || songData.notes.length === 0 || !songData.audioFile || isExporting
						}
					>
						{isExporting ? "Exporting..." : "Export Song with Audio"}
					</Button>
					<Button
						variant="contained"
						color="secondary"
						startIcon={<PlayArrow />}
						onClick={() => playSong(songData, playEditorSong)}
						disabled={!songData.name.trim() || songData.notes.length === 0}
					>
						Play Song
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
};
