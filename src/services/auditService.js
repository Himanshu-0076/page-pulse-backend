const { fetchPage } = require('./fetchPage');
const { parseHtml } = require('./parseHtml');

/**
 * Evaluates full page audit, calculates score and categorizes recommendations.
 * @param {string} url 
 * @returns {Promise<object>} Complete audit report
 */
async function performAudit(url) {
  // 1. Fetch raw page
  const fetchResult = await fetchPage(url);
  const { html, responseTimeMs, statusCode, contentLengthBytes, finalUrl } = fetchResult;

  // 2. Parse HTML features
  const parsedData = parseHtml(html, finalUrl);

  // 3. Calculate Score & Categorize Rules
  let score = 100;
  const passes = [];
  const warnings = [];
  const issues = [];

  const { seo, headings, images, links, content, security } = parsedData;

  // Rule: Title Tag
  if (!seo.hasTitle) {
    score -= 15;
    issues.push({ id: 'TITLE_MISSING', title: 'Missing Title Tag', description: 'Page lacks a <title> tag, which is essential for SEO.' });
  } else if (seo.titleLength < 10) {
    score -= 5;
    warnings.push({ id: 'TITLE_SHORT', title: 'Title Tag is Too Short', description: `Title length is ${seo.titleLength} characters (recommended: 30-60 characters).` });
  } else if (seo.titleLength > 70) {
    score -= 5;
    warnings.push({ id: 'TITLE_LONG', title: 'Title Tag is Too Long', description: `Title length is ${seo.titleLength} characters (recommended: 30-60 characters).` });
  } else {
    passes.push({ id: 'TITLE_OK', title: 'Optimal Title Tag Length', description: `Title length is ${seo.titleLength} characters.` });
  }

  // Rule: Meta Description
  if (!seo.hasDescription) {
    score -= 15;
    issues.push({ id: 'META_DESC_MISSING', title: 'Missing Meta Description', description: 'Page lacks a meta description tag used by search engines for snippet generation.' });
  } else if (seo.descriptionLength < 50) {
    score -= 5;
    warnings.push({ id: 'META_DESC_SHORT', title: 'Meta Description is Too Short', description: `Description length is ${seo.descriptionLength} characters (recommended: 120-160 characters).` });
  } else if (seo.descriptionLength > 170) {
    score -= 5;
    warnings.push({ id: 'META_DESC_LONG', title: 'Meta Description is Too Long', description: `Description length is ${seo.descriptionLength} characters (recommended: 120-160 characters).` });
  } else {
    passes.push({ id: 'META_DESC_OK', title: 'Optimal Meta Description', description: `Description length is ${seo.descriptionLength} characters.` });
  }

  // Rule: H1 Heading Tag
  if (headings.h1Count === 0) {
    score -= 15;
    issues.push({ id: 'H1_MISSING', title: 'Missing <h1> Tag', description: 'No <h1> heading found on the page. Every page should have exactly one main H1 tag.' });
  } else if (headings.h1Count > 1) {
    score -= 5;
    warnings.push({ id: 'H1_MULTIPLE', title: 'Multiple <h1> Tags Found', description: `Found ${headings.h1Count} H1 tags. Best practice recommends having exactly one H1 tag per page.` });
  } else {
    passes.push({ id: 'H1_OK', title: 'Single H1 Tag Present', description: `Heading: "${headings.h1Texts[0] || ''}"` });
  }

  // Rule: Image Alt Attributes
  if (images.totalImages > 0) {
    if (images.missingAltCount > 0) {
      const penalty = Math.min(15, Math.ceil(images.missingAltCount * 2.5));
      score -= penalty;
      warnings.push({
        id: 'IMAGES_ALT_MISSING',
        title: `${images.missingAltCount} Images Missing ALT Attributes`,
        description: `${images.missingAltCount} of ${images.totalImages} images do not have alt text, impacting accessibility and image SEO.`
      });
    } else {
      passes.push({ id: 'IMAGES_ALT_OK', title: 'All Images Have ALT Text', description: `All ${images.totalImages} images include alt text.` });
    }
  } else {
    passes.push({ id: 'IMAGES_NONE', title: 'Image Check', description: 'No image elements detected on page.' });
  }

  // Rule: Response Speed
  if (responseTimeMs > 2500) {
    score -= 10;
    issues.push({ id: 'SPEED_SLOW', title: 'Slow Response Time', description: `Server took ${responseTimeMs}ms to respond (target < 1000ms).` });
  } else if (responseTimeMs > 1000) {
    score -= 5;
    warnings.push({ id: 'SPEED_MODERATE', title: 'Moderate Response Time', description: `Server took ${responseTimeMs}ms to respond.` });
  } else {
    passes.push({ id: 'SPEED_FAST', title: 'Fast Response Time', description: `Server responded quickly in ${responseTimeMs}ms.` });
  }

  // Rule: HTTPS Security
  if (!security.isHttps) {
    score -= 10;
    issues.push({ id: 'SECURITY_HTTP', title: 'Insecure Connection (HTTP)', description: 'Target site is not using secure HTTPS protocol.' });
  } else {
    passes.push({ id: 'SECURITY_HTTPS', title: 'Secure Protocol (HTTPS)', description: 'Target website uses secure SSL/TLS connection.' });
  }

  // Rule: Mobile Viewport
  if (!seo.hasViewport) {
    score -= 10;
    issues.push({ id: 'VIEWPORT_MISSING', title: 'Missing Mobile Viewport Tag', description: 'Page lacks a mobile viewport tag for responsive screen scaling.' });
  } else {
    passes.push({ id: 'VIEWPORT_OK', title: 'Mobile Responsive Viewport', description: `Viewport tag configured: "${seo.viewport}"` });
  }

  // Rule: Canonical Tag
  if (!seo.hasCanonical) {
    warnings.push({ id: 'CANONICAL_MISSING', title: 'Missing Canonical Tag', description: 'No rel="canonical" link specified to prevent duplicate content issues.' });
  } else {
    passes.push({ id: 'CANONICAL_OK', title: 'Canonical Tag Configured', description: `Canonical URL: ${seo.canonicalUrl}` });
  }

  // Rule: OpenGraph Meta Tags
  if (!seo.hasOgTags) {
    warnings.push({ id: 'OG_TAGS_MISSING', title: 'Missing Open Graph Tags', description: 'Page is missing og:title or og:image tags for rich social media sharing.' });
  } else {
    passes.push({ id: 'OG_TAGS_OK', title: 'Open Graph Tags Present', description: 'Page includes social media sharing metadata.' });
  }

  // Ensure score stays within 0 to 100 range
  score = Math.max(0, Math.min(100, score));

  // Determine letter grade
  let grade = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';

  return {
    status: statusCode,
    responseTime: responseTimeMs,
    title: seo.title,
    metaDescription: seo.description,
    h1Count: headings.h1Count,
    missingAltImages: images.missingAltCount,
    wordCount: content.wordCount,
    url,
    finalUrl,
    timestamp: new Date().toISOString(),
    score,
    grade,
    summary: {
      totalChecks: passes.length + warnings.length + issues.length,
      passedCount: passes.length,
      warningCount: warnings.length,
      issueCount: issues.length
    },
    performance: {
      responseTimeMs,
      statusCode,
      contentLengthBytes,
      formattedSize: `${(contentLengthBytes / 1024).toFixed(2)} KB`
    },
    seo,
    headings,
    images,
    links,
    content,
    security,
    passes,
    warnings,
    issues
  };
}

module.exports = { performAudit };
