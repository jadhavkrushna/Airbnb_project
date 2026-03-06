const request = require('supertest');
const app = require('../../app');

test('hello world!', async () => {
	const response = await request(app).get('/');
	expect(response.statusCode).toBe(200);
	expect(response.text).toBe('Hello World!');
});