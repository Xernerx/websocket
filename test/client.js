/** @format */

import { XernerxWebsocket } from '../dist/main.js';

const client = new (class WS extends XernerxWebsocket {
	constructor() {
		super({
			token: 'HELp06vGWOd7z61rHjBgNOEhTiLG1QscxTw9ddgF5kCvYl8cwMqHQmbjXunsaKAC',
		});
	}
})();

await client.connect();

await client.update('virtue', 'guilds', {
	id: '784094726432489522',
	mode: 'balanced',
});

const user = await client.get('virtue', 'users', {
	id: '123',
});
