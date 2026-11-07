# A Última Luz

Jogo de terror 3D em HTML, CSS e JavaScript, em português. Arquivos prontos em `dist/`; publique esse diretório por HTTPS. Não abra `index.html` por `file://`, pois o jogo utiliza módulos JavaScript.

Inclui introdução de 23 segundos, cabana acessível, floresta, chuva, áudio, monstro humanoide, três peças coletáveis, reparo, vitória e derrota, progresso local, pausa, controles de teclado/mouse e toque, qualidade gráfica e PWA com ícones próprios. Sem backend ou dependências externas durante a partida.

PC: WASD ou setas, mouse, E interagir/segurar para reparar, Shift correr, F lanterna, R sinalizador, P/Esc pausa. Celular: joystick esquerdo, arraste à direita, botões USAR, CORRER, ☼ e ✦. Fones recomendados.

Versão 1.1: station wagon do GGBotNet e seus sons; braços animados de Drillimpact; árvores, troncos e vegetação de LAS; revólver de David Boese. Os modelos enviados foram selecionados e otimizados em `dist/assets/models/`. Os pacotes completos permanecem fora do download do jogo. Sons em AAC/M4A para compatibilidade com Safari/iPhone. Créditos e alterações estão em `dist/assets/CREDITS.txt`.

O revólver fica na mesinha da cabana e é opcional. Clique com o mouse capturado, pressione Espaço ou toque ATIRAR. São três tiros por jornada, sem recarga; um acerto a até 24 metros paralisa o monstro por 3,8 segundos. Ele não morre. Paredes bloqueiam o tiro, erros gastam munição e a contagem persiste ao continuar. O jogo pode ser concluído sem a arma. A licença do modelo limita seu uso a projetos não comerciais.

`tests/assets.test.js` carrega os GLBs reais pelo GLTFLoader, testa animações e projeção dos itens em proporções de PC e celular, com decodificação de texturas substituída por texturas vazias nesse teste de CPU. `tests/combat.test.js` cobre munição, mira, alcance, paredes e migração de saves. A inspeção dos modelos foi feita também em renders offline no Blender; isso não substitui teste da página no Safari.

`npm test` valida progressão, salvamento, colisões e reparo. A ferramenta de navegador não estava disponível durante a criação, portanto aparência, desempenho em aparelhos reais, áudio e instalação PWA precisam de validação nesses dispositivos. Não há garantia de 60 FPS em todos os aparelhos; o modo automático reduz a qualidade quando necessário.

O site é privado no Sites por padrão e exige autenticação para o primeiro acesso. Depois do carregamento completo, o service worker oferece cache offline em navegadores que permitem sua instalação. `assets/CREDITS.txt` lista as fontes dos assets.


Para executar localmente, com Python 3 instalado:

```sh
python3 -m http.server 8080 --directory dist
```

Abra http://localhost:8080. Para rodar os testes, instale Node.js 20 ou mais recente e execute `npm test`; não é necessário instalar pacotes npm.

Os scripts em `tools/` são utilitários de preparação, dispensáveis para jogar. Eles usam Blender 4.x e Python com Pillow. `source-assets/` contém os originais de trabalho e não é versionado. Defina `SURVIVAL_ASSET_DIR` para apontar à pasta dos GLBs originais quando reexecutar a preparação. As versões otimizadas necessárias ao jogo já estão incluídas em `dist/assets/`.
