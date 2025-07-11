import { Card, CardContent, Fade, Typography, LinearProgress } from "@mui/material";
import { Speed } from "@mui/icons-material";
import { useGame } from "../../../../../context/GameContext";

export const Loading = () => {
    const { gameState, loadingMessage } = useGame();
    return (
    <Fade in={gameState === "LOADING"} timeout={300}>
        <Card
            elevation={8}
            sx={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                maxWidth: 400,
                width: "100%",
            }}
        >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Speed sx={{ fontSize: 48, color: "#667eea", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {loadingMessage || "Loading..."}
                </Typography>
                <LinearProgress
                    sx={{
                        mt: 2,
                        "& .MuiLinearProgress-bar": {
                            background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        },
                    }}
                />
            </CardContent>
        </Card>
    </Fade>
    );
};