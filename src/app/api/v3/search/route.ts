import { client } from "~/app/api/client";
import slugify from "slugify";
import {
  YouTubeSearchResponse,
  YouTubeChannelsResponse,
  MockYouTubeResponse,
} from "./types";
import { allowCorsHeaders } from "./corsHeaders";

const maxResults = process.env.MAX_RESULTS;

const generateCacheKey = (q: string | null, pageToken: string | null) => {
  return slugify(`${q}${pageToken ? pageToken : ""}${maxResults}`);
};

const baseUrl = "https://www.googleapis.com/youtube/v3";

const getSearchResponse = async (
  q: string | null,
  pageToken: string | null
): Promise<MockYouTubeResponse> => {
  const searchResponse = await fetch(
    `${baseUrl}/search?part=snippet&type=video&q=${q}&key=${
      process.env.YOUTUBE_API_KEY
    }${pageToken ? `&pageToken=${pageToken}` : ""}&maxResults=${maxResults}`
  );
  const response: YouTubeSearchResponse = await searchResponse.json();

  const items: MockYouTubeResponse["items"] = await Promise.all(
    response.items.map(async (item) => {
      const itemResponse = await fetch(
        `${baseUrl}/channels?part=snippet&id=${item.snippet.channelId}&key=${process.env.YOUTUBE_API_KEY}`
      );

      const itemResponseData: YouTubeChannelsResponse =
        await itemResponse.json();

      return {
        videoId: item.id.videoId,
        videoThumbnail: item.snippet.thumbnails.high.url,
        videoPublishTime: item.snippet.publishTime,
        videoTitle: item.snippet.title,
        channelId: itemResponseData.items[0]?.id,
        channelThumbnail:
          itemResponseData.items[0]?.snippet.thumbnails.medium.url,
        channelTitle: itemResponseData.items[0]?.snippet.title,
      };
    })
  );

  return {
    nextPageToken: response.nextPageToken,
    prevPageToken: response.prevPageToken,
    items,
  };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const q = queryParams.get("q");
  const pageToken = queryParams.get("pageToken");
  const cacheKey = generateCacheKey(q, pageToken);

  const cache = await client
    .from("youtube-api-cache")
    .select("*")
    .eq("id", cacheKey);

  if (cache.data && cache.data.length === 0) {
    try {
      const data = await getSearchResponse(q, pageToken);
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
