import { Card, CardContent, Typography, Button, Stack, IconButton, Box } from "@mui/material";
import { formatTime } from "../../utils";
import { Upload, SkipPrevious, Pause, PlayArrow, Stop, SkipNext } from "@mui/icons-material";
import { useSongFileHandler } from "../../../../context/SongFileHandlerContext";
import { useSongEditor } from "../../../../context/SongEditorContext";

export const AudioUpload = () => {
	const { songData } = useSongEditor();

	const {
		currentTime,
		isPlaying,
		waveformRef,
		actions: { handleFileUpload, togglePlayback, stopPlayback, skipTime },
	} = useSongFileHandler();

	return (
		<Card elevation={3} sx={{ mb: 3 }}>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Audio File
				</Typography>
				<input
					type="file"
					accept="audio/*"
					onChange={handleFileUpload}
					style={{ display: "none" }}
					id="audio-upload"
				/>
				<label htmlFor="audio-upload">
					<Button variant="outlined" component="span" startIcon={<Upload />} sx={{ mb: 2 }}>
						Upload Audio File
					</Button>
				</label>
				{songData.audioFile && (
					<Typography variant="body2" color="text.secondary">
						Loaded: {songData.audioFile.name} ({formatTime(songData.duration)})
					</Typography>
				)}

				{/* Waveform */}
				<Box ref={waveformRef} sx={{ mt: 2, mb: 2 }} />

				{/* Audio Controls */}
				<Stack direction="row" spacing={1} alignItems="center">
					<IconButton onClick={() => skipTime(-10)} disabled={!songData.audioFile}>
						<SkipPrevious />
					</IconButton>
					<IconButton onClick={togglePlayback} disabled={!songData.audioFile}>
						{isPlaying ? <Pause /> : <PlayArrow />}
					</IconButton>
					<IconButton onClick={stopPlayback} disabled={!songData.audioFile}>
						<Stop />
					</IconButton>
					<IconButton onClick={() => skipTime(10)} disabled={!songData.audioFile}>
						<SkipNext />
					</IconButton>
					<Typography variant="body2" sx={{ ml: 2 }}>
						{formatTime(currentTime)} / {formatTime(songData.duration)}
					</Typography>
				</Stack>
			</CardContent>
		</Card>
	);
};
