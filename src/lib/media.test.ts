import { describe, it, expect } from "vitest";
import { parseMediaSource, withAutoplay } from "./media";

describe("parseMediaSource", () => {
  it("youtube: watch, youtu.be e embed dão o mesmo id/thumb", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    ]) {
      expect(parseMediaSource(url)).toEqual({
        kind: "youtube",
        id: "dQw4w9WgXcQ",
        embedSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      });
    }
  });
  it("spotify: episode/track = 152, show/playlist = 232; normaliza p/ /embed/", () => {
    expect(parseMediaSource("https://open.spotify.com/episode/abc123DEF")).toEqual({
      kind: "spotify",
      embedSrc: "https://open.spotify.com/embed/episode/abc123DEF",
      height: 152,
    });
    expect(parseMediaSource("https://open.spotify.com/embed/show/xyz789")).toEqual({
      kind: "spotify",
      embedSrc: "https://open.spotify.com/embed/show/xyz789",
      height: 232,
    });
  });
  it("URL desconhecida vira generic; null vira null", () => {
    expect(parseMediaSource("https://example.com/player")).toEqual({
      kind: "generic",
      embedSrc: "https://example.com/player",
    });
    expect(parseMediaSource(null)).toBeNull();
  });
});

describe("withAutoplay", () => {
  it("anexa com ? ou & conforme a URL", () => {
    expect(withAutoplay("https://a.com/e")).toBe("https://a.com/e?autoplay=1");
    expect(withAutoplay("https://a.com/e?x=1")).toBe("https://a.com/e?x=1&autoplay=1");
  });
});
