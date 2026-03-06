const request = require('supertest');
const app = require('../../app');

describe('User Routes', () => {
    it('should return a list of users', async () => {
        const response = await request(app).get('/users');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a new user', async () => {
        const newUser = { name: 'John Doe', email: 'john@example.com' };
        const response = await request(app).post('/users').send(newUser);
        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe(newUser.name);
    });
});