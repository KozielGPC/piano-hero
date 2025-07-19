import { Button, DialogTitle, Dialog, DialogContent, Stack, TextField, DialogActions } from "@mui/material";
import { EditorNote, SongData } from "../../types";

interface EditNoteDialogProps {
	editDialogOpen: boolean;
	setEditDialogOpen: (open: boolean) => void;
	editingNote: EditorNote | null;
	setEditingNote: React.Dispatch<React.SetStateAction<EditorNote | null>>;
	setSongData: React.Dispatch<React.SetStateAction<SongData>>;
}

export const EditNoteDialog = ({ editDialogOpen, setEditDialogOpen, editingNote, setEditingNote, setSongData }: EditNoteDialogProps) => {
	return (
		<Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
			<DialogTitle>Edit Note</DialogTitle>
			<DialogContent>
				{editingNote && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Time (seconds)"
                type="number"
                value={editingNote.time}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, time: parseFloat(e.target.value) || 0 } : null)}
                inputProps={{ min: 0, step: 0.1 }}
                fullWidth
              />
              <TextField
                label="Duration (seconds)"
                type="number"
                value={editingNote.duration}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, duration: parseFloat(e.target.value) || 0.1 } : null)}
                inputProps={{ min: 0.1, step: 0.1 }}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (editingNote) {
                setSongData(prev => ({
                  ...prev,
                  notes: prev.notes.map(note => 
                    note.id === editingNote.id ? editingNote : note
                  ).sort((a, b) => a.time - b.time)
                }));
                setEditDialogOpen(false);
                setEditingNote(null);
              }
            }}
            variant="contained"
          >
            Save Changes
          </Button>
		</DialogActions>
	</Dialog>
);
};