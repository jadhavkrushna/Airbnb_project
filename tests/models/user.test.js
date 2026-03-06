const { User } = require('../../models/user');

test('hello world!', () => {
	expect(User).toBeDefined();
});