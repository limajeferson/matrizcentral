"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQ_ITEMS } from "./faq-data";
import { Reveal } from "./motion-primitives";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mc-section" id="faq">
      <div className="mc-container">
        <div className="mc-block-accent mc-faq">
          <Reveal>
            <span className="mc-tag">FAQ</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mc-display">Perguntas frequentes</h2>
          </Reveal>
          <div className="mc-faq-list">
            {FAQ_ITEMS.map((item, i) => {
              const open = openIndex === i;
              return (
                <div className="mc-faq-item" key={item.question}>
                  <button
                    type="button"
                    className="mc-faq-question"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    {item.question}
                    <span aria-hidden="true">{open ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="mc-faq-answer">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
