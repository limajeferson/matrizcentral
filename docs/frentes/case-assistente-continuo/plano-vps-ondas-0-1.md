# Assistente de voz — Ondas 0 e 1: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** falar no celular e receber o texto transcrito, por um servidor que o
usuário controla e que pode ser destruído e recriado em 15 minutos.

**Architecture:** PWA push-to-talk envia áudio por HTTPS para uma API FastAPI
numa VPS ARM. A API normaliza o áudio com ffmpeg e o entrega a um **motor de
transcrição plugável** — a escolha entre `faster-whisper` e `whisper.cpp` só
acontece depois de medir em Ampere (Onda 0), então o motor fica atrás de um
protocolo desde o primeiro dia. Uma segunda porta (`/nota`) aceita texto já
transcrito, porque no PC o Handy transcreve localmente e não fala com servidor
remoto.

**Tech Stack:** Python 3.11+ · FastAPI · uvicorn · pytest · ffmpeg · Caddy ·
systemd · PWA (HTML/JS puro, sem framework)

**Spec:** [`spec-vps.md`](spec-vps.md) — revisão 2, com a auditoria aplicada.
Leia a spec junto com este plano: o plano argumenta a partir dela.

## Global Constraints

- **Custo zero estrito.** Qualquer coisa que exija pagamento: **parar e
  consultar o usuário.** Sem exceção.
- **Repositório separado:** `C:\Users\jefer\Documents\Projetos\assistente-local`.
  **Nada** deste plano toca o repositório `matrizcentral`.
- **A conta Oracle é do usuário.** Cadastro exige cartão e 2FA — limite 1 do
  `CLAUDE.md`. O agente nunca digita credencial.
- **Sem capacidade ARM na Oracle → parar e consultar.** Não subir alternativa
  paga por conta própria.
- **Nenhuma transcrição ou áudio real do usuário vira conteúdo publicado**
  (critério de sucesso 7 da spec).
- **Escopo do produto:** transcreve a fala do próprio usuário em push-to-talk.
  **Não é gravador de reunião nem de ambiente** (§8 da spec).
- **iOS não é prometido** em superfície nenhuma antes de alguém gravar num
  iPhone real. Android é o alvo verificado.
- **Sem LLM antes da Onda 3.** Este plano não carrega modelo de geração.
- **Comunicar em português do Brasil**, incluindo comentários e mensagens de
  commit.
- **Gate por commit:** `pytest` verde e `ruff check` sem erro.

## Estrutura de arquivos

```
assistente-local/
├── pyproject.toml              deps e config do pytest/ruff
├── README.md                   como rodar (vira base da receita da Onda 4)
├── .gitignore
├── src/assistente/
│   ├── config.py               chave, limites, caminhos — lido do ambiente
│   ├── audio.py                normalização para WAV 16 kHz (puro + ffmpeg)
│   ├── engines.py              protocolo do motor + motor falso para teste
│   └── api.py                  FastAPI: /saude, /transcrever, /nota
├── tests/
│   ├── test_config.py
│   ├── test_audio.py
│   └── test_api.py
├── pwa/
│   ├── index.html              botão push-to-talk
│   ├── app.js                  MediaRecorder + envio
│   └── manifest.json
├── infra/
│   ├── provisiona.sh           idempotente: recria a máquina inteira
│   ├── Caddyfile
│   └── assistente.service
└── bench/
    └── medir.py                mede latência de um motor (usado na Onda 0)
```

**Por que assim:** `audio.py` e `config.py` são lógica pura e testável sem
servidor — é onde o teste paga. `engines.py` isola a decisão que ainda não foi
tomada. `api.py` é fino de propósito: só junta as peças.

---

# FASE A — não depende da Oracle

Tudo aqui roda na máquina do usuário. **Faça esta fase inteira antes de pedir
a conta Oracle**, para que a criação da conta não bloqueie o progresso.

---

### Task 1: Esqueleto do repositório e portão de qualidade

**Files:**
- Create: `pyproject.toml`
- Create: `.gitignore`
- Create: `README.md`
- Create: `src/assistente/__init__.py`
- Create: `tests/test_esqueleto.py`

**Interfaces:**
- Consumes: nada (primeira task)
- Produces: pacote importável `assistente`, com `assistente.__version__: str`

- [ ] **Step 1: Criar o repositório e o primeiro teste que falha**

```bash
mkdir -p "C:/Users/jefer/Documents/Projetos/assistente-local"
cd "C:/Users/jefer/Documents/Projetos/assistente-local"
git init
mkdir -p src/assistente tests pwa infra bench
```

`tests/test_esqueleto.py`:

```python
def test_pacote_importa_e_tem_versao():
    import assistente

    assert isinstance(assistente.__version__, str)
    assert assistente.__version__
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `python -m pytest tests/test_esqueleto.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'assistente'`

- [ ] **Step 3: Criar o pacote e a configuração**

`src/assistente/__init__.py`:

```python
"""Assistente de voz pessoal — núcleo que roda na VPS do próprio usuário."""

__version__ = "0.1.0"
```

`pyproject.toml`:

```toml
[project]
name = "assistente-local"
version = "0.1.0"
description = "Assistente de voz pessoal, self-hosted"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.110",
    "uvicorn[standard]>=0.27",
    "python-multipart>=0.0.9",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "httpx>=0.27", "ruff>=0.4"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]
pythonpath = ["src"]
testpaths = ["tests"]

[tool.ruff]
line-length = 100
```

`.gitignore`:

```
__pycache__/
*.pyc
.venv/
venv/
*.db
*.sqlite3
.env
modelos/
audio-teste/
```

`README.md`:

```markdown
# Assistente de voz — núcleo

Assistente pessoal de voz que roda num servidor **do próprio usuário**.
Push-to-talk: você fala, ele transcreve. Nada de escuta contínua.

## Rodar local

    python -m venv .venv
    .venv/Scripts/activate      # Windows
    pip install -e ".[dev]"
    pytest
    uvicorn assistente.api:app --reload

## Estado

Ondas 0 e 1 — ver `docs/frentes/case-assistente-continuo/` no repositório
`matrizcentral` para a spec e o plano.
```

- [ ] **Step 4: Instalar e rodar o teste**

Run:
```bash
python -m venv .venv && .venv/Scripts/python -m pip install -e ".[dev]"
.venv/Scripts/python -m pytest -v
```
Expected: PASS (1 teste)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: esqueleto do repositorio com portao de qualidade"
```

---

### Task 2: Configuração lida do ambiente

**Files:**
- Create: `src/assistente/config.py`
- Test: `tests/test_config.py`

**Interfaces:**
- Consumes: `assistente` (Task 1)
- Produces:
  - `class Config` com campos `chave_api: str`, `tamanho_max_bytes: int`,
    `modelo: str`, `caminho_ffmpeg: str`
  - `carregar_config(env: Mapping[str, str]) -> Config` — **pura**, recebe o
    ambiente, não lê `os.environ` sozinha
  - `class ConfigInvalida(Exception)`

