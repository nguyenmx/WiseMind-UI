import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

const BACKEND_URL = env.OPENAI_API_BASE_URL ?? "http://localhost:5001";

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { message_id, conversation_id, rating, comment } = body;

		if (rating !== 1 && rating !== -1) {
			return json({ error: "rating must be 1 or -1" }, { status: 400 });
		}

		const resp = await fetch(`${BACKEND_URL}/v1/feedback`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message_id, conversation_id, rating, comment }),
		});

		if (!resp.ok) {
			const err = await resp.text();
			return json({ error: err }, { status: resp.status });
		}

		return json({ status: "ok", rating });
	} catch (e) {
		console.error("Feedback proxy error:", e);
		return json({ error: String(e) }, { status: 500 });
	}
};
