import { Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import { SongData } from "../../types";

interface SongInformationProps {
	songData: SongData;
	setSongData: React.Dispatch<React.SetStateAction<SongData>>;
}

export const SongInformation = ({ songData, setSongData }: SongInformationProps) => {
	return (
		<Card elevation={3} sx={{ mb: 3 }}>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Song Information
				</Typography>
				<Grid container spacing={2}>
					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="Song Name"
							value={songData.name}
							onChange={(e) => setSongData((prev) => ({ ...prev, name: e.target.value }))}
							required
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="Artist"
							value={songData.artist}
							onChange={(e) => setSongData((prev) => ({ ...prev, artist: e.target.value }))}
						/>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};
