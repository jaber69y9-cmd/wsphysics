export const safeJson = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return null;
  }
};
