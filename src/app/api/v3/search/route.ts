import { client } from "~/app/api/client";
import slugify from "slugify";

const maxResults = process.env.MAX_RESULTS;

const generateCacheKey = (q: string | null, pageToken: string | null) => {
  return slugify(`${q}${pageToken ? pageToken : ""}${maxResults}`);
};

const allowCorsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  "Access-Control-Allow-Headers":
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const q = queryParams.get("q");
  const pageToken = queryParams.get("pageToken");
  const cacheKey = generateCacheKey(q, pageToken);

  const baseUrl = "https://www.googleapis.com/youtube/v3/search";

  const cache = await client
    .from("youtube-api-cache")
    .select("*")
    .eq("id", cacheKey);

  if (cache.data && cache.data.length === 0) {
    try {
      const youtubeApiResponse = await fetch(
        `${baseUrl}?part=snippet&type=video&maxResults=50&q=${q}&key=${
          process.env.YOUTUBE_API_KEY
        }${pageToken ? `&pageToken=${pageToken}` : ""}&maxResults=${maxResults}`
      );
      const data = await youtubeApiResponse.json();

      await client
        .from("youtube-api-cache")
        // @ts-ignore ???
        .upsert({ id: cacheKey, cache: JSON.stringify(data) });
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: allowCorsHeaders,
      });
    } catch (err) {
      console.error(err);
      return new Response("Something went wrong", { status: 501 });
    }
  }
  return new Response(cache.data?.[0].cache as string, {
    headers: allowCorsHeaders,
  });
}
