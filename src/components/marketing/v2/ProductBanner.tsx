"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface ProductBannerProps {
  icon: string;
  label: string;
  description: string;
  index: number;
}

export default function ProductBanner({ icon, label, description, index }: ProductBannerProps) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      className="mc-product-banner"
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="mc-product-banner-aurora" aria-hidden="true" />
      <div className="mc-product-banner-grid" aria-hidden="true" />
      <div className="mc-product-banner-content">
        <span className="mc-product-banner-icon" aria-hidden="true">
          {icon}
        </span>
        <div className="mc-product-banner-text">
          <h3 className="mc-display">{label}</h3>
          <p>{description}</p>
        </div>
        <span className="mc-product-banner-index mc-mono">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </motion.article>
  );
}
