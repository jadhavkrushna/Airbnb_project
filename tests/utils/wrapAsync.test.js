test('hello world!', async () => {
	const result = await wrapAsync(() => Promise.resolve('Hello, World!'));
	expect(result).toBe('Hello, World!');
});