interface IAgents {
  desktop?: string[];
  mobile?: string[];
}

interface ITrack {
  position: number;
  name: string;
  duration: string | null;
  url: string | null;
}

interface IAlbumData {
  title: string | null;
  artist: string | null;
  artwork: string | null;
  releaseDate: string | null;
  genre: string | null;
  description: string | null;
  url: string;
  tracks: ITrack[];
}

interface IClientOptions {
  agentType?: "desktop" | "mobile";
  timeout?: number;
}

export type { IAgents, ITrack, IAlbumData, IClientOptions };
