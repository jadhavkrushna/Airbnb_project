const request = require('supertest');
const app = require('../../app');

describe('User Controller', () => {
    it('should respond with a 200 status for GET /users', async () => {
        const response = await request(app).get('/users');
        expect(response.status).toBe(200);
    });
    
    it('should create a new user with POST /users', async () => {
        const response = await request(app).post('/users').send({ name: 'John Doe' });
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('John Doe');
    });
});