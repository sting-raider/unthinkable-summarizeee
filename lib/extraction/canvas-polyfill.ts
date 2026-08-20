// Polyfill for client-side PDF.js canvas reference in Next.js Turbopack
const canvasPolyfill = {};

export default canvasPolyfill;
export const createCanvas = () => null;
