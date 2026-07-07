export interface FooterLink {
  label: string;
  href?: string;
  soon?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

// Coluna 1 (Marca) é markup fixo em FooterV2.tsx. Aqui só as colunas 2–6.
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Plataforma",
    links: [
      { label: "O Sistema", href: "/#sistema" },
      { label: "Como Funciona", href: "/#processo" },
      { label: "Preço", href: "/#preco" },
      { label: "Certificação", soon: true },
      { label: "FAQ", href: "/#faq" },
      { label: "Oferta", href: "/oferta" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Blog", soon: true },
      { label: "Artigos", soon: true },
      { label: "Guias", soon: true },
      { label: "Novidades", soon: true },
      { label: "Feed Educacional", soon: true },
      { label: "Catálogo", soon: true },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Central de Ajuda", soon: true },
      { label: "Contato", soon: true },
      { label: "Garantia", href: "/legal/termos#garantia" },
      { label: "Política de Reembolso", href: "/legal/termos#reembolso" },
      { label: "Status da Plataforma", soon: true },
      { label: "Perguntas Frequentes", href: "/#faq" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "Nossa História", href: "/sobre#historia" },
      { label: "Missão", href: "/sobre#missao" },
      { label: "Visão", href: "/sobre#visao" },
      { label: "Valores", href: "/sobre#valores" },
      { label: "Parceiros", soon: true },
      { label: "Trabalhe Conosco", soon: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidade", href: "/legal/privacidade" },
      { label: "Termos de Uso", href: "/legal/termos" },
      { label: "Cookies", href: "/legal/privacidade#cookies" },
      { label: "LGPD", href: "/legal/privacidade#lgpd" },
      { label: "Licenciamento", href: "/legal/termos#licenciamento" },
      { label: "Direitos Autorais", href: "/legal/termos#direitos" },
    ],
  },
];
