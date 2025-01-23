export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			//公告内容
			case '/announcement':
				const announcement = await env.DB.prepare('SELECT content FROM announcement ORDER BY id DESC LIMIT 1').first();
				return new Response(JSON.stringify({ content: announcement?.content }), { headers: { 'Content-Type': 'application/json' } });
			// 店铺列表。如果GET参数id存在，返回该店铺的详细信息。对于POST请求，新增店铺信息。
			case '/shop':
				switch (request.method) {
					case 'GET': {
						const id = url.searchParams.get('id');
						if (id) {
							const shop = await env.DB.prepare('SELECT * FROM shop WHERE id = ?').bind(id).first();
							if (!shop)
								return new Response('错误：不存在对应店铺', { status: 404 });

							return new Response(JSON.stringify({
								shop: shop.result
							}), { headers: { 'Content-Type': 'application/json' } });

						} else {
							const shop = await env.DB.prepare('SELECT * FROM shop').all();
							return new Response(JSON.stringify({ shop: shop.results }), { headers: { 'Content-Type': 'application/json' } });
						}
					}
					case 'POST': {
						const jsonData: object = await request.json();
						// 使用类型守卫来检查jsonData是否包含name属性
						if (!('name' in jsonData && 'description' in jsonData && 'image_url_json' in jsonData && 'location' in jsonData && 'is_wx_app_url_direct' in jsonData && 'wx_app_url' in jsonData)) {
							return new Response('错误：请求体缺少必要字段', { status: 405 });
						}

						const { name, description, image_url_json, location, is_wx_app_url_direct, wx_app_url } = jsonData;
						// 插入数据库
						const result = await env.DB.prepare(
							'INSERT INTO shop (name, description, image_url_json, location, is_wx_app_url_direct, wx_app_url) VALUES (?, ?, ?, ?, ?, ?)'
						)
							.bind(name, description, image_url_json, location, is_wx_app_url_direct, wx_app_url).run();

						if (result.success) {
							return new Response(JSON.stringify({ message: `${name} 店铺添加成功` }), { status: 200 });
						} else {
							return new Response(JSON.stringify({ message: `${name} 店铺添加失败` }), { status: 500 });
						}
					}
					default:
						return new Response('错误：请求方法错误', { status: 405 });
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
			// 图片上传/获取
			case '/image':
				switch (request.method) {
					case 'GET': {
						const filename = url.searchParams.get('filename');
						if (!filename)
							return new Response('错误：未指定文件名', { status: 404 });

						const file = await env.image_storage.get(filename);
						if (!file)
							return new Response(`错误：${filename} 文件不存在`, { status: 404 });

						const headers = new Headers();
						file.writeHttpMetadata(headers);
						headers.set("etag", file.httpEtag);

						return new Response(file.body, {
							headers
						});
					}
					case 'POST': {
						const formData = await request.formData();
						const imageName = url.searchParams.get('filename');
						const image = await formData.get('image');
						if (!(image && imageName)) {
							return new Response('错误：图片或图片名称缺失', { status: 400 })
						}
						try {
							await env.image_storage.put(imageName, image);
							const addImage = await env.DB.prepare('INSERT INTO image (name, url) VALUES (?, ?)').bind(imageName, `?filename=${imageName}`).run();

							return new Response(JSON.stringify({ image_url: `?filename=${imageName}` }), { status: 200 });
						} catch (error) {
							return new Response(`错误：${error}`, { status: 500 });
						}
					}
					default:
						return new Response('错误：请求方法错误', { status: 405 });
				}
			default:
				return new Response('错误：接口不存在', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>; 