- [ ] **Step 1: Escrever os testes que falham**

`tests/test_config.py`:

```python
import pytest

from assistente.config import Config, ConfigInvalida, carregar_config


def test_carrega_com_os_valores_do_ambiente():
    cfg = carregar_config(
        {
            "ASSISTENTE_CHAVE": "segredo-de-teste-com-32-caracteres!!",
            "ASSISTENTE_TAMANHO_MAX_MB": "5",
            "ASSISTENTE_MODELO": "small",
        }
    )

    assert isinstance(cfg, Config)
    assert cfg.chave_api == "segredo-de-teste-com-32-caracteres!!"
    assert cfg.tamanho_max_bytes == 5 * 1024 * 1024
    assert cfg.modelo == "small"


def test_usa_padroes_quando_o_opcional_falta():
    cfg = carregar_config({"ASSISTENTE_CHAVE": "x" * 32})

    assert cfg.tamanho_max_bytes == 25 * 1024 * 1024
    assert cfg.modelo == "large-v3-turbo"
    assert cfg.caminho_ffmpeg == "ffmpeg"


def test_recusa_ausencia_de_chave():
    # Sem chave, a API ficaria aberta na internet. Falhar ao subir é melhor
    # que subir desprotegido.
    with pytest.raises(ConfigInvalida, match="ASSISTENTE_CHAVE"):
        carregar_config({})


def test_recusa_chave_curta_demais():
    # Chave curta em endpoint publico e forca bruta viavel.
    with pytest.raises(ConfigInvalida, match="32"):
        carregar_config({"ASSISTENTE_CHAVE": "curta"})


def test_recusa_tamanho_maximo_nao_numerico():
    with pytest.raises(ConfigInvalida, match="ASSISTENTE_TAMANHO_MAX_MB"):
        carregar_config({"ASSISTENTE_CHAVE": "x" * 32, "ASSISTENTE_TAMANHO_MAX_MB": "muito"})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `.venv/Scripts/python -m pytest tests/test_config.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'assistente.config'`

- [ ] **Step 3: Implementar**

`src/assistente/config.py`:

```python
"""Configuração do núcleo, lida do ambiente.

`carregar_config` recebe o ambiente como argumento em vez de ler `os.environ`
direto: assim ela é pura e testável sem mexer em variável global de processo.
"""

from collections.abc import Mapping
from dataclasses import dataclass

CHAVE_MIN_CARACTERES = 32
TAMANHO_MAX_MB_PADRAO = 25
MODELO_PADRAO = "large-v3-turbo"


class ConfigInvalida(Exception):
    """Configuração ausente ou malformada. Impede o serviço de subir."""


@dataclass(frozen=True)
class Config:
    chave_api: str
    tamanho_max_bytes: int
    modelo: str
    caminho_ffmpeg: str


def carregar_config(env: Mapping[str, str]) -> Config:
    chave = env.get("ASSISTENTE_CHAVE", "").strip()
    if not chave:
        raise ConfigInvalida(
            "ASSISTENTE_CHAVE é obrigatória — sem ela a API ficaria aberta na internet."
        )
    if len(chave) < CHAVE_MIN_CARACTERES:
        raise ConfigInvalida(
            f"ASSISTENTE_CHAVE precisa de ao menos {CHAVE_MIN_CARACTERES} caracteres."
        )

    bruto_mb = env.get("ASSISTENTE_TAMANHO_MAX_MB", str(TAMANHO_MAX_MB_PADRAO))
    try:
        tamanho_mb = int(bruto_mb)
    except ValueError as erro:
        raise ConfigInvalida(f"ASSISTENTE_TAMANHO_MAX_MB precisa ser um número: {bruto_mb!r}") from erro

    return Config(
        chave_api=chave,
        tamanho_max_bytes=tamanho_mb * 1024 * 1024,
        modelo=env.get("ASSISTENTE_MODELO", MODELO_PADRAO),
        caminho_ffmpeg=env.get("ASSISTENTE_FFMPEG", "ffmpeg"),
    )
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `.venv/Scripts/python -m pytest tests/test_config.py -v`
Expected: PASS (5 testes)

- [ ] **Step 5: Commit**

```bash
git add src/assistente/config.py tests/test_config.py
git commit -m "feat(config): configuracao pura, com chave obrigatoria de 32 caracteres"
```

---

### Task 3: Normalização de áudio

O iOS grava `mp4/AAC` e o Android `webm/opus`. Os motores Whisper querem WAV
mono 16 kHz. Esta task resolve isso e é a fronteira onde entra entrada
não-confiável — por isso valida antes de chamar o ffmpeg.

**Files:**
- Create: `src/assistente/audio.py`
- Test: `tests/test_audio.py`

**Interfaces:**
- Consumes: `assistente.config.Config` (Task 2)
- Produces:
  - `TIPOS_ACEITOS: frozenset[str]`
  - `extensao_para(tipo_mime: str) -> str`
  - `class AudioInvalido(Exception)`
  - `comando_ffmpeg(entrada: str, saida: str, caminho_ffmpeg: str) -> list[str]`
  - `normalizar(dados: bytes, tipo_mime: str, cfg: Config) -> bytes` — WAV
    16 kHz mono

- [ ] **Step 1: Escrever os testes que falham**

`tests/test_audio.py`:

```python
import pytest

from assistente.audio import (
    TIPOS_ACEITOS,
    AudioInvalido,
    comando_ffmpeg,
    extensao_para,
    normalizar,
)
from assistente.config import carregar_config

CFG = carregar_config({"ASSISTENTE_CHAVE": "x" * 32, "ASSISTENTE_TAMANHO_MAX_MB": "1"})


def test_aceita_os_dois_formatos_que_os_celulares_gravam():
    # iOS grava mp4/AAC; Android grava webm/opus. Se um dos dois faltar,
    # metade dos aparelhos para de funcionar.
    assert "audio/mp4" in TIPOS_ACEITOS
    assert "audio/webm" in TIPOS_ACEITOS


def test_extensao_ignora_parametros_do_content_type():
    # O navegador manda 'audio/webm;codecs=opus'.
    assert extensao_para("audio/webm;codecs=opus") == ".webm"
    assert extensao_para("audio/mp4") == ".mp4"


def test_extensao_recusa_tipo_desconhecido():
    with pytest.raises(AudioInvalido, match="audio/midi"):
        extensao_para("audio/midi")


def test_comando_ffmpeg_pede_wav_mono_16k():
    cmd = comando_ffmpeg("entrada.webm", "saida.wav", "ffmpeg")

    assert cmd[0] == "ffmpeg"
    assert "entrada.webm" in cmd
    assert "saida.wav" in cmd
    assert "16000" in cmd  # taxa de amostragem que o Whisper espera
    assert "1" in cmd      # mono


def test_recusa_audio_vazio():
    with pytest.raises(AudioInvalido, match="vazio"):
        normalizar(b"", "audio/webm", CFG)


def test_recusa_audio_acima_do_limite():
    grande = b"\x00" * (CFG.tamanho_max_bytes + 1)

    with pytest.raises(AudioInvalido, match="grande"):
        normalizar(grande, "audio/webm", CFG)
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `.venv/Scripts/python -m pytest tests/test_audio.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'assistente.audio'`

- [ ] **Step 3: Implementar**

`src/assistente/audio.py`:

```python
"""Normalização do áudio recebido dos clientes.

Cada plataforma grava num formato: iOS em `mp4/AAC`, Android em `webm/opus`.
Os motores Whisper querem WAV mono 16 kHz. Aqui é também a fronteira por onde
entra dado não-confiável — validar ANTES de entregar ao ffmpeg.
"""

