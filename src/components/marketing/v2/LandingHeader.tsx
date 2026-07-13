"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrambleText from "./ScrambleText";

const LINKS = [
  { href: "#sistema", label: "O Sistema" },
  { href: "#processo", label: "Como Funciona" },
  { href: "#preco", label: "Preço" },
  { href: "/feed", label: "Feed" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingHeader({
  accountSlot,
}: {
  accountSlot?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mc-header">
        <div className="mc-container mc-header-row">
          <span className="mc-logo mc-display">
            <ScrambleText text="Matriz/Central" />
          </span>
          <div className="mc-header-actions">
            {accountSlot}
            <button
              type="button"
              className="mc-menu-toggle"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`mc-menu-line${open ? " open-top" : ""}`} />
              <span className={`mc-menu-line${open ? " open-bottom" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Renderizado fora do <header> (que tem backdrop-filter) porque um
          ancestral com backdrop-filter vira containing block de descendentes
          position:fixed — isso reduzia este overlay à altura do header. */}
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mc-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            >
              {LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 32 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                >
                  <a
                    className="mc-display"
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
