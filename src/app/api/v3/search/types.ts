export interface MockYouTubeResponse {
  nextPageToken?: string;
  prevPageToken?: string;
  items: Array<{
    videoId: string;
    videoThumbnail: string;
    videoPublishTime: string;
    videoTitle: string;
    channelId: string;
    channelThumbnail: string;
    channelTitle: string;
  }>;
}

type YouTubeSearchItemThumbnail = {
  url: string;
  width: number;
  height: number;
};

export type YouTubeSearchResponse = {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Array<{
    kind: string;
    etag: string;
    id: {
      kind: string;
      videoId: string;
    };
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: YouTubeSearchItemThumbnail;
        medium: YouTubeSearchItemThumbnail;
        high: YouTubeSearchItemThumbnail;
      };
      channelTitle: string;
      liveBroadcastContent: "none" | "live" | "upcoming";
      publishTime: string;
    };
  }>;
};

export type YouTubeChannelsResponse = {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Array<{
    kind: string;
    etag: string;
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl: string;
      publishedAt: string;
      thumbnails: {
        default: YouTubeSearchItemThumbnail;
        medium: YouTubeSearchItemThumbnail;
        high: YouTubeSearchItemThumbnail;
      };
      localized: {
        title: string;
        description: string;
      };
      country: string;
    };
  }>;
};
