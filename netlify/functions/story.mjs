import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("syella-story");
  const json = { "content-type": "application/json", "cache-control": "no-store" };

  if (req.method === "GET") {
    const data = await store.get("state");
    return new Response(data || "null", { headers: json });
  }

  if (req.method === "POST") {
    if (req.headers.get("x-pass") !== "1806") {
      return new Response("unauthorized", { status: 401 });
    }
    const body = await req.text();
    if (body.length > 5500000) {
      return new Response("too large", { status: 413 });
    }
    try {
      const d = JSON.parse(body);
      if (!Array.isArray(d.ev) || !Array.isArray(d.ph)) throw new Error("bad");
    } catch (e) {
      return new Response("bad request", { status: 400 });
    }
    await store.set("state", body);
    return new Response("ok");
  }

  return new Response("method not allowed", { status: 405 });
};

export const config = { path: "/api/story" };
