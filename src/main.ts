/** @format */

import WebSocket from 'ws';

export default class XernerxWebsocket {
	private ws!: WebSocket;
	private url: string;
	protected readonly token: string;
	private ready = false;

	constructor({ token }: { token: string }) {
		this.url = 'wss://ws.xernerx.com';
		this.token = token;
	}

	public async connect() {
		this.ws = new WebSocket(this.url);

		await new Promise<void>((resolve, reject) => {
			this.ws.on('open', () => resolve());
			this.ws.on('error', reject);
		});

		// 🔐 auth
		const res = await this.request('auth', {
			method: 'POST',
			body: { token: this.token },
		});

		if (!res.success) {
			throw new Error('Authentication failed');
		}

		this.ready = true;
	}

	/* ================= CORE ================= */

	private request(service: string, payload: any): Promise<any> {
		if (!this.ready && service !== 'auth') {
			throw new Error('WebSocket not authenticated');
		}

		return new Promise((resolve, reject) => {
			const handler = (data: WebSocket.RawData) => {
				let msg: any;

				try {
					const text = data.toString();

					if (!text) {
						this.ws.off('message', handler);
						return reject('Empty response');
					}

					msg = JSON.parse(text);
				} catch {
					this.ws.off('message', handler);
					return reject('Invalid JSON response');
				}

				if (!msg || typeof msg !== 'object') {
					this.ws.off('message', handler);
					return reject('Invalid response format');
				}

				this.ws.off('message', handler);

				if (msg.message) {
					reject(msg.message);
				} else {
					// 🔥 normalize empty object → null
					if (Object.keys(msg).length === 0) {
						resolve(null);
					} else {
						resolve(msg);
					}
				}
			};

			this.ws.on('message', handler);

			this.ws.send(
				JSON.stringify({
					service,
					...payload,
				})
			);
		});
	}

	/* ================= CRUD ================= */

	public get(service: string, action: string, body: any = {}) {
		return this.request(service, {
			method: 'GET',
			action,
			body,
		});
	}

	public create(service: string, action: string, body: any = {}) {
		return this.request(service, {
			method: 'POST',
			action,
			body,
		});
	}

	public update(service: string, action: string, body: any = {}) {
		return this.request(service, {
			method: 'PATCH',
			action,
			body,
		});
	}

	public delete(service: string, action: string, body: any = {}) {
		return this.request(service, {
			method: 'DELETE',
			action,
			body,
		});
	}

	public disconnect() {
		this.ws.close();
	}
}
