const cheerio = require('cheerio');
const { countWords } = require('../utils/countWords');
const { countMissingAlt } = require('../utils/countMissingAlt');

/**
 * Parses HTML string using Cheerio and extracts structured audit data.
 * @param {string} html
 * @param {string} targetUrl
 * @returns {object} Structured page audit features
 */
function parseHtml(html, targetUrl) {
  const $ = cheerio.load(html || '');

  // 1. Title Analysis
  const $title = $('title');
  const titleText = $title.text().trim();
  const hasTitle = titleText.length > 0;
  const titleLength = titleText.length;

  // 2. Meta Tags Analysis
  const metaDescription = $('meta[name="description" i]').attr('content')?.trim() || 
                          $('meta[property="og:description" i]').attr('content')?.trim() || '';
  const hasDescription = metaDescription.length > 0;
  const descriptionLength = metaDescription.length;

  const metaKeywords = $('meta[name="keywords" i]').attr('content')?.trim() || '';
  const canonicalUrl = $('link[rel="canonical" i]').attr('href')?.trim() || '';
  const hasCanonical = canonicalUrl.length > 0;

  const viewport = $('meta[name="viewport" i]').attr('content')?.trim() || '';
  const hasViewport = viewport.length > 0;

  const robots = $('meta[name="robots" i]').attr('content')?.trim() || '';

  // Open Graph & Social Media Tags
  const ogTitle = $('meta[property="og:title" i]').attr('content')?.trim() || '';
  const ogImage = $('meta[property="og:image" i]').attr('content')?.trim() || '';
  const twitterCard = $('meta[name="twitter:card" i]').attr('content')?.trim() || '';
  const hasOgTags = Boolean(ogTitle || ogImage);

  // 3. Headings Analysis (H1, H2, H3)
  const $h1s = $('h1');
  const h1Count = $h1s.length;
  const h1Texts = [];
  $h1s.each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text && h1Texts.length < 5) h1Texts.push(text);
  });

  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  // 4. Image & Alt Attributes
  const imageMetrics = countMissingAlt($);

  // 5. Links Analysis
  const $links = $('a');
  let internalLinksCount = 0;
  let externalLinksCount = 0;
  let nofollowCount = 0;

  let targetDomain = '';
  try {
    targetDomain = new URL(targetUrl).hostname;
  } catch (err) {
    targetDomain = '';
  }

  $links.each((_, el) => {
    const href = $(el).attr('href');
    const rel = $(el).attr('rel') || '';

    if (rel.toLowerCase().includes('nofollow')) {
      nofollowCount++;
    }

    if (href) {
      if (href.startsWith('#') || href.startsWith('javascript:')) return;
      try {
        const linkUrl = new URL(href, targetUrl);
        if (targetDomain && linkUrl.hostname === targetDomain) {
          internalLinksCount++;
        } else {
          externalLinksCount++;
        }
      } catch (e) {
        // Relative or invalid link
        internalLinksCount++;
      }
    }
  });

  // 6. Text & Word Counts
  // Remove non-visible elements
  $('script, style, noscript, svg, iframe').remove();
  const bodyText = $('body').text() || '';
  const { wordCount, readingTimeMinutes } = countWords(bodyText);

  // 7. Security / Tech Signals
  const isHttps = targetUrl ? targetUrl.toLowerCase().startsWith('https://') : false;
  const hasFavicon = $('link[rel*="icon"]').length > 0;
  const lang = $('html').attr('lang')?.trim() || '';

  return {
    seo: {
      title: titleText,
      hasTitle,
      titleLength,
      description: metaDescription,
      hasDescription,
      descriptionLength,
      metaKeywords,
      canonicalUrl,
      hasCanonical,
      viewport,
      hasViewport,
      robots,
      hasOgTags,
      ogTitle,
      ogImage,
      twitterCard,
      lang
    },
    headings: {
      h1Count,
      h1Texts,
      h2Count,
      h3Count
    },
    images: imageMetrics,
    links: {
      totalLinks: $links.length,
      internalLinksCount,
      externalLinksCount,
      nofollowCount
    },
    content: {
      wordCount,
      readingTimeMinutes
    },
    security: {
      isHttps,
      hasFavicon
    }
  };
}

module.exports = { parseHtml };
