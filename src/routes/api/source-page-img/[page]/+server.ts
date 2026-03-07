import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

const BACKEND_URL = env.OPENAI_API_BASE_URL ?? "http://localhost:5001";

/** GET /api/source-page-img/[page]  — proxies the JPEG from the backend */
export const GET: RequestHandler = async ({ params }) => {
	const pageNum = parseInt(params.page, 10);
	if (isNaN(pageNum) || pageNum < 1) {
		return new Response("Invalid page number", { status: 400 });
	}

	try {
		const resp = await fetch(`${BACKEND_URL}/v1/source-page-img/${pageNum}`);
		if (!resp.ok) {
			return new Response(`Backend error: ${resp.status}`, { status: resp.status });
		}
		const blob = await resp.arrayBuffer();
		return new Response(blob, {
			headers: {
				"Content-Type": "image/jpeg",
				"Cache-Control": "no-cache, no-store, must-revalidate", // cache 1 day
			},
		});
	} catch (e) {
		return new Response(String(e), { status: 500 });
	}
};
