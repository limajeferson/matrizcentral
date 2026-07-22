"use client";
import { useState } from "react";
import { relativeTime } from "@/lib/relative-time";
import type { ReplyNode } from "@/lib/forum-tree";
import ResponderForm from "./ResponderForm";

/** Cap visual de indentação: a partir daqui, respostas continuam aninhadas
 * na árvore, mas o recuo visual congela (evita paredão de indentação infinita).
 * O filho fica DENTRO da div recuada do pai — é justamente esse aninhamento
 * que soma ml-4 por nível; passado MAX_INDENT_DEPTH a classe fica vazia e o
 * recuo para de crescer. */
const MAX_INDENT_DEPTH = 5;

/** Classe constante por nível (1–5): cada profundidade adiciona ml-4.
 * Profundidades > 5 usam classe vazia para capping. */
const INDENT_CLASS = "ml-4 border-l border-border pl-4";

function ReplyNodeItem({ node, topicId }: { node: ReplyNode; topicId: string }) {
  const [replying, setReplying] = useState(false);
  const indentClass = node.depth > 0 && node.depth <= MAX_INDENT_DEPTH ? INDENT_CLASS : "";

  return (
    <div className={indentClass}>
      <div className="rounded-lg border border-border bg-card/60 p-3">
        <div className="flex items-baseline gap-2">
          <p className="text-xs font-medium text-foreground">{node.author}</p>
          <p className="text-xs text-muted-foreground">{relativeTime(node.created_at, new Date())}</p>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{node.body}</p>
        <button
          type="button"
          onClick={() => setReplying((v) => !v)}
          aria-label={replying ? `Cancelar resposta a ${node.author}` : `Responder a ${node.author}`}
          aria-expanded={replying}
          className="mt-2 text-xs font-medium text-violet-600 hover:underline"
        >
          {replying ? "Cancelar" : "Responder"}
        </button>
        {replying && (
          <div className="mt-2">
            <ResponderForm topicId={topicId} parentReplyId={node.id} />
          </div>
        )}
      </div>

      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <ReplyNodeItem key={child.id} node={child} topicId={topicId} />
          ))}
        </div>
      )}
    </div>
  );
}

export type ReplyThreadProps = { nodes: ReplyNode[]; topicId: string };

/** Thread recursiva de respostas do fórum (estilo reddit-nested-thread):
 * renderiza `nodes` em árvore, com "Responder" inline abrindo um
 * ResponderForm com parentReplyId, e recuo por depth capado em
 * MAX_INDENT_DEPTH. */
export default function ReplyThread({ nodes, topicId }: ReplyThreadProps) {
  if (nodes.length === 0) {
    return <p className="text-sm text-muted-foreground">Seja o primeiro a responder.</p>;
  }
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <ReplyNodeItem key={node.id} node={node} topicId={topicId} />
      ))}
    </div>
  );
}
