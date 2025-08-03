import { Delete, Edit } from "@mui/icons-material";
import {
	Card,
	CardContent,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	Typography,
} from "@mui/material";
import { formatTime } from "../../utils";
import React from "react";
import { useSongEditor } from "../../../../context/SongEditorContext";

export const NotesList = () => {
	const {
		songData,
		actions: { setEditingNote, setEditDialogOpen, deleteNote },
	} = useSongEditor();
	return (
		<Card elevation={3} sx={{ mb: 3 }}>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Notes Timeline ({songData.notes.length} notes)
				</Typography>
				{songData.notes.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						No notes added yet. Upload an audio file and start adding notes!
					</Typography>
				) : (
					<List>
						{songData.notes.map((note, index) => (
							<React.Fragment key={note.id}>
								<ListItem>
									<ListItemText
										primary={`${note.keys.join(", ")} - ${formatTime(note.time)}`}
										secondary={`Duration: ${note.duration}s | Keys: ${note.keys.length}`}
									/>
									<ListItemSecondaryAction>
										<IconButton
											onClick={() => {
												setEditingNote(note);
												setEditDialogOpen(true);
											}}
										>
											<Edit />
										</IconButton>
										<IconButton onClick={() => deleteNote(note.id)}>
											<Delete />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
								{index < songData.notes.length - 1 && <Divider />}
							</React.Fragment>
						))}
					</List>
				)}
			</CardContent>
		</Card>
	);
};
