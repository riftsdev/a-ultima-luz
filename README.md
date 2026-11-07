# A Última Luz

Jogo de terror 3D em HTML, CSS e JavaScript, em português. Arquivos prontos em `dist/`; publique esse diretório por HTTPS. Não abra `index.html` por `file://`, pois o jogo utiliza módulos JavaScript.

Inclui introdução de 23 segundos, cabana acessível, floresta, chuva, áudio, monstro humanoide, três peças coletáveis, reparo, vitória e derrota, progresso local, pausa, controles de teclado/mouse e toque, qualidade gráfica e PWA com ícones próprios. Sem backend ou dependências externas durante a partida.

PC: WASD ou setas, mouse, E interagir/segurar para reparar, Shift correr, F lanterna, R sinalizador, P/Esc pausa. Celular: joystick esquerdo, arraste à direita, botões USAR, CORRER, ☼ e ✦. Fones recomendados.

`npm test` valida progressão, salvamento, colisões e reparo. A ferramenta de navegador não estava disponível durante a criação, portanto aparência, desempenho em aparelhos reais, áudio e instalação PWA precisam de validação nesses dispositivos. Não há garantia de 60 FPS em todos os aparelhos; o modo automático reduz a qualidade quando necessário.

O site é privado no Sites por padrão e exige autenticação para o primeiro acesso. Depois do carregamento completo, o service worker oferece cache offline em navegadores que permitem sua instalação. `assets/CREDITS.txt` lista as fontes dos assets.
