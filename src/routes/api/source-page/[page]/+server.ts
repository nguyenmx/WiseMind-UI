import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

const BACKEND_URL = env.OPENAI_API_BASE_URL ?? "http://localhost:5001";

/** GET /api/source-page/[page]?search=<content>
 *  Returns { page, pdf_page, image_url (client-usable), image_size, layouts, highlight_bboxes }
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const pageNum = parseInt(params.page, 10);
	if (isNaN(pageNum) || pageNum < 1) {
		return json({ error: "Invalid page number" }, { status: 400 });
	}

	// Forward optional `search` query parameter for text highlight
	const search = url.searchParams.get("search") ?? "";
	const backendUrl = search
		? `${BACKEND_URL}/v1/source-page/${pageNum}?search=${encodeURIComponent(search)}`
		: `${BACKEND_URL}/v1/source-page/${pageNum}`;

	try {
		const resp = await fetch(backendUrl);
		if (!resp.ok) {
			return json({ error: `Backend error: ${resp.status}` }, { status: resp.status });
		}
		const data = await resp.json();
		// Rewrite image_url to point to our proxy, using pdf_page (offset-adjusted) not pageNum
		const pdfPage = data.pdf_page ?? pageNum;
		data.image_url = `/api/source-page-img/${pdfPage}`;
		return json(data);
	} catch (e) {
		return json({ error: String(e) }, { status: 500 });
	}
};
