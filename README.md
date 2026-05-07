# Marketplace ERP

ERP em HTML para acompanhar encomendas, estados, tracking e previsao de entrada de dinheiro.

## Ficheiros

- `vinted-erp-real.html` - versao principal do ERP, com dados reais, tracking, previsoes e dashboard.
- `vinted_erp_encomendas.html` - versao compacta/alternativa do ERP, em formato mais simples.

## Funcionalidades principais

- Dashboard com totais por estado.
- Dropdown para calcular o valor total por estado: pendente, pago, enviado, entregue e cancelado.
- Gestao de encomendas Vinted e Wallapop.
- Secao Tracking com:
  - estado atual por transportadora;
  - estimativa de chegada;
  - ordenacao ascendente/descendente por data estimada de chegada;
  - total do valor em viagem.
- Tabela de previsao Revolut:
  - estimativa de entrada do dinheiro apos rececao;
  - total previsto a receber.
- Updates recentes incluidos:
  - Wallapop / Ivan: CTT `DD415456101PT`, estado "A empresa de transporte tem o pacote".
  - Vinted / somaqa95: "A caminho do comprador", entrega prevista `Mai 12 - Mai 15`.
  - Vinted / miguel5698: "A caminho do comprador", entrega prevista `Mai 18 - Mai 20`.
  - InPost / basma65: tracking `73145036`.
  - InPost / somaqa95: tracking `73447530`.
  - DPD / uveuva: tracking `09867475168023V`.

## Como publicar no GitHub

1. Criar um repositorio novo no GitHub.
2. Fazer upload destes ficheiros.
3. Opcional: ativar GitHub Pages e escolher `vinted-erp-real.html` como pagina principal, ou renomea-lo para `index.html`.

## Nota

O ficheiro e estatico. Os dados ficam embutidos no HTML e tambem podem ser alterados pela interface do ERP no browser.
