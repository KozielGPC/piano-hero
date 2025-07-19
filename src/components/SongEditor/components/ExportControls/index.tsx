import { Card, CardContent, Typography, Stack, Button } from "@mui/material";
import { GetApp, PlayArrow } from "@mui/icons-material";
import { SongData } from "../../types";

interface ExportControlsProps {
	songData: SongData;
	exportSong: () => void;
	playSong: () => void;
}

export const ExportControls = ({ songData, exportSong, playSong }: ExportControlsProps) => {
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
						onClick={exportSong}
						disabled={!songData.name.trim() || songData.notes.length === 0}
					>
						Export Song Data
					</Button>
					<Button
						variant="contained"
						color="secondary"
						startIcon={<PlayArrow />}
						onClick={playSong}
						disabled={!songData.name.trim() || songData.notes.length === 0}
					>
						Play Song
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
};
