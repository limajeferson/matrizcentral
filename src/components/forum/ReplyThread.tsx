"use client";
import { useState } from "react";
import { relativeTime } from "@/lib/relative-time";
import type { ReplyNode } from "@/lib/forum-tree";
import ResponderForm from "./ResponderForm";

/** Cap visual de indentação: a partir daqui, respostas continuam aninhadas
 * na árvore mas não ganham mais recuo (evita paredão de indentação infinita). */
const MAX_INDENT_DEPTH = 5;

/** Classes literais por nível (JIT do Tailwind precisa da string completa em
 * código-fonte — não dá para montar "ml-{n}" em runtime). Índice = depth capado. */
const INDENT_CLASSES = [
  "",
  "ml-4 border-l border-border pl-4",
  "ml-8 border-l border-border pl-4",
  "ml-12 border-l border-border pl-4",
  "ml-16 border-l border-border pl-4",
  "ml-20 border-l border-border pl-4",
];

function ReplyNodeItem({ node, topicId }: { node: ReplyNode; topicId: string }) {
  const [replying, setReplying] = useState(false);
  const indentDepth = Math.min(node.depth, MAX_INDENT_DEPTH);

  return (
    <div className={INDENT_CLASSES[indentDepth]}>
      <div className="rounded-lg border border-border bg-card/60 p-3">
        <div className="flex items-baseline gap-2">
          <p className="text-xs font-medium text-foreground">{node.author}</p>
          <p className="text-xs text-muted-foreground">{relativeTime(node.created_at, new Date())}</p>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{node.body}</p>
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
