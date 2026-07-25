/**
 * Analyzes Cheerio image elements to count missing/empty alt attributes.
 * @param {Function} $ Cheerio static loader instance
 * @returns {{ totalImages: number, missingAltCount: number, altPercentage: number, imagesWithoutAlt: Array<{src: string, alt: string}> }}
 */
function countMissingAlt($) {
  if (!$) {
    return { totalImages: 0, missingAltCount: 0, altPercentage: 100, imagesWithoutAlt: [] };
  }

  const $images = $('img');
  const totalImages = $images.length;
  let missingAltCount = 0;
  const imagesWithoutAlt = [];

  $images.each((_, el) => {
    const alt = $(el).attr('alt');
    const src = $(el).attr('src') || $(el).attr('data-src') || '[no-src]';
    
    // Missing alt attribute or empty string alt attribute
    if (alt === undefined || alt === null || alt.trim() === '') {
      missingAltCount++;
      if (imagesWithoutAlt.length < 10) {
        imagesWithoutAlt.push({ src, alt: alt ?? null });
      }
    }
  });

  const altPercentage = totalImages > 0
    ? Math.round(((totalImages - missingAltCount) / totalImages) * 100)
    : 100;

  return {
    totalImages,
    missingAltCount,
    altPercentage,
    imagesWithoutAlt
  };
}

module.exports = { countMissingAlt };
