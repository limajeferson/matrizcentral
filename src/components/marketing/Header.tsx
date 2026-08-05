"use client";

import { useState } from "react";
import { IconMenu, IconClose } from "@/components/marketing/v2/icons";
import Logo from "@/components/brand/Logo";

interface HeaderProps {
  ctaLabel?: string;
  ctaHref?: string;
}

export default function Header({ ctaLabel = "Ver preço", ctaHref = "/oferta" }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="container nav">
        {/* Wordmark como fragment, sem <span> extra: `.lp-guide .logo span`
            (landing-clone.css:61) pinta QUALQUER span descendente com o acento —
            um wrapper a mais deixaria o nome inteiro violeta. */}
        <Logo size={22} className="logo">
          <>
            Matriz<span>/</span>Central
          </>
        </Logo>
        <ul className="nav-links">
          <li>
            <a href="/#sistema">O sistema</a>
          </li>
          <li>
            <a href="/#preco">Preço</a>
          </li>
        </ul>
        <div className="nav-actions">
          <a className="btn btn-accent nav-cta-desktop" href={ctaHref}>
            {ctaLabel}
          </a>
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="nav-mobile-panel">
          <a href="/#sistema" onClick={() => setOpen(false)}>
            O sistema
          </a>
          <a href="/#preco" onClick={() => setOpen(false)}>
            Preço
          </a>
          <a className="btn btn-accent" href={ctaHref} onClick={() => setOpen(false)}>
            {ctaLabel}
          </a>
        </div>
      )}
    </header>
  );
}
