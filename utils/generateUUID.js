export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;   // Random integer 0-15
    const v = c === "x" ? r : (r & 0x3) | 0x8; // 'y' positions: 8,9,a,b
    return v.toString(16);
  });
};