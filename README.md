# A Última Luz

[Jogar no navegador](https://riftsdev.github.io/a-ultima-luz/) · [Downloads Android](https://github.com/riftsdev/a-ultima-luz/releases)

Jogo de terror 3D em HTML, CSS e JavaScript, em português. Arquivos prontos em `dist/`; publique esse diretório por HTTPS. Não abra `index.html` por `file://`, pois o jogo utiliza módulos JavaScript.

No GitHub Pages, mantenha a origem na branch `main`, pasta `/ (root)`. O `index.html` da raiz abre o jogo em `dist/`, e `.nojekyll` preserva os arquivos estáticos. O manifesto e o service worker usam caminhos relativos, compatíveis com `/a-ultima-luz/dist/`.

Inclui introdução de 23 segundos, cabana acessível, floresta, chuva, áudio, alossauro animado, três peças coletáveis, reparo, vitória e derrota, progresso local, pausa, controles de teclado/mouse e toque, qualidade gráfica e PWA com ícones próprios. Sem backend ou dependências externas durante a partida.

PC: WASD ou setas, mouse, E interagir/segurar para reparar, Shift correr, F lanterna, R sinalizador, P/Esc pausa. Celular: joystick esquerdo, arraste à direita, botões USAR, CORRER, ☼ e ✦. Fones recomendados.

Assets da versão 1.1: station wagon do GGBotNet e seus sons; braços animados de Drillimpact; árvores, troncos e vegetação de LAS; revólver de David Boese. Os modelos enviados foram selecionados e otimizados em `dist/assets/models/`. Os pacotes completos permanecem fora do download do jogo. Sons em AAC/M4A para compatibilidade com Safari/iPhone. Créditos e alterações estão em `dist/assets/CREDITS.txt`.

Versão 1.2: carro orientado para avançar de frente nas duas cenas; vegetação espaçada, com trilhas livres, tons naturais, capim e pedras; cabana de Elbolillo com portas abertas; alossauro animado de joaomoreira28 substituindo o humanoide. Os dois novos modelos somam cerca de 2,2 MB. O alossauro ruge ao detectar você, persegue, ataca e foge dos sinalizadores. A cabana oferece abrigo.

O revólver fica na mesinha da cabana e é opcional. Clique com o mouse capturado, pressione Espaço ou toque ATIRAR. São três tiros por jornada, sem recarga; um acerto a até 24 metros paralisa o monstro por 3,8 segundos. Ele não morre. Paredes bloqueiam o tiro, erros gastam munição e a contagem persiste ao continuar. O jogo pode ser concluído sem a arma. As licenças do revólver e do alossauro limitam o uso desses modelos a projetos não comerciais.

`tests/assets.test.js` carrega os GLBs reais pelo GLTFLoader, testa animações e projeção dos itens em proporções de PC e celular, com decodificação de texturas substituída por texturas vazias nesse teste de CPU. `tests/combat.test.js` cobre munição, mira, alcance, paredes e migração de saves. A inspeção dos modelos foi feita também em renders offline no Blender; isso não substitui teste da página no Safari.

`npm test` valida progressão, salvamento, colisões e reparo. A versão 1.2 foi inspecionada no Chromium com WebGL por software, em tela de PC e emulação móvel de 390 × 844. Foram verificados movimento por teclado e toque, botão da lanterna, coleta das três peças, reparo, vitória e recarga offline dos 34 arquivos do cache. Os testes de acesso aos itens usam as paredes do GLB real da cabana. Desempenho, áudio e instalação no Safari de um iPhone real ainda precisam de validação no aparelho. Não há garantia de 60 FPS em todos os aparelhos; o modo automático reduz a qualidade quando necessário.

A publicação no GitHub Pages é pública. Depois do carregamento completo, o service worker oferece cache offline em navegadores que permitem sua instalação. `assets/CREDITS.txt` lista as fontes dos assets.


Para executar localmente, com Python 3 instalado:

```sh
python3 -m http.server 8080 --directory dist
```

Abra http://localhost:8080. Para rodar os testes, instale Node.js 20 ou mais recente e execute `npm test`; não é necessário instalar pacotes npm.

Os scripts em `tools/` são utilitários de preparação, dispensáveis para jogar. Eles usam Blender 4.x e Python com Pillow; o gerador de rugido usa NumPy, SciPy e FFmpeg. `source-assets/` contém os originais de trabalho e não é versionado. Defina `SURVIVAL_ASSET_DIR` para apontar à pasta dos GLBs originais quando reexecutar a preparação. As versões otimizadas necessárias ao jogo já estão incluídas em `dist/assets/`.

A pasta `android/` contém a versão Android com todos os assets incluídos no APK. Consulte [as instruções de compilação](android/README.md). O código web continua sendo a fonte única do jogo; o processo Android copia `dist/` automaticamente.

Versão 1.20.3: nova empunhadura do revólver com dedos fechados e arma acompanhando o punho; rugido próprio em AAC, audível também quando o alossauro já está em alerta; itens apoiados nas mesas/chão, sem flutuação; remoção de móvel sobreposto à cabana; restauração dos controles por toque ao pausar ou voltar ao aplicativo Android. Saves anteriores continuam compatíveis. O APK usa a mesma assinatura e pode atualizar a versão 1.2.0.
