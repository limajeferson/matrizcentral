import { describe, it, expect } from "vitest";
import { watermarkCode } from "./Watermark";

describe("watermarkCode", () => {
  it("e deterministico para o mesmo userId", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(watermarkCode(id)).toBe(watermarkCode(id));
  });

  it("remove hifens e usa maiusculas", () => {
    expect(watermarkCode("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")).toBe("AAAAAAAA");
  });

  it("ids diferentes geram codigos diferentes", () => {
    expect(watermarkCode("11111111-0000-0000-0000-000000000000")).not.toBe(
      watermarkCode("22222222-0000-0000-0000-000000000000"),
    );
  });
});
