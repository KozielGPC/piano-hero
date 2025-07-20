import { Card, CardContent, Typography, Stack, Button } from "@mui/material";
import { GetApp, PlayArrow } from "@mui/icons-material";
import { useState } from "react";
import { SongData } from "../../types";
import { INotes } from "../../../../utils/interfaces";

interface ExportControlsProps {
	songData: SongData;
	exportSong: (songData: SongData) => Promise<void>;
	playSong: (songData: SongData, onPlaySong: (gameNotes: INotes[], audioUrl?: string) => void) => void;
	onPlaySong: (gameNotes: INotes[], audioUrl?: string) => void;
}

export const ExportControls = ({ songData, exportSong, playSong, onPlaySong }: ExportControlsProps) => {
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
						disabled={!songData.name.trim() || songData.notes.length === 0 || !songData.audioFile || isExporting}
					>
						{isExporting ? 'Exporting...' : 'Export Song with Audio'}
					</Button>
					<Button
						variant="contained"
						color="secondary"
						startIcon={<PlayArrow />}
						onClick={() => playSong(songData, onPlaySong)}
						disabled={!songData.name.trim() || songData.notes.length === 0}
					>
						Play Song
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
};
