"use client";

import { useState } from "react";
import { buildShareUrl, isTokenizedPath } from "@/lib/share";
import { IconWhatsApp, IconXTwitter, IconLinkedIn, IconShare } from "@/components/ui/icons";

export type ShareLinksProps = {
  url: string;
  text: string;
};

const ICON_BUTTON_CLASS =
  "rounded-full border border-border p-2 text-muted-foreground transition hover:border-violet-600 hover:text-violet-600";

/**
 * Linha de compartilhamento social. Nunca renderiza se `url` for um caminho
 * tokenizado (/dashboard/<token>/...) — essas URLs dão acesso à conta e não
 * podem ser compartilhadas.
 */
export function ShareLinks({ url, text }: ShareLinksProps) {
  const [copied, setCopied] = useState(false);

  if (isTokenizedPath(url)) return null;

  const openShare = (platform: "whatsapp" | "x" | "linkedin") => {
    window.open(buildShareUrl(platform, url, text), "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Falha silenciosa (ex.: permissão negada) — sem feedback de erro por ora.
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: text, url });
    } catch {
      // Usuário cancelou o compartilhamento nativo — não é um erro.
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Compartilhar</span>

      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Compartilhar"
          className={ICON_BUTTON_CLASS}
        >
          <IconShare size={16} />
        </button>
      )}

      <button
        type="button"
        onClick={() => openShare("whatsapp")}
        aria-label="Compartilhar no WhatsApp"
        className={ICON_BUTTON_CLASS}
      >
        <IconWhatsApp size={16} />
      </button>

      <button
        type="button"
        onClick={() => openShare("x")}
        aria-label="Compartilhar no X"
        className={ICON_BUTTON_CLASS}
      >
        <IconXTwitter size={16} />
      </button>

      <button
        type="button"
        onClick={() => openShare("linkedin")}
        aria-label="Compartilhar no LinkedIn"
        className={ICON_BUTTON_CLASS}
      >
        <IconLinkedIn size={16} />
      </button>

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar link"
        className={ICON_BUTTON_CLASS}
      >
        <IconShare size={16} />
      </button>
      <span aria-live="polite" className="text-sm text-muted-foreground">
        {copied ? "Copiado!" : ""}
      </span>
    </div>
  );
}

export default ShareLinks;
