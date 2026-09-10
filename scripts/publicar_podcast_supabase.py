"""Cria o bucket publico de audio do podcast no Supabase, sobe os arquivos e
gera o feed RSS compativel com Spotify/Apple Podcasts. Roda inteiro na nossa
propria infraestrutura -- nenhuma acao em conta do Spotify/YouTube.

Uso: python scripts/publicar_podcast_supabase.py
"""
import os
import re
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path
from xml.sax.saxutils import escape

import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = REPO_ROOT / ".env.local"
AUDIO_DIR = REPO_ROOT.parent / "assistente-local"  # nao usado, so referencia
NOTEBOOKLM_AUDIO_DIR = REPO_ROOT / "notebooklm" / "audio"
BUCKET = "podcast-audio"
FEED_PATH = REPO_ROOT / "public" / "podcast" / "feed.xml"

PODCAST_TITLE = "Matriz Central Podcast"
PODCAST_DESCRIPTION = "IA local, sem Big Tech e sem mensalidade -- conversas e cases reais sobre rodar IA no seu proprio hardware."
PODCAST_SITE = "https://www.matrizcentral.com.br"
PODCAST_LANGUAGE = "pt-br"
PODCAST_AUTHOR = "Matriz Central"
PODCAST_EMAIL = "contato@matrizcentral.com.br"
PODCAST_IMAGE = "https://www.matrizcentral.com.br/brand/favicon.svg"

# id do arquivo -> (titulo, descricao, data ISO)
EPISODIOS = [
    ("podcast-vibe-coding-fim-programador-comprimido.m4a", "Vibe Coding e o Fim do Programador Tradicional?",
     "Debate: o que os projetos 100% gerados por IA dizem sobre o futuro de quem programa.", "2026-07-22"),
    ("podcast-vibe-coding-engenharia.m4a", "Vibe Coding e a Engenharia de Software",
     "Velocidade de producao vs qualidade: onde a IA acelera e onde ela quebra o design.", "2026-07-22"),
    ("podcast-rode-ia-potente.m4a", "Rode IA Potente Direto no Seu Computador",
     "Como colocar uma IA de verdade rodando na sua maquina sem pagar mensalidade.", "2026-07-22"),
    ("podcast-ias-poderosas.m4a", "IAs Poderosas Rodando no Seu Computador",
     "O setup que transforma um computador comum em uma central de IA para o dia a dia.", "2026-07-22"),
    ("podcast-melhor-ia-hardware.m4a", "A Melhor IA para Seu Hardware Local",
     "O organograma que usamos para decidir qual IA instalar em menos de dois minutos.", "2026-07-22"),
    ("podcast-escolher-ias-sem-travar.m4a", "Como Escolher IAs Locais Sem Travar",
     "Os erros mais comuns que travam a IA local -- e como evita-los antes de instalar.", "2026-07-22"),
    ("podcast-case-vps-oracle-always-free.m4a", "O Custo Real do Always Free Oracle",
     "Audio gerado a partir do case real: o que a VPS gratuita da Oracle entrega de verdade, sem esconder os erros no caminho.", "2026-09-08"),
]


def carregar_env():
    valores = {}
    for linha in ENV_PATH.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^([A-Z0-9_]+)=(.*)$", linha.strip())
        if m:
            valores[m.group(1)] = m.group(2)
    return valores


def garantir_bucket(base_url: str, headers: dict) -> None:
    resp = requests.get(f"{base_url}/storage/v1/bucket/{BUCKET}", headers=headers)
    if resp.status_code == 200:
        print(f"Bucket '{BUCKET}' ja existe.")
        return
    resp = requests.post(
        f"{base_url}/storage/v1/bucket",
        headers=headers,
        json={"id": BUCKET, "name": BUCKET, "public": True, "file_size_limit": 104857600},
    )
    resp.raise_for_status()
    print(f"Bucket '{BUCKET}' criado (publico).")


