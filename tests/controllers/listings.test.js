const request = require('supertest');
const app = require('../../app');

describe('Listings Controller', () => {
    it('should return a list of listings', async () => {
        const response = await request(app).get('/listings');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});