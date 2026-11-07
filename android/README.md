# Android

Aplicativo Android de A Última Luz. O WebView serve `dist/` por uma origem HTTPS local usando `WebViewAssetLoader`. Modelos, áudio, bibliotecas e ícones ficam dentro do APK; não é necessário acessar o GitHub Pages para jogar. O progresso fica no armazenamento local do aplicativo.

Android 8.0 ou superior, WebView atualizado e suporte a OpenGL ES 3 / WebGL 2. O aplicativo abre em paisagem, mantém a tela ligada enquanto está em primeiro plano e pausa ao sair. O botão Voltar pausa a partida, fecha diálogos e sai pelo menu inicial. Não solicita acesso à câmera, microfone, arquivos pessoais ou localização.

Para compilar localmente, instale JDK 17, Gradle 8.11.1 e Android SDK 35, configure `ANDROID_HOME` e rode na raiz do repositório:

```sh
gradle -p android assembleDebug
```

O APK de desenvolvimento fica em `android/app/build/outputs/apk/debug/`. A tarefa `copyGameAssets` copia automaticamente a versão atual de `dist/`.

O workflow **Android APK**, executado em alterações do jogo e também manualmente em GitHub Actions, gera um APK de desenvolvimento e testa a inicialização offline em um emulador. Esse APK usa a chave de desenvolvimento temporária do runner.

A versão distribuída em Releases é compilada separadamente com uma chave privada persistente, fora do repositório. Para criar uma versão assinada, defina `ANDROID_KEYSTORE_PATH` e `ANDROID_KEY_PASSWORD` e execute `gradle -p android assembleRelease`. O alias esperado é `ultima-luz`. Preserve a chave e a senha: elas são necessárias para futuras atualizações sem desinstalar o aplicativo.

O APK é distribuído diretamente em GitHub Releases. Ele é para Android; no iPhone, use a versão web e “Adicionar à Tela de Início” no Safari.
