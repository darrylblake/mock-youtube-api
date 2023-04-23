import { client } from "~/app/api/client";
import slugify from "slugify";

const generateCacheKey = (q: string | null, pageToken: string | null) => {
  return slugify(`${q}${pageToken ? pageToken : ""}`);
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
        }${pageToken ? `&pageToken=${pageToken}` : ""}`
      );
      const data = await youtubeApiResponse.json();

      await client
        .from("youtube-api-cache")
        // @ts-ignore ???
        .upsert({ id: cacheKey, cache: JSON.stringify(data) });
      return new Response(JSON.stringify(data), { status: 201 });
    } catch (err) {
      console.error(err);
      return new Response("Something went wrong", { status: 501 });
    }
  }
  return new Response(cache.data?.[0].cache as string);
}
