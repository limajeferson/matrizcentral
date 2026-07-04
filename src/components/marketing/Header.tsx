"use client";

import { useState } from "react";

interface HeaderProps {
  ctaLabel?: string;
  ctaHref?: string;
}

export default function Header({ ctaLabel = "Ver preço", ctaHref = "/oferta" }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="container nav">
        <span className="logo">
          Matriz<span>/</span>Central
        </span>
        <ul className="nav-links">
          <li>
            <a href="/#features">Features</a>
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
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <div className="nav-mobile-panel">
          <a href="/#features" onClick={() => setOpen(false)}>
            Features
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
