# Marca Delamayer

O logo oficial, em vetor, a partir da arte enviada pelo Carmelito em
21/09/2026 (`Delamayer (7) (1).pdf`, exportada do CorelDRAW).

A arte original é uma imagem com textura de ouro, e o "vetor" dentro do PDF
é um contorno automático dessa imagem, de bordas tremidas. Os arquivos daqui
foram redesenhados em curvas limpas a partir dela, ampliada oito vezes, e
conferidos contra a arte: o desenho coincide em mais de 99,9%.

## Arquivos

| Arquivo | Uso |
|---|---|
| `delamayer-logo.svg` / `.png` | Logo completo, "D" dourado e DELAMAYER em branco. Para fundo escuro. |
| `delamayer-logo-fundo-claro.svg` / `.png` | O mesmo, com DELAMAYER em grafite (`#2A2A2D`). Para fundo branco: documento, papel timbrado, contrato. |
| `delamayer-d.svg` / `.png` | Só o monograma. Avatar, favicon, selo. |
| `delamayer-palavra.svg` | Só o DELAMAYER, na cor do texto em volta (`currentColor`). |

Os PNG têm fundo transparente: 2400 px de largura no logo e 1024 px no
monograma. Para qualquer outro tamanho, use o SVG.

O dourado é um degradê (`#F3DFAE` → `#D9AE5B` → `#B07C24` → `#E8CB8A`), o
mesmo do site. A textura de folha de ouro da arte original não existe em
vetor; em impressão, o degradê é o equivalente.

## Fontes

O logo é só o desenho: "D" e DELAMAYER. O subtítulo da arte ("Soluções
Financeiras e Imobiliárias") é texto, e pode ser composto com a fonte abaixo
quando for preciso.

- **Subtítulo: Montserrat SemiBold (600)**, espaçamento normal. Identificada
  com confiança alta. Gratuita (licença OFL), no Google Fonts.
- **DELAMAYER:** as letras do logo são desenho próprio e estão vetorizadas
  aqui; não é preciso fonte nenhuma para usar o logo. Para um título que
  precise conversar com ele, a fonte gratuita mais próxima é a **Libertinus
  Sans Bold** (OFL), com espaçamento de -0,012 em. Ela chega perto nas
  proporções e nas pontas alargadas, mas o "M" e a travessa do "A" são
  diferentes: serve para texto, não para refazer o logo.

## Diferença em relação ao site

O "D" que o site desenha em código (`src/lib/mark.ts`) foi medido de uma arte
anterior. Comparado com esta, ele é um pouco mais alto e estreito, e o traço
é cerca de 20% mais fino. Os arquivos desta pasta seguem a arte oficial.
