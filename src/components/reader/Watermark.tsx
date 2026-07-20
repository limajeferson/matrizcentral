export type WatermarkProps = {
  email: string;
  userId: string;
};

/**
 * Deriva um código curto e estável a partir do id do usuário — não é
 * segredo nem prova de nada sozinho, só torna um print/cópia identificável
 * (atrito + atribuição, não DRM). Determinístico: mesmo usuário, mesmo código.
 */
export function watermarkCode(userId: string): string {
  return userId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/**
 * Rodapé discreto, renderizado por seção. Texto pequeno e de baixo contraste
 * — legível, mas não compete com o conteúdo. Nunca `position: fixed`
 * (cobriria o texto durante a leitura/scroll).
 */
export default function Watermark({ email, userId }: WatermarkProps) {
  return (
    <p className="mt-8 select-text text-xs text-muted-foreground/60">
      Acesso pessoal de {email} · ref. {watermarkCode(userId)}
    </p>
  );
}
