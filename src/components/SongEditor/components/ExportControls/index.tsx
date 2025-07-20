import { Card, CardContent, Typography, Stack, Button } from "@mui/material";
import { GetApp, PlayArrow } from "@mui/icons-material";
import { SongData } from "../../types";
import { INotes } from "../../../../utils/interfaces";

interface ExportControlsProps {
	songData: SongData;
	exportSong: (songData: SongData) => void;
	playSong: (songData: SongData, onPlaySong: (gameNotes: INotes[]) => void) => void;
	onPlaySong: (gameNotes: INotes[]) => void;
}

export const ExportControls = ({ songData, exportSong, playSong, onPlaySong }: ExportControlsProps) => {
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
						onClick={() => exportSong(songData)}
						disabled={!songData.name.trim() || songData.notes.length === 0}
					>
						Export Song Data
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
