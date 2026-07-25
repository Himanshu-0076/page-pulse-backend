const { validateUrl, normalizeUrl } = require('../src/utils/validateUrl');
const { countWords } = require('../src/utils/countWords');
const { countMissingAlt } = require('../src/utils/countMissingAlt');
const cheerio = require('cheerio');

describe('Utility Functions Test Suite', () => {

  describe('validateUrl & normalizeUrl', () => {
    test('should validate correct URLs', () => {
      expect(validateUrl('https://google.com')).toBe(true);
      expect(validateUrl('http://example.org/path?q=1')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('')).toBe(false);
      expect(validateUrl(null)).toBe(false);
    });

    test('should normalize URLs without protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
      expect(normalizeUrl('https://test.dev')).toBe('https://test.dev');
    });
  });

  describe('countWords', () => {
    test('should correctly count words and calculate reading time', () => {
      const text = 'The quick brown fox jumps over the lazy dog near the river bank.';
      const result = countWords(text);
      expect(result.wordCount).toBe(13);
      expect(result.readingTimeMinutes).toBe(1);
    });

    test('should handle empty input gracefully', () => {
      expect(countWords('').wordCount).toBe(0);
      expect(countWords(null).wordCount).toBe(0);
    });
  });

  describe('countMissingAlt', () => {
    test('should detect missing or empty alt tags in Cheerio DOM', () => {
      const html = `
        <html>
          <body>
            <img src="img1.png" alt="Valid alt text" />
            <img src="img2.png" alt="" />
            <img src="img3.png" />
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      const result = countMissingAlt($);

      expect(result.totalImages).toBe(3);
      expect(result.missingAltCount).toBe(2);
      expect(result.altPercentage).toBe(33); // (1 / 3) * 100
    });
  });

});
