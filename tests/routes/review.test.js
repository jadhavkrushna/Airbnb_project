const request = require('supertest');
const app = require('../../app');

describe('Review Routes', () => {
    it('should return a list of reviews', async () => {
        const response = await request(app).get('/reviews');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a new review', async () => {
        const newReview = { title: 'Great product!', content: 'I really enjoyed this.' };
        const response = await request(app).post('/reviews').send(newReview);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newReview.title);
    });
});