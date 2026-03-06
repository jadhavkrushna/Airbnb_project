class ExpressError extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	}
}

test('ExpressError should create an error with a message and status', () => {
	const error = new ExpressError('Not Found', 404);
	expect(error.message).toBe('Not Found');
	expect(error.status).toBe(404);
});