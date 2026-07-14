import { describe, it, expect } from "vitest";
import { contentIconName } from "./content-icons";

describe("contentIconName", () => {
  it("relatorio -> report", () => {
    expect(contentIconName("relatorio")).toBe("report");
  });
  it("podcast -> podcast", () => {
    expect(contentIconName("podcast")).toBe("podcast");
  });
  it("video -> video", () => {
    expect(contentIconName("video")).toBe("video");
  });
  it("pesquisa -> survey", () => {
    expect(contentIconName("pesquisa")).toBe("survey");
  });
});
