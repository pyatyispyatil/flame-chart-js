// Using bitmasking to store each frame's state (INACTIVE, IS_THIRD_PARTY,
// IS_HIGHLIGHTED) for cleaner code (less function arguments passed over and
// over) and performance buy.
//
// More on bitmasking:
// https://www.quora.com/What-is-bitmasking-What-kind-of-problems-can-be-solved-using-it
export const FRAME_FLAG_IS_HIGHLIGHTED = 0x001;
export const FRAME_FLAG_IS_THIRD_PARTY = 0x010;
export const FRAME_FLAG_IS_INACTIVE = 0x100;
