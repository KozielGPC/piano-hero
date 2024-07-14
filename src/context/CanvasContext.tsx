import React, { createContext, useContext, useState, useEffect } from "react";

interface CanvasContextType {
	canvas: fabric.Canvas | null;
	setCanvas: (canvas: fabric.Canvas) => void;
}

const CanvasContext = createContext<CanvasContextType>({
	canvas: null,
	setCanvas: () => {},
});

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
	const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

	useEffect(() => {
		console.log("canvas height", canvas?.getHeight());
	}, [canvas]);

	return (
		<CanvasContext.Provider
			value={{
				canvas,
				setCanvas,
			}}
		>
			{children}
		</CanvasContext.Provider>
	);
};

export const useCanvasContext = () => useContext(CanvasContext);
