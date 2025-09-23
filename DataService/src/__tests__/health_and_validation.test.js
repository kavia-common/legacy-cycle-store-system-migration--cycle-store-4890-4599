const request = require('supertest');
const app = require('../app');

describe('Data Service - Health & Validation', () => {
  it('GET / should respond with health object', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/v1/:entity requires auth', async () => {
    const res = await request(app).get('/api/v1/products');
    expect([401, 403]).toContain(res.status);
  });
});
