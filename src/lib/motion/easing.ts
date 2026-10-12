// The same curves as the motion tokens in globals.css, for framer-motion.
// framer-motion's tween default is ease-in-out, which starts slow: an
// entrance on that curve spends its first frames barely moving, exactly
// when the eye is on it. Anything entering or answering a tap uses EASE_OUT.
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
export const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];
