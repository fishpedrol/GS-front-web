# domain/

Regras puras, sem React, sem rede e sem `localStorage`: ocupação, limiares, classificação, a hora da leitura e a normalização das salas (filtros e ranking entram depois). É o que os testes cobrem.

Onde ficam os números:

- os limiares e a faixa de leitura possível de cada sensor (todos **provisórios**): `limiares.js`;
- os 3 lugares por mesa: `ocupacao.js`;
- as nove salas e as mesas por porte: `../data/salas.js`.

O único import de fora do `domain/` é esse: o `normalizar.js` lê o `../data/salas.js`, que só tem dados (nenhuma função).