def subir_arquivo(base_url: str, headers: dict, nome_arquivo: str) -> str:
    caminho_local = NOTEBOOKLM_AUDIO_DIR / nome_arquivo
    if not caminho_local.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {caminho_local}")

    upload_headers = dict(headers)
    upload_headers["Content-Type"] = "audio/mp4"
    upload_headers["x-upsert"] = "true"

    with open(caminho_local, "rb") as f:
        resp = requests.post(
            f"{base_url}/storage/v1/object/{BUCKET}/{nome_arquivo}",
            headers=upload_headers,
            data=f,
        )
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Falha ao subir {nome_arquivo}: {resp.status_code} {resp.text}")

    tamanho_mb = caminho_local.stat().st_size / (1024 * 1024)
    print(f"  {nome_arquivo}: {tamanho_mb:.1f}MB enviado")
    return f"{base_url}/storage/v1/object/public/{BUCKET}/{nome_arquivo}"


def gerar_rss(episodios_com_url: list) -> str:
    itens = []
    for nome_arquivo, titulo, descricao, data_iso, url_publica, tamanho_bytes in episodios_com_url:
        pub_date = format_datetime(datetime.fromisoformat(data_iso).replace(tzinfo=timezone.utc))
        guid = url_publica
        itens.append(f"""
    <item>
      <title>{escape(titulo)}</title>
      <description>{escape(descricao)}</description>
      <pubDate>{pub_date}</pubDate>
      <enclosure url="{escape(url_publica)}" length="{tamanho_bytes}" type="audio/mp4" />
      <guid isPermaLink="false">{escape(guid)}</guid>
      <itunes:explicit>false</itunes:explicit>
    </item>""")

    itens_xml = "".join(itens)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{escape(PODCAST_TITLE)}</title>
    <link>{escape(PODCAST_SITE)}</link>
    <language>{PODCAST_LANGUAGE}</language>
    <description>{escape(PODCAST_DESCRIPTION)}</description>
    <itunes:author>{escape(PODCAST_AUTHOR)}</itunes:author>
    <itunes:owner>
      <itunes:name>{escape(PODCAST_AUTHOR)}</itunes:name>
      <itunes:email>{escape(PODCAST_EMAIL)}</itunes:email>
    </itunes:owner>
    <itunes:image href="{escape(PODCAST_IMAGE)}" />
    <itunes:category text="Technology" />
    <itunes:explicit>false</itunes:explicit>
    <image>
      <url>{escape(PODCAST_IMAGE)}</url>
      <title>{escape(PODCAST_TITLE)}</title>
      <link>{escape(PODCAST_SITE)}</link>
    </image>{itens_xml}
  </channel>
</rss>
"""


def main():
    env = carregar_env()
    base_url = env["NEXT_PUBLIC_SUPABASE_URL"]
    service_key = env["SUPABASE_SERVICE_ROLE_KEY"]
    headers = {
        "Authorization": f"Bearer {service_key}",
        "apikey": service_key,
    }

    print("==> bucket")
    garantir_bucket(base_url, headers)

    print("==> upload dos episodios")
    episodios_com_url = []
    for nome_arquivo, titulo, descricao, data_iso in EPISODIOS:
        url_publica = subir_arquivo(base_url, headers, nome_arquivo)
        tamanho_bytes = (NOTEBOOKLM_AUDIO_DIR / nome_arquivo).stat().st_size
        episodios_com_url.append((nome_arquivo, titulo, descricao, data_iso, url_publica, tamanho_bytes))

    print("==> gerando feed RSS")
    rss = gerar_rss(episodios_com_url)
    FEED_PATH.parent.mkdir(parents=True, exist_ok=True)
    FEED_PATH.write_text(rss, encoding="utf-8")
    print(f"Feed escrito em {FEED_PATH}")
    print()
    print("URL final do feed (apos deploy): https://www.matrizcentral.com.br/podcast/feed.xml")


if __name__ == "__main__":
    main()
