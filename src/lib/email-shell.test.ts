import { describe, it, expect } from "vitest";
import { emailShell } from "./email";

describe("emailShell", () => {
  it("usa PNG por URL absoluta (cliente de e-mail nao renderiza SVG)", () => {
    const html = emailShell("<p>oi</p>", "https://www.matrizcentral.com.br");
    expect(html).toContain(
      'src="https://www.matrizcentral.com.br/brand/mc-avatar-800.png"'
    );
    expect(html).not.toContain("<svg");
    expect(html).not.toContain(".svg");
  });

  it("omite a imagem quando nao ha URL base (src relativo quebraria)", () => {
    const html = emailShell("<p>oi</p>", undefined);
    expect(html).not.toContain("<img");
    expect(html).toContain("Central");
  });

  it("preserva o corpo recebido", () => {
    expect(emailShell("<p>corpo &amp; cia</p>", undefined)).toContain(
      "<p>corpo &amp; cia</p>"
    );
  });
});