import subprocess
import tempfile
from pathlib import Path

from assistente.config import Config

TAXA_AMOSTRAGEM = "16000"

_EXTENSAO_POR_TIPO = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/mp4": ".mp4",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
}

TIPOS_ACEITOS = frozenset(_EXTENSAO_POR_TIPO)


class AudioInvalido(Exception):
    """Áudio recusado antes de chegar ao ffmpeg."""


def extensao_para(tipo_mime: str) -> str:
    # O navegador manda 'audio/webm;codecs=opus'; só a parte antes do ';' importa.
    base = tipo_mime.split(";")[0].strip().lower()
    if base not in _EXTENSAO_POR_TIPO:
        raise AudioInvalido(f"tipo de áudio não aceito: {tipo_mime}")
    return _EXTENSAO_POR_TIPO[base]


def comando_ffmpeg(entrada: str, saida: str, caminho_ffmpeg: str) -> list[str]:
    return [
        caminho_ffmpeg,
        "-hide_banner",
        "-loglevel", "error",
        "-y",
        "-i", entrada,
        "-ac", "1",              # mono
        "-ar", TAXA_AMOSTRAGEM,  # 16 kHz
        "-f", "wav",
        saida,
    ]


def normalizar(dados: bytes, tipo_mime: str, cfg: Config) -> bytes:
    if not dados:
        raise AudioInvalido("áudio vazio")
    if len(dados) > cfg.tamanho_max_bytes:
        raise AudioInvalido(
            f"áudio grande demais: {len(dados)} bytes, máximo {cfg.tamanho_max_bytes}"
        )

    extensao = extensao_para(tipo_mime)

    with tempfile.TemporaryDirectory() as pasta:
        entrada = Path(pasta) / f"entrada{extensao}"
        saida = Path(pasta) / "saida.wav"
        entrada.write_bytes(dados)

        resultado = subprocess.run(
            comando_ffmpeg(str(entrada), str(saida), cfg.caminho_ffmpeg),
            capture_output=True,
            timeout=60,
        )
        if resultado.returncode != 0 or not saida.exists():
            # Não repassamos a saída do ffmpeg ao cliente: ela pode conter
            # caminho de arquivo do servidor.
            raise AudioInvalido("não foi possível decodificar o áudio enviado")

        return saida.read_bytes()
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `.venv/Scripts/python -m pytest tests/test_audio.py -v`
Expected: PASS (6 testes)

- [ ] **Step 5: Commit**

```bash
git add src/assistente/audio.py tests/test_audio.py
git commit -m "feat(audio): normaliza mp4/AAC e webm/opus para WAV 16 kHz mono"
```

---

### Task 4: Protocolo do motor de transcrição

A decisão `faster-whisper` × `whisper.cpp` **só acontece depois de medir em
Ampere** (Onda 0). Esta task cria a fronteira para que a decisão possa entrar
depois sem reescrever a API.

**Files:**
- Create: `src/assistente/engines.py`
- Test: `tests/test_engines.py`

**Interfaces:**
- Consumes: nada
- Produces:
  - `class MotorTranscricao(Protocol)` com
    `transcrever(self, wav: bytes) -> str`
  - `class MotorFalso` — devolve texto fixo; usado nos testes da API
  - `class MotorIndisponivel(Exception)`

- [ ] **Step 1: Escrever os testes que falham**

`tests/test_engines.py`:

```python
from assistente.engines import MotorFalso, MotorTranscricao


def test_motor_falso_satisfaz_o_protocolo():
    motor: MotorTranscricao = MotorFalso("olá mundo")

    assert motor.transcrever(b"RIFF....") == "olá mundo"


def test_motor_falso_registra_o_que_recebeu():
    # Os testes da API precisam provar que o WAV normalizado chegou ao motor.
    motor = MotorFalso("texto")
    motor.transcrever(b"audio-normalizado")

    assert motor.recebidos == [b"audio-normalizado"]
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `.venv/Scripts/python -m pytest tests/test_engines.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'assistente.engines'`

- [ ] **Step 3: Implementar**

`src/assistente/engines.py`:

```python
"""Fronteira do motor de transcrição.

A escolha entre `faster-whisper` e `whisper.cpp` depende de MEDIÇÃO em ARM
Ampere (Onda 0 da spec), não de opinião. Por isso a API fala com um protocolo,
e o motor concreto entra depois sem tocar em `api.py`.
"""

from typing import Protocol


class MotorIndisponivel(Exception):
    """O motor não conseguiu carregar ou transcrever."""


class MotorTranscricao(Protocol):
    def transcrever(self, wav: bytes) -> str:
        """Recebe WAV mono 16 kHz e devolve o texto."""
        ...


class MotorFalso:
    """Motor de teste: devolve texto fixo e guarda o que recebeu.

    Existe para que os testes da API rodem sem baixar modelo de gigabytes.
    """

    def __init__(self, texto: str = "") -> None:
        self._texto = texto
        self.recebidos: list[bytes] = []

    def transcrever(self, wav: bytes) -> str:
        self.recebidos.append(wav)
        return self._texto
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `.venv/Scripts/python -m pytest tests/test_engines.py -v`
Expected: PASS (2 testes)

- [ ] **Step 5: Commit**

```bash
git add src/assistente/engines.py tests/test_engines.py
git commit -m "feat(motor): protocolo do motor, para a decisao entrar apos a medicao"
```

---

### Task 5: A API — `/saude`, `/transcrever`, `/nota`

**Files:**
- Create: `src/assistente/api.py`
- Test: `tests/test_api.py`

**Interfaces:**
- Consumes: `Config`/`carregar_config` (Task 2), `normalizar`/`AudioInvalido`
  (Task 3), `MotorTranscricao`/`MotorFalso` (Task 4)
- Produces:
  - `criar_app(cfg: Config, motor: MotorTranscricao) -> FastAPI` — injeção
    explícita, para o teste não precisar de ambiente nem de modelo
  - `app` — instância lida de `os.environ`, usada pelo systemd

- [ ] **Step 1: Escrever os testes que falham**

`tests/test_api.py`:

