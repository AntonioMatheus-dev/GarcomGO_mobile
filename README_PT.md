# GarcomGO_mobile

Projeto móvel para gerenciamento de pedidos desenvolvido com React Native e Expo.

## Visão geral

- Framework: Expo (React Native)
- Linguagem: TypeScript
- Estrutura principal: arquivos em `app/` e `src/`

Este repositório contém a aplicação cliente móvel usada para aceitar e gerenciar pedidos em restaurantes.

## Pré-requisitos

- Node.js (recomendado >= 18)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli` ou usar `npx expo`)
- Android SDK (para emulador Android) com `platform-tools` e `emulator` instalados
- KVM habilitado em Linux (para aceleração do emulador)

Observação: no Linux é comum ter o SDK em `~/Android/Sdk`.

## Variáveis de ambiente recomendadas (Android)

No seu shell (`~/.bashrc` ou `~/.zshrc`) adicione:

```bash
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export ANDROID_HOME=$ANDROID_SDK_ROOT
export PATH="$PATH:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/platform-tools"
```

Depois carregue o arquivo de configuração:

```bash
source ~/.bashrc
```

## Instalação de dependências

Na raiz do projeto execute (npm):

```bash
npm install
```

Ou, se preferir `yarn`:

```bash
yarn install
```

## Inicializando o projeto (modo desenvolvimento)

1. Inicie o Metro / Expo (com limpeza de cache se necessário):

```bash
npx expo start
# ou para limpar cache
npx expo start -c
```

2. Executar no emulador Android (com emulador já aberto):

- Certifique-se de que o emulador esteja rodando (AVD nome `Pixel_6` neste projeto):

```bash
emulator -avd Pixel_6 -gpu swiftshader_indirect
```

- Em seguida habilite o reverse para a porta do Metro (8081):

```bash
adb devices            # deve listar emulator-5554
adb reverse tcp:8081 tcp:8081
```

- No Expo, abra o app no emulador ou execute via intent:

```bash
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent
```

Se o emulador travar por problemas gráficos (erros Mesa / X11), use `swiftshader_indirect` ou execute sem janela para testes:

```bash
emulator -avd Pixel_6 -gpu swiftshader_indirect -no-window
```

## Executar em dispositivo físico Android

1. Ative `USB debugging` no dispositivo.
2. Conecte via USB ou Wi‑Fi.
3. Verifique com `adb devices`.
4. No projeto, execute `npx expo start` e escolha `Run on Android device/emulator`.

## Configurações Git (se necessário)

Configure seu nome e email para commits (exemplo que já foi aplicado no seu ambiente):

```bash
git config --global user.name "Antonio_Matheus"
git config --global user.email "matheus69969@gmail.com"
```

## Scripts úteis (em `package.json`)

- `npm start` — inicia o Expo
- `npm run android` — tenta abrir no emulador Android (quando configurado)

Verifique `package.json` para scripts específicos do projeto.

## Resolução de problemas comuns

- `TypeError: fetch failed` ao abrir o app: execute `adb reverse tcp:8081 tcp:8081` e confirme que `npx expo start` está rodando.
- Erro `Cannot find ANDROID_SDK_ROOT`: exporte `ANDROID_SDK_ROOT` apontando para seu SDK (veja sessão "Variáveis de ambiente").
- Emulador travando com erros `MESA` / `xcb_dri3_pixmap_from_buffer`: inicie o emulador com `-gpu swiftshader_indirect` ou use `-no-window` para testes headless.

## Estrutura rápida de arquivos

- `app/` — rotas e telas principais
- `src/components/` — componentes reutilizáveis
- `src/services/` — APIs, socket e notificações

## Contato / Contribuição

Para dúvidas ou contribuições abra uma issue ou envie um PR. Obrigado por colaborar!
