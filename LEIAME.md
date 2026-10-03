# Site Brincolar Games

Site estático (HTML, CSS e JavaScript puros) para o GitHub Pages, no domínio `brincolargames.com.br`.

## Estrutura

```
index.html            página inicial
jogos/index.html      brincolargames.com.br/jogos
hub/index.html        brincolargames.com.br/hub
servicos/index.html   brincolargames.com.br/servicos
404.html              página de erro (também corrige /JOGOS, /HUB, /SERVICO)
dados/jogos.json      lista de jogos  <- você edita aqui
dados/surpresa.json   links do botão "Surpresa?"  <- você edita aqui
banners/              artes dos jogos
assets/               estilos, script, imagens do site e animações da morceguinha
CNAME                 domínio personalizado (não apague)
.nojekyll             faz o GitHub publicar os arquivos como estão (não apague)
```

## Adicionar um jogo

1. Salve a arte em `banners/` (1280 x 720 px, formato `.webp`, `.jpg` ou `.png`; nome em minúsculas, sem espaços nem acentos).
2. Abra `dados/jogos.json` e inclua um bloco novo. Atenção à vírgula entre os blocos:

```json
{
  "nome": "Nome do jogo",
  "descricao": "Descrição do jogo.",
  "plataformas": "Web e Mobile",
  "banner": "banners/nome-do-jogo.webp",
  "link": "https://endereco-do-jogo",
  "destaque": true
}
```

- `destaque: true` faz o jogo aparecer no carrossel da página inicial. Com `false`, ele aparece só em "Ver todos".
- A ordem no arquivo é a ordem na tela.
- O `link` precisa começar com `https://`.

## Botão "Surpresa?" da morceguinha

`dados/surpresa.json` é uma lista simples de links. A morceguinha sorteia um deles. Para incluir ou tirar um jogo do sorteio, adicione ou apague uma linha:

```json
[
  "https://link-do-jogo-1",
  "https://link-do-jogo-2"
]
```

Depois de editar um `.json`, vale conferir em https://jsonlint.com se não ficou vírgula sobrando: um erro ali deixa a lista vazia.

## Trocar as animações da morceguinha

Substitua os arquivos em `assets/img/` mantendo os nomes:

- `morcega-idle.webp` (voando, sempre visível)
- `morcega-atencao.webp` (mouse em cima)
- `morcega-conversa.webp` (balão aberto)

Formato: WebP animado, quadrado, fundo transparente, 240 x 240 px.

## Testar no computador

Abrir o `index.html` com dois cliques não carrega os jogos (o navegador bloqueia a leitura do `.json`). Use um servidor local, por exemplo, dentro da pasta do site:

```
python -m http.server 8000
```

e abra `http://localhost:8000`.

## Publicar no GitHub Pages

1. Crie um repositório público (por exemplo `brincolargames`) e envie **o conteúdo desta pasta** para a raiz dele, incluindo `CNAME` e `.nojekyll`.
2. No repositório: **Settings > Pages > Build and deployment**. Em *Source*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
3. Ainda em **Settings > Pages**, em *Custom domain*, confira se aparece `brincolargames.com.br` e salve.

## Apontar o domínio (Registro.br)

No painel do Registro.br, entre no domínio, abra **Configurar zona DNS** (modo avançado) e crie:

| Tipo | Nome | Valor |
|---|---|---|
| A | (vazio) | 185.199.108.153 |
| A | (vazio) | 185.199.109.153 |
| A | (vazio) | 185.199.110.153 |
| A | (vazio) | 185.199.111.153 |
| CNAME | www | SEU-USUARIO.github.io |

Troque `SEU-USUARIO` pelo usuário ou organização dona do repositório. A propagação pode levar algumas horas. Quando o GitHub mostrar "DNS check successful" em **Settings > Pages**, marque **Enforce HTTPS**.

Enquanto o domínio não estiver apontado, as páginas internas funcionam em `SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`, mas a página de erro 404 só fica correta no domínio final.