```python
from fastapi.testclient import TestClient

from assistente.api import criar_app
from assistente.config import carregar_config
from assistente.engines import MotorFalso

CHAVE = "x" * 32
CFG = carregar_config({"ASSISTENTE_CHAVE": CHAVE, "ASSISTENTE_TAMANHO_MAX_MB": "1"})


def cliente(motor=None):
    return TestClient(criar_app(CFG, motor or MotorFalso("texto transcrito")))


def test_saude_responde_sem_chave():
    # O health-check do systemd e do monitoramento não deve carregar segredo.
    resposta = cliente().get("/saude")

    assert resposta.status_code == 200
    assert resposta.json()["ok"] is True


def test_transcrever_sem_chave_e_401():
    resposta = cliente().post(
        "/transcrever",
        files={"audio": ("a.webm", b"dados", "audio/webm")},
    )

    assert resposta.status_code == 401


def test_transcrever_com_chave_errada_e_401():
    resposta = cliente().post(
        "/transcrever",
        headers={"X-Chave": "chave-errada-mas-do-mesmo-tamanho!!"},
        files={"audio": ("a.webm", b"dados", "audio/webm")},
    )

    assert resposta.status_code == 401


def test_transcrever_recusa_tipo_nao_suportado():
    resposta = cliente().post(
        "/transcrever",
        headers={"X-Chave": CHAVE},
        files={"audio": ("a.mid", b"dados", "audio/midi")},
    )

    assert resposta.status_code == 415


def test_transcrever_recusa_arquivo_grande_demais():
    grande = b"\x00" * (CFG.tamanho_max_bytes + 1)

    resposta = cliente().post(
        "/transcrever",
        headers={"X-Chave": CHAVE},
        files={"audio": ("a.webm", grande, "audio/webm")},
    )

    assert resposta.status_code == 413


def test_nota_aceita_texto_ja_transcrito():
    # É a porta do Handy no desktop: ele transcreve localmente e manda o texto.
    resposta = cliente().post(
        "/nota",
        headers={"X-Chave": CHAVE},
        json={"texto": "  lembrar de comprar pão  "},
    )

    assert resposta.status_code == 200
    assert resposta.json()["texto"] == "lembrar de comprar pão"


def test_nota_recusa_texto_vazio():
    resposta = cliente().post("/nota", headers={"X-Chave": CHAVE}, json={"texto": "   "})

    assert resposta.status_code == 400


def test_nota_sem_chave_e_401():
    resposta = cliente().post("/nota", json={"texto": "oi"})

    assert resposta.status_code == 401
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `.venv/Scripts/python -m pytest tests/test_api.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'assistente.api'`

- [ ] **Step 3: Implementar**

`src/assistente/api.py`:

```python
"""API do núcleo.

Duas portas de entrada, e o motivo está na §3.1 da spec: o Handy não fala com
servidor de transcrição remoto, então no PC ele transcreve localmente e manda
só o TEXTO por `/nota`. O celular, que não tem motor, manda ÁUDIO por
`/transcrever`.
"""

import hmac
import os

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from pydantic import BaseModel

from assistente.audio import AudioInvalido, normalizar
from assistente.config import Config, carregar_config
from assistente.engines import MotorIndisponivel, MotorTranscricao


class EntradaNota(BaseModel):
    texto: str


def criar_app(cfg: Config, motor: MotorTranscricao) -> FastAPI:
    app = FastAPI(title="Assistente de voz", docs_url=None, redoc_url=None)

    def exigir_chave(x_chave: str = Header(default="")) -> None:
        # `compare_digest` para não vazar o tamanho da chave pelo tempo de resposta.
        if not hmac.compare_digest(x_chave, cfg.chave_api):
            raise HTTPException(status_code=401, detail="chave inválida")

    @app.get("/saude")
    def saude() -> dict:
        # Sem chave de propósito: é o health-check do systemd e do monitoramento.
        return {"ok": True}

    @app.post("/transcrever", dependencies=[Depends(exigir_chave)])
    async def transcrever(audio: UploadFile = File(...)) -> dict:
        dados = await audio.read()
        tipo = audio.content_type or ""

        try:
            wav = normalizar(dados, tipo, cfg)
        except AudioInvalido as erro:
            mensagem = str(erro)
            if "grande" in mensagem:
                raise HTTPException(status_code=413, detail=mensagem) from erro
            if "não aceito" in mensagem:
                raise HTTPException(status_code=415, detail=mensagem) from erro
            raise HTTPException(status_code=400, detail=mensagem) from erro

        try:
            texto = motor.transcrever(wav)
        except MotorIndisponivel as erro:
            raise HTTPException(status_code=503, detail="motor indisponível") from erro

        return {"texto": texto}

    @app.post("/nota", dependencies=[Depends(exigir_chave)])
    def nota(entrada: EntradaNota) -> dict:
        texto = entrada.texto.strip()
        if not texto:
            raise HTTPException(status_code=400, detail="texto vazio")
        # A Onda 2 é que persiste. Aqui só validamos e devolvemos, para que a
        # porta exista com o contrato certo desde já.
        return {"texto": texto}

    return app


def _app_do_ambiente() -> FastAPI:
    from assistente.engines import MotorFalso

    cfg = carregar_config(os.environ)
    # O motor concreto entra na Task 10, depois da medição da Onda 0.
    return criar_app(cfg, MotorFalso(""))


app = _app_do_ambiente() if os.environ.get("ASSISTENTE_CHAVE") else None
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `.venv/Scripts/python -m pytest -v`
Expected: PASS (todos)

- [ ] **Step 5: Commit**

```bash
git add src/assistente/api.py tests/test_api.py
git commit -m "feat(api): /saude, /transcrever e /nota com chave em tempo constante"
```

---

### Task 6: PWA push-to-talk

**Files:**
- Create: `pwa/index.html`
- Create: `pwa/app.js`
- Create: `pwa/manifest.json`

**Interfaces:**
- Consumes: `POST /transcrever` (Task 5)
- Produces: nada consumido por outra task

> **Não há teste automatizado aqui.** O Vitest/pytest não sobe navegador com
> microfone. A verificação é manual, no aparelho, e está no Step 4 — é a mesma
> política do `matrizcentral` para componentes.

- [ ] **Step 1: Escrever a página**

`pwa/index.html`:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Assistente</title>
<link rel="manifest" href="manifest.json">
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100dvh; display:grid; place-items:center;
         background:#0a0812; color:#eee; font:16px/1.5 system-ui,sans-serif; }
  main { display:grid; gap:24px; justify-items:center; padding:24px; width:min(420px,100%); }
  #gravar { width:180px; height:180px; border-radius:50%; border:none; cursor:pointer;
            background:#7c5cff; color:#fff; font-size:18px; font-weight:600;
            transition:transform .1s, background .2s; touch-action:manipulation; }
  #gravar[data-gravando="sim"] { background:#e5484d; transform:scale(1.06); }
  #gravar:disabled { opacity:.5; cursor:default; }
  #saida { width:100%; min-height:120px; padding:12px; border-radius:12px;
           background:#141024; border:1px solid #2a2440; color:#eee; white-space:pre-wrap; }
  #aviso { color:#a49fb8; font-size:14px; text-align:center; min-height:1.5em; }
</style>
</head>
<body>
<main>
  <button id="gravar" data-gravando="nao">Segure<br>para falar</button>
  <p id="aviso"></p>
  <div id="saida" aria-live="polite"></div>
