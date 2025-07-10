import { OFFSET_UNIT } from "./constants";

export function getKeyCenterX(offset: number, canvasCenterX: number) {
	return canvasCenterX + offset * OFFSET_UNIT;
}
