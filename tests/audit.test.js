const request = require('supertest');
const app = require('../src/app');
const { fetchPage } = require('../src/services/fetchPage');

// Mock fetchPage service for controlled testing
jest.mock('../src/services/fetchPage', () => ({
  fetchPage: jest.fn()
}));

describe('API Audit Endpoints & Parsing Requirements Test Suite', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('online');
  });

  test('1. Successful Parsing: POST /api/audit returns expected fields', async () => {
    fetchPage.mockResolvedValueOnce({
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Example Domain</title>
          <meta name="description" content="This is an example description for testing." />
        </head>
        <body>
          <h1>Main Heading</h1>
          <p>This is a paragraph with several words to test word count.</p>
          <img src="test1.png" alt="Valid Alt" />
          <img src="test2.png" />
          <img src="test3.png" />
        </body>
        </html>
      `,
      responseTimeMs: 250,
      statusCode: 200,
      contentLengthBytes: 450,
      finalUrl: 'https://example.com'
    });

    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'https://example.com' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    
    const data = res.body.data;
    expect(data.status).toEqual(200);
    expect(data.responseTime).toEqual(250);
    expect(data.title).toEqual('Example Domain');
    expect(data.metaDescription).toEqual('This is an example description for testing.');
    expect(data.h1Count).toEqual(1);
    expect(data.missingAltImages).toEqual(2);
    expect(data.wordCount).toBeGreaterThan(5);
  });

  test('2. Invalid URL handling: POST /api/audit returns 400', async () => {
    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'invalid-url-string' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('invalid');
  });

  test('3. Non-HTML Response handling: POST /api/audit returns 400', async () => {
    const nonHtmlErr = new Error('Target URL returned non-HTML content (application/pdf)');
    nonHtmlErr.status = 400;
    fetchPage.mockRejectedValueOnce(nonHtmlErr);

    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'https://example.com/file.pdf' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('non-HTML');
  });

});