</main>
<script src="app.js"></script>
</body>
</html>
```

`pwa/manifest.json`:

```json
{
  "name": "Assistente de voz",
  "short_name": "Assistente",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#0a0812",
  "theme_color": "#7c5cff",
  "icons": []
}
```

- [ ] **Step 2: Escrever o cliente**

`pwa/app.js`:

```javascript
// Push-to-talk: segura o botão, fala, solta. Nada de escuta contínua — é a
// regra de escopo da §8 da spec, e é também o que o Android permite sem app.

const botao = document.getElementById("gravar");
const saida = document.getElementById("saida");
const aviso = document.getElementById("aviso");

// A chave fica no aparelho. Um usuário, um segredo — rotacionar é trocar aqui.
const CHAVE = localStorage.getItem("assistente_chave") || "";
const API = localStorage.getItem("assistente_api") || "";

let gravador = null;
let pedacos = [];

// O Safari do iOS não suporta webm/opus antes do 18.4; o Chrome do Android não
// grava mp4. Perguntar ao navegador é mais confiável que detectar plataforma.
function tipoSuportado() {
  const candidatos = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidatos.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

async function iniciar() {
  if (!API || !CHAVE) {
    aviso.textContent = "Configure a API e a chave no armazenamento local.";
    return;
  }
  try {
    const trilha = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = tipoSuportado();
    gravador = new MediaRecorder(trilha, mimeType ? { mimeType } : undefined);
    pedacos = [];
    gravador.ondataavailable = (e) => e.data.size > 0 && pedacos.push(e.data);
    gravador.onstop = () => {
      // Encerrar as trilhas é o que apaga o indicador de microfone do sistema.
      trilha.getTracks().forEach((t) => t.stop());
      enviar(new Blob(pedacos, { type: gravador.mimeType }));
    };
    gravador.start();
    botao.dataset.gravando = "sim";
    aviso.textContent = "Ouvindo…";
  } catch {
    aviso.textContent = "Sem acesso ao microfone. Verifique a permissão.";
  }
}

function parar() {
  if (gravador && gravador.state === "recording") gravador.stop();
  botao.dataset.gravando = "nao";
}

async function enviar(blob) {
  aviso.textContent = "Transcrevendo…";
  botao.disabled = true;
  const corpo = new FormData();
  corpo.append("audio", blob, "fala" + (blob.type.includes("mp4") ? ".mp4" : ".webm"));
  try {
    const r = await fetch(API + "/transcrever", {
      method: "POST",
      headers: { "X-Chave": CHAVE },
      body: corpo,
    });
    if (!r.ok) {
      aviso.textContent = r.status === 401 ? "Chave rejeitada." : "Falha ao transcrever (" + r.status + ").";
      return;
    }
    const dados = await r.json();
    saida.textContent = (saida.textContent ? saida.textContent + "\n\n" : "") + dados.texto;
    aviso.textContent = "";
  } catch {
    aviso.textContent = "Sem conexão com o servidor.";
  } finally {
    botao.disabled = false;
  }
}

// Ponteiro cobre toque e mouse de uma vez. `pointercancel` importa: sem ele, um
// gesto de rolagem interrompido deixaria o microfone ligado.
botao.addEventListener("pointerdown", (e) => { e.preventDefault(); iniciar(); });
botao.addEventListener("pointerup", parar);
botao.addEventListener("pointercancel", parar);
botao.addEventListener("pointerleave", parar);
```

- [ ] **Step 3: Servir e testar contra a API local**

Run, em dois terminais:
```bash
ASSISTENTE_CHAVE=$(python -c "import secrets;print(secrets.token_urlsafe(32))") \
  .venv/Scripts/python -m uvicorn assistente.api:app --port 8000
python -m http.server 8080 --directory pwa
```

- [ ] **Step 4: Verificação manual — anotar o resultado, não presumir**

No Chrome desktop, abrir `http://localhost:8080`, definir no console
`localStorage.assistente_api="http://localhost:8000"` e
`localStorage.assistente_chave="<a chave gerada>"`, recarregar, segurar o botão
e falar.

Conferir e **anotar**: o botão fica vermelho enquanto grava · o indicador de
microfone some ao soltar · o texto aparece · chave errada mostra "Chave
rejeitada".

> **Android e iOS só podem ser verificados depois da Task 12** — `getUserMedia`
> exige HTTPS fora de `localhost`. Não marcar como testado antes disso.

- [ ] **Step 5: Commit**

```bash
git add pwa/
git commit -m "feat(pwa): push-to-talk com deteccao de formato pelo navegador"
```

---

### Task 7: Medidor de latência dos motores

Escrito agora, **rodado na VPS** na Task 10. É o instrumento que decide o motor.

**Files:**
- Create: `bench/medir.py`
- Test: `tests/test_medir.py`

**Interfaces:**
- Consumes: nada
- Produces:
  - `resumir(tempos: list[float]) -> dict` com `n`, `mediana`, `p95`, `pior`
  - `formatar(nome: str, resumo: dict) -> str`

- [ ] **Step 1: Escrever os testes que falham**

`tests/test_medir.py`:

```python
import pytest

from bench.medir import formatar, resumir


def test_resume_com_mediana_e_p95():
    resumo = resumir([1.0, 2.0, 3.0, 4.0, 100.0])

    assert resumo["n"] == 5
    assert resumo["mediana"] == 3.0
    assert resumo["pior"] == 100.0
    # p95 de 5 amostras cai na última — o que importa é ser o pior caso
    # plausível, não o melhor.
    assert resumo["p95"] == 100.0


def test_recusa_lista_vazia():
    with pytest.raises(ValueError, match="vazia"):
        resumir([])


def test_formata_em_uma_linha_legivel():
    linha = formatar("whisper.cpp/small", {"n": 3, "mediana": 2.5, "p95": 4.0, "pior": 4.2})

    assert "whisper.cpp/small" in linha
    assert "2.5" in linha
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `.venv/Scripts/python -m pytest tests/test_medir.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'bench'`

- [ ] **Step 3: Implementar**

Criar `bench/__init__.py` vazio e `bench/medir.py`:

```python
"""Instrumento da Onda 0: mede latência de transcrição.

O critério da spec é 'latência aceitável em push-to-talk', não 'melhor
modelo'. Por isso o relatório mostra mediana E p95: uma mediana boa com p95
ruim significa que às vezes o usuário espera, e é isso que faz desistir.
"""

import statistics


def resumir(tempos: list[float]) -> dict:
    if not tempos:
        raise ValueError("lista de tempos vazia")
    ordenados = sorted(tempos)
    indice_p95 = max(0, round(0.95 * len(ordenados)) - 1)
    return {
        "n": len(ordenados),
        "mediana": statistics.median(ordenados),
        "p95": ordenados[indice_p95],
        "pior": ordenados[-1],
    }


def formatar(nome: str, resumo: dict) -> str:
    return (
        f"{nome}: n={resumo['n']} "
        f"mediana={resumo['mediana']:.1f}s "
        f"p95={resumo['p95']:.1f}s "
        f"pior={resumo['pior']:.1f}s"
    )
```

Acrescentar `"bench"` em `[tool.setuptools.packages.find]`? **Não** — `bench`
não é distribuído. Em vez disso, ajustar `pyproject.toml`:

```toml
[tool.pytest.ini_options]
pythonpath = ["src", "."]
testpaths = ["tests"]
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `.venv/Scripts/python -m pytest tests/test_medir.py -v`
Expected: PASS (3 testes)

- [ ] **Step 5: Commit**

```bash
git add bench/ tests/test_medir.py pyproject.toml
git commit -m "feat(bench): medidor com mediana e p95, o instrumento da Onda 0"
```

---

### Task 8: Provisionamento idempotente da máquina

Este é o script que torna a VPS **descartável** — o requisito §3.3 da spec e o
critério de sucesso 8. Escrito agora, rodado na Task 9.

**Files:**
- Create: `infra/provisiona.sh`
- Create: `infra/Caddyfile`
- Create: `infra/assistente.service`

**Interfaces:**
- Consumes: nada
- Produces: máquina com Caddy + serviço `assistente` em pé

> **Sem teste automatizado.** É infra. A prova é a Task 12: destruir e recriar.

- [ ] **Step 1: Escrever o serviço systemd**

`infra/assistente.service`:

```ini
[Unit]
Description=Assistente de voz — núcleo
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=assistente
WorkingDirectory=/opt/assistente
EnvironmentFile=/etc/assistente/ambiente
ExecStart=/opt/assistente/.venv/bin/uvicorn assistente.api:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5
# Endurecimento: o serviço não precisa de nada fora do que está listado.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/assistente

[Install]
WantedBy=multi-user.target
```

- [ ] **Step 2: Escrever o Caddyfile**

`infra/Caddyfile`:

```
# TLS automático via Let's Encrypt — é a razão de o Caddy estar aqui em vez do
# nginx: uma peça a menos para explicar na receita.
{$ASSISTENTE_DOMINIO} {
	encode zstd gzip

	# O PWA é estático e público; a API é que exige chave.
	handle /app/* {
		uri strip_prefix /app
		root * /opt/assistente/pwa
		file_server
	}

	handle {
		reverse_proxy 127.0.0.1:8000
	}
}
```

- [ ] **Step 3: Escrever o provisionamento**

`infra/provisiona.sh`:

```bash
#!/usr/bin/env bash
# Recria a máquina inteira do zero. Idempotente: rodar duas vezes não quebra.
#
# É o coração do "a VPS é descartável" (§3.3 da spec). A instância do Always
# Free pode ser recuperada por ociosidade sem aviso — a defesa não é evitar
# isso, é conseguir voltar em 15 minutos.
#
# Uso:  ASSISTENTE_DOMINIO=voz.matrizcentral.com.br ./provisiona.sh
set -euo pipefail

: "${ASSISTENTE_DOMINIO:?defina ASSISTENTE_DOMINIO}"
REPO="${ASSISTENTE_REPO:-https://github.com/limajeferson/assistente-local.git}"

echo "==> pacotes"
sudo apt-get update -qq
sudo apt-get install -y -qq python3-venv python3-pip ffmpeg git curl ufw \
  debian-keyring debian-archive-keyring apt-transport-https

echo "==> caddy"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -qq && sudo apt-get install -y -qq caddy
fi

echo "==> usuário e diretórios"
id -u assistente >/dev/null 2>&1 || sudo useradd --system --home /opt/assistente assistente
sudo mkdir -p /opt/assistente /var/lib/assistente /etc/assistente
sudo chown -R assistente:assistente /opt/assistente /var/lib/assistente

echo "==> código"
if [ -d /opt/assistente/.git ]; then
  sudo -u assistente git -C /opt/assistente pull --ff-only
else
  sudo -u assistente git clone --depth 1 "$REPO" /opt/assistente
fi

echo "==> dependências"
sudo -u assistente python3 -m venv /opt/assistente/.venv
sudo -u assistente /opt/assistente/.venv/bin/pip install -q --upgrade pip
sudo -u assistente /opt/assistente/.venv/bin/pip install -q -e /opt/assistente

echo "==> segredo"
# Gerado na máquina. O agente nunca digita nem transporta credencial.
if [ ! -f /etc/assistente/ambiente ]; then
  CHAVE="$(python3 -c 'import secrets;print(secrets.token_urlsafe(32))')"
  printf 'ASSISTENTE_CHAVE=%s\n' "$CHAVE" | sudo tee /etc/assistente/ambiente >/dev/null
  sudo chmod 600 /etc/assistente/ambiente
  echo "    chave gerada — leia com: sudo cat /etc/assistente/ambiente"
fi

echo "==> firewall"
sudo ufw --force reset >/dev/null
sudo ufw default deny incoming >/dev/null
sudo ufw default allow outgoing >/dev/null
sudo ufw allow 22/tcp >/dev/null
sudo ufw allow 443/tcp >/dev/null
sudo ufw allow 80/tcp >/dev/null   # o Let's Encrypt precisa do 80 para o desafio
sudo ufw --force enable >/dev/null
# A imagem da Oracle traz iptables restritivo ALÉM da security list da VCN.
# Sem esta linha, a porta abre no painel e continua fechada na máquina.
sudo iptables -I INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT || true
command -v netfilter-persistent >/dev/null && sudo netfilter-persistent save || true

echo "==> serviços"
sudo cp /opt/assistente/infra/assistente.service /etc/systemd/system/
sudo cp /opt/assistente/infra/Caddyfile /etc/caddy/Caddyfile
printf 'ASSISTENTE_DOMINIO=%s\n' "$ASSISTENTE_DOMINIO" | sudo tee /etc/default/caddy >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable --now assistente caddy
sudo systemctl restart assistente caddy

echo "==> pronto. verifique: curl -s https://${ASSISTENTE_DOMINIO}/saude"
```

- [ ] **Step 4: Conferir a sintaxe sem executar**

Run:
```bash
bash -n infra/provisiona.sh && echo "sintaxe ok"
```
Expected: `sintaxe ok`

- [ ] **Step 5: Commit**

```bash
git add infra/
git commit -m "feat(infra): provisionamento idempotente, o que torna a VPS descartavel"
```

---

# FASE B — depende da conta Oracle

> **🔒 PARADA OBRIGATÓRIA ANTES DA TASK 9.**
> A conta OCI exige cartão de crédito e 2FA — o agente **não** cria conta nem
> digita credencial (limite 1 do `CLAUDE.md`). Peça ao usuário:
> 1. criar a conta em `cloud.oracle.com` e **anotar a home region** (ela é
>    imutável e define onde o áudio fica);
> 2. criar uma instância **VM.Standard.A1.Flex** Always Free com Ubuntu LTS;
> 3. informar o IP público e confirmar que o SSH por chave funciona;
> 4. apontar um subdomínio (ex.: `voz.matrizcentral.com.br`) para esse IP.
>
> **Se não houver capacidade ARM: PARAR e consultar.** Não subir alternativa
> paga.

---

### Task 9: Subir a máquina e provar que o script funciona

**Files:**
- Modify: `infra/provisiona.sh` (correções que a execução real revelar)
- Create: `docs/onda-0-resultados.md` (no repositório `assistente-local`)

**Interfaces:**
- Consumes: `infra/provisiona.sh` (Task 8)
- Produces: `https://<dominio>/saude` respondendo 200

- [ ] **Step 1: Rodar o provisionamento na instância**

```bash
scp -r infra/ ubuntu@<ip>:~/
ssh ubuntu@<ip> "ASSISTENTE_DOMINIO=voz.matrizcentral.com.br bash ~/infra/provisiona.sh"
```

- [ ] **Step 2: Verificar por HTTP, não por suposição**

Run: `curl -s https://voz.matrizcentral.com.br/saude`
Expected: `{"ok":true}`

Run: `curl -s -o /dev/null -w "%{http_code}" -X POST https://voz.matrizcentral.com.br/nota -H "Content-Type: application/json" -d '{"texto":"oi"}'`
Expected: `401` — sem chave, a porta é fechada.

- [ ] **Step 3: Registrar a cota real**

Criar `docs/onda-0-resultados.md` com a saída de:

```bash
ssh ubuntu@<ip> "nproc; free -h; uname -m; cat /etc/os-release | head -2"
```

A spec diz "2 OCPU/12 GB, confirmar no console" — **anotar o número real**, não
repetir o da spec.

- [ ] **Step 4: Corrigir o script com o que a execução revelou**

Toda correção volta para `infra/provisiona.sh`. Se foi preciso fazer algo à mão
que o script não fez, **o script está errado** — o critério da Task 12 é
recriar sem intervenção manual.

- [ ] **Step 5: Commit**

```bash
git add infra/ docs/onda-0-resultados.md
git commit -m "feat(infra): maquina no ar, script corrigido pela execucao real"
```

---

### Task 10: Onda 0 — medir os motores e decidir

**Files:**
- Create: `bench/rodar.py`
- Modify: `docs/onda-0-resultados.md`

**Interfaces:**
- Consumes: `bench.medir.resumir`/`formatar` (Task 7)
- Produces: **a decisão do motor**, escrita, com números

- [ ] **Step 1: Escrever o roteiro de medição**

`bench/rodar.py`:

```python
"""Roda a medição na VPS. Não é teste — é instrumento.

Uso: python bench/rodar.py <motor> <modelo> <arquivo.wav> [repeticoes]
"""

import subprocess
import sys
import time

from bench.medir import formatar, resumir


def medir_cpp(binario: str, modelo: str, wav: str) -> float:
    inicio = time.perf_counter()
    subprocess.run([binario, "-m", modelo, "-f", wav, "-nt"], capture_output=True, check=True)
    return time.perf_counter() - inicio


def medir_faster(modelo: str, wav: str) -> float:
    from faster_whisper import WhisperModel

    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    inicio = time.perf_counter()
    list(m.transcribe(wav)[0])
    return time.perf_counter() - inicio


if __name__ == "__main__":
    motor, modelo, wav = sys.argv[1], sys.argv[2], sys.argv[3]
    repeticoes = int(sys.argv[4]) if len(sys.argv) > 4 else 5
    fn = (lambda: medir_cpp("./main", modelo, wav)) if motor == "cpp" else (lambda: medir_faster(modelo, wav))
    tempos = [fn() for _ in range(repeticoes)]
    print(formatar(f"{motor}/{modelo}", resumir(tempos)))
```

- [ ] **Step 2: Gravar o áudio de referência**

**Áudio roteirizado, não fala real** — critério 7 da spec: nenhuma transcrição
real vira material do projeto. Gravar ~10 s lendo um parágrafo técnico em
português, salvar como `audio-teste/referencia.wav` (que o `.gitignore` já
exclui).

- [ ] **Step 3: Medir as combinações**

Na VPS, para cada motor (`faster-whisper`, `whisper.cpp`) e cada modelo
(`large-v3-turbo`, `medium`, `small`), rodar 5 repetições. Registrar também:
RAM residente (`ps -o rss=`) e se houve swap.

- [ ] **Step 4: Verificar as pendências da Onda 0 que não são latência**

```bash
pip download sqlite-vec --no-deps -d /tmp/sv && ls /tmp/sv   # wheel aarch64?
```

E medir um embedding multilíngue (candidatos: `multilingual-e5-small`,
`paraphrase-multilingual-MiniLM-L12-v2`) — **português não é detalhe**: um
embedding só-inglês inutiliza a Onda 2.

- [ ] **Step 5: Escrever a decisão e commitar**

Em `docs/onda-0-resultados.md`: tabela com os números, o motor escolhido, o
modelo escolhido, e **o porquê em uma linha**. Se nenhuma combinação der
latência aceitável, isso é um achado — registrar e consultar o usuário, não
escolher o menos ruim em silêncio.

```bash
git add bench/rodar.py docs/onda-0-resultados.md
git commit -m "feat(onda-0): motores medidos em ARM, decisao registrada com numeros"
```

---

### Task 11: Ligar o motor escolhido

**Files:**
- Create: `src/assistente/engines_real.py`
- Modify: `src/assistente/api.py` (a função `_app_do_ambiente`)
- Test: `tests/test_engines_real.py`

**Interfaces:**
- Consumes: `MotorTranscricao` (Task 4), a decisão da Task 10
- Produces: `criar_motor(nome: str, modelo: str) -> MotorTranscricao`

- [ ] **Step 1: Escrever o teste que falha**

`tests/test_engines_real.py`:

```python
import pytest

from assistente.engines import MotorIndisponivel
from assistente.engines_real import criar_motor


def test_recusa_motor_desconhecido():
    with pytest.raises(MotorIndisponivel, match="desconhecido"):
        criar_motor("motor-que-nao-existe", "small")


def test_erro_claro_quando_a_biblioteca_nao_esta_instalada(monkeypatch):
    # Na máquina de desenvolvimento (Windows/x86) a biblioteca do motor não
    # está instalada. O erro tem que dizer isso, não estourar ImportError cru.
    monkeypatch.setitem(__import__("sys").modules, "faster_whisper", None)

    with pytest.raises(MotorIndisponivel):
        criar_motor("faster", "small")
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `.venv/Scripts/python -m pytest tests/test_engines_real.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'assistente.engines_real'`

- [ ] **Step 3: Implementar**

`src/assistente/engines_real.py`:

```python
"""Motores concretos. Qual deles usar foi decidido por MEDIÇÃO na Task 10 —
ver `docs/onda-0-resultados.md`.

As importações são preguiçosas de propósito: a máquina de desenvolvimento não
tem as bibliotecas nem os modelos de gigabytes, e os testes precisam rodar lá.
"""

import subprocess
import tempfile
from pathlib import Path

from assistente.engines import MotorIndisponivel, MotorTranscricao


class MotorFasterWhisper:
    def __init__(self, modelo: str) -> None:
        try:
            from faster_whisper import WhisperModel
        except Exception as erro:
            raise MotorIndisponivel("faster-whisper não está instalado") from erro
        if WhisperModel is None:
            raise MotorIndisponivel("faster-whisper não está instalado")
        self._m = WhisperModel(modelo, device="cpu", compute_type="int8")

    def transcrever(self, wav: bytes) -> str:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(wav)
            caminho = f.name
        try:
            segmentos, _ = self._m.transcribe(caminho, language="pt")
            return " ".join(s.text.strip() for s in segmentos).strip()
        finally:
            Path(caminho).unlink(missing_ok=True)


class MotorWhisperCpp:
    def __init__(self, modelo: str, binario: str = "/opt/whisper.cpp/main") -> None:
        if not Path(binario).exists():
            raise MotorIndisponivel(f"binário do whisper.cpp não encontrado: {binario}")
        self._binario = binario
        self._modelo = modelo

    def transcrever(self, wav: bytes) -> str:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(wav)
            caminho = f.name
        try:
            r = subprocess.run(
                [self._binario, "-m", self._modelo, "-f", caminho, "-l", "pt", "-nt"],
                capture_output=True, text=True, timeout=300,
            )
            if r.returncode != 0:
                raise MotorIndisponivel("whisper.cpp falhou ao transcrever")
            return r.stdout.strip()
        finally:
            Path(caminho).unlink(missing_ok=True)


def criar_motor(nome: str, modelo: str) -> MotorTranscricao:
    if nome == "faster":
        return MotorFasterWhisper(modelo)
    if nome == "cpp":
        return MotorWhisperCpp(modelo)
    raise MotorIndisponivel(f"motor desconhecido: {nome}")
```

Em `src/assistente/api.py`, trocar `_app_do_ambiente`:

```python
def _app_do_ambiente() -> FastAPI:
    from assistente.engines_real import criar_motor

    cfg = carregar_config(os.environ)
    motor = criar_motor(os.environ.get("ASSISTENTE_MOTOR", "cpp"), cfg.modelo)
    return criar_app(cfg, motor)
```

- [ ] **Step 4: Rodar a suíte inteira**

Run: `.venv/Scripts/python -m pytest -v && .venv/Scripts/python -m ruff check .`
Expected: PASS, sem erro de lint

- [ ] **Step 5: Commit e implantar**

```bash
git add src/assistente/engines_real.py src/assistente/api.py tests/test_engines_real.py
git commit -m "feat(motor): liga o motor escolhido pela medicao da Onda 0"
git push
ssh ubuntu@<ip> "ASSISTENTE_DOMINIO=voz.matrizcentral.com.br bash ~/infra/provisiona.sh"
```

---

### Task 12: Provar os dois critérios que a spec exige

Critério 8 (destruir e recriar) e critério 1 (falar no celular). **Testado, não
presumido** — é a redação da própria spec.

**Files:**
- Modify: `docs/onda-0-resultados.md`
- Modify: `infra/provisiona.sh` (se a recriação revelar falha)

**Interfaces:**
- Consumes: tudo acima
- Produces: as duas provas registradas

- [ ] **Step 1: Provar o ciclo completo pelo celular**

Abrir `https://voz.matrizcentral.com.br/app/` no **Chrome do Android**,
configurar chave e API no `localStorage`, segurar o botão, falar uma frase
roteirizada, conferir que o texto volta correto.

**No iPhone, se houver um:** testar **na aba do Safari**. Se a instalação como
PWA falhar (relato conhecido: grava uma vez e só volta após reiniciar), isso é
**esperado** — registrar como limitação conhecida, não como bug a caçar. Sem
iPhone disponível: escrever "não testado" e **não** mencionar iOS em superfície
pública.

- [ ] **Step 2: Fazer o backup antes de destruir**

```bash
ssh ubuntu@<ip> "sudo cat /etc/assistente/ambiente"   # guardar a chave
```

- [ ] **Step 3: Destruir a instância e recriar, cronometrando**

Terminar a instância no console da Oracle, criar outra, apontar o DNS, e rodar
**só**:

```bash
scp -r infra/ ubuntu@<novo-ip>:~/
ssh ubuntu@<novo-ip> "ASSISTENTE_DOMINIO=voz.matrizcentral.com.br bash ~/infra/provisiona.sh"
```

**Cronometrar.** Toda intervenção manual necessária é **defeito do script** —
corrigir o script e repetir. O critério da spec é 15 minutos sem mão.

- [ ] **Step 4: Verificar que voltou**

Run: `curl -s https://voz.matrizcentral.com.br/saude`
Expected: `{"ok":true}` — e o ditado pelo celular funcionando de novo.

- [ ] **Step 5: Registrar e commitar**

Em `docs/onda-0-resultados.md`: tempo real da recriação, o que teve de ser
corrigido no script, e o estado do teste em Android e iOS. Este texto é a
matéria-prima do capítulo mais reproduzível da receita (Onda 4).

```bash
git add -A
git commit -m "test(onda-1): ciclo completo provado no celular e recriacao cronometrada"
```

---

## Autorrevisão do plano

**Cobertura da spec:** §3.1 duas portas → Tasks 5, 6, 11 · §3.2 peças → Tasks
1–5, 8 · §3.3 VPS descartável → Tasks 8, 9, 12 · §3.4 riscos ARM/iOS → Tasks
10, 12 · Onda 0 (5 perguntas) → Tasks 9, 10 · Onda 1 → Tasks 5, 6, 9, 11, 12 ·
§5 custo → constraint global · §8 fronteira jurídica → constraints globais +
Task 10 Step 2 (áudio roteirizado) · critérios 1, 2, 7, 8 → Task 12.

**Fora deste plano, de propósito:** FTS5, `sqlite-vec` e persistência são
**Onda 2**; ações de rede são **Onda 3**; o conteúdo é **Onda 4**. A Task 10
Step 4 apenas *verifica* que o `sqlite-vec` existe para aarch64, para que a
Onda 2 não descubra tarde demais.

**Consistência de tipos:** `Config` (Task 2) é consumida por `normalizar`
(Task 3) e `criar_app` (Task 5) com o mesmo nome de campo `tamanho_max_bytes`
e `caminho_ffmpeg`. `MotorTranscricao.transcrever(wav: bytes) -> str` é o
mesmo contrato em `MotorFalso` (Task 4), nos testes da API (Task 5) e nos
motores reais (Task 11). `resumir`/`formatar` (Task 7) são usados por
`bench/rodar.py` (Task 10) com as mesmas chaves de dicionário.

**Onde este plano pode estar errado:** o `Caddyfile` usa `{$ASSISTENTE_DOMINIO}`
lido de `/etc/default/caddy`; se a versão empacotada não carregar esse arquivo,
a Task 9 vai revelar e o script muda. É o tipo de coisa que só a execução real
resolve — e por isso a Task 9 tem um passo dedicado a corrigir o script com o
que a realidade mostrar.
