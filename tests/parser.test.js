const { parseHtml } = require('../src/services/parseHtml');

describe('HTML Parser Service Test Suite', () => {

  const sampleHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Awesome Sample Web Page | Health Test</title>
      <meta name="description" content="This is a test description for verifying HTML parsing performance and SEO metadata extraction." />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href="https://example.com/awesome-page" />
      <meta property="og:title" content="Awesome OG Title" />
      <meta property="og:image" content="https://example.com/og.jpg" />
    </head>
    <body>
      <h1>Main Headline of the Page</h1>
      <h2>Subheading 1</h2>
      <h2>Subheading 2</h2>
      <h3>Minor section</h3>

      <p>Welcome to our sample page. Here is a description of our product.</p>

      <img src="banner.jpg" alt="Company Banner" />
      <img src="logo.png" />

      <a href="https://example.com/about">Internal Link</a>
      <a href="https://external.org" rel="nofollow">External Link</a>
    </body>
    </html>
  `;

  test('should parse page title, meta description, and canonical URL', () => {
    const result = parseHtml(sampleHtml, 'https://example.com/awesome-page');

    expect(result.seo.hasTitle).toBe(true);
    expect(result.seo.title).toBe('Awesome Sample Web Page | Health Test');
    expect(result.seo.hasDescription).toBe(true);
    expect(result.seo.description).toContain('This is a test description');
    expect(result.seo.hasCanonical).toBe(true);
    expect(result.seo.canonicalUrl).toBe('https://example.com/awesome-page');
    expect(result.seo.hasOgTags).toBe(true);
  });

  test('should parse headings correctly', () => {
    const result = parseHtml(sampleHtml, 'https://example.com/awesome-page');

    expect(result.headings.h1Count).toBe(1);
    expect(result.headings.h1Texts[0]).toBe('Main Headline of the Page');
    expect(result.headings.h2Count).toBe(2);
    expect(result.headings.h3Count).toBe(1);
  });

  test('should parse images and missing alt counts', () => {
    const result = parseHtml(sampleHtml, 'https://example.com/awesome-page');

    expect(result.images.totalImages).toBe(2);
    expect(result.images.missingAltCount).toBe(1);
  });

  test('should parse links and categorize internal vs external', () => {
    const result = parseHtml(sampleHtml, 'https://example.com/awesome-page');

    expect(result.links.totalLinks).toBe(2);
    expect(result.links.internalLinksCount).toBe(1);
    expect(result.links.externalLinksCount).toBe(1);
    expect(result.links.nofollowCount).toBe(1);
  });

});
