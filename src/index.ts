/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// 导出一个默认对象，该对象包含一个异步的fetch方法，用于处理HTTP请求
export default {
	// fetch方法接收三个参数：request（请求对象），env（环境变量对象），ctx（上下文对象）
	async fetch(request, env, ctx): Promise<Response> {
		// 创建一个URL对象，用于解析请求的URL
		const url = new URL(request.url);
		// 使用switch语句根据URL的路径名（pathname）来处理不同的请求
		switch (url.pathname) {
			//公告内容
			case '/announcement':
				const announcement = await env.DB.prepare('SELECT content FROM announcement ORDER BY id DESC LIMIT 1').first();
				return new Response(JSON.stringify({ content: announcement?.content }), { headers: { 'Content-Type': 'application/json' } });
			// 店铺列表。如果GET参数id存在，返回该店铺的详细信息
			case '/shop':
				const id = url.searchParams.get('id');
				if (id) {
					const shop = await env.DB.prepare('SELECT * FROM shop WHERE id = ?').bind(id).first();
					if (shop) {
						return new Response(JSON.stringify({ shop }), { headers: { 'Content-Type': 'application/json' } });
					} else {
						return new Response('Shop Not Found', { status: 404 });
					}
				} else {
					const shop = await env.DB.prepare('SELECT * FROM shop').all();
					return new Response(JSON.stringify({ shop: shop.results }), { headers: { 'Content-Type': 'application/json' } });
				}

			// keyword参数的搜索值
			case '/search':
				const keyword = url.searchParams.get('keyword');
				if (keyword) {
					const searchShop = await env.DB.prepare('SELECT * FROM shop WHERE name LIKE ?').bind(`%${keyword}%`).all();
					return new Response(JSON.stringify({ shop: searchShop.results }), { headers: { 'Content-Type': 'application/json' } });
				} else {
					const shop = await env.DB.prepare('SELECT * FROM shop').all();
					return new Response(JSON.stringify({ shop: shop.results }), { headers: { 'Content-Type': 'application/json' } });
				}

			// 错误处理
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>; 