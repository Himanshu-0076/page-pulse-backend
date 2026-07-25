/**
 * Counts words in text and calculates estimated reading time in minutes.
 * @param {string} text 
 * @returns {{ wordCount: number, readingTimeMinutes: number }}
 */
function countWords(text) {
  if (!text || typeof text !== 'string') {
    return { wordCount: 0, readingTimeMinutes: 0 };
  }

  // Remove scripts, styles, extra whitespace
  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    return { wordCount: 0, readingTimeMinutes: 0 };
  }

  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  // Average reading speed: 200 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    wordCount,
    readingTimeMinutes
  };
}

module.exports = { countWords };
