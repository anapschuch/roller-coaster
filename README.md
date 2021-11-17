# Roller Coaster

Projeto de realidade aumentada com Three.js para a matéria de CCI-36 do ITA

Grupo:

-   Ana Paula Schuch

-   Diego Fidalgo

-   Pedro Freitas

Link: https://roller-coaster.vercel.app/

O projeto consiste de um carrinho que percorre automaticamente uma trilha de montanha-russa.

![image](https://user-images.githubusercontent.com/48722002/142260434-a537ce5c-d2c7-4cf9-99b9-d32164656c82.png)

Tanto o carrinho quanto os planos de fundo receberam um `envMap` com o ambiente de deserto utilizado, para garantir que o efeito metálico refletisse corretamente as imagens no horizonte e que as câmeras possam observar o cenário de forma coerente.

Existe uma `SpotLight` em uma posição específica que simula o efeito do sol localizado na imagem de fundo. Essa luz também gera sombras próprias aos objetos

O trabalho possui três opções de câmeras diferentes:

- Ao pressionar a tecla `1`, se tem uma visão distante e estática da montanha-russa. É possível arrastar o mouse com o botão esquerdo, para mover a câmera ao redor do diorama (figura acima) .

- Ao pressionar a tecla `2`, se tem uma visão em primeira pessoa do carrinho. É possível travar a camêra ao cursor ao clicar com o botão esquerdo do mouse, e mover a visão em qualquer direção a partir do ponto onde o carrinho está.

![image](https://user-images.githubusercontent.com/48722002/142263027-0d67c911-dcfb-4909-adb9-309d56b5308f.png)

- Ao pressionar a tecla `3`, se tem uma câmera mais próxima focada no carrinho e que se move junto a ele.

![image](https://user-images.githubusercontent.com/48722002/142262141-ded8b78f-f688-461d-90d4-e2d47219216d.png)

O percurso da montanha russa foi desenhado com auxílio do software Blender. Dois arquivos são utilizados no projeto, um que contém apenas a curva (roller-coaster-curve.obj), e outro com a estrutura (roller-coaster.obj). Para alterar o formato da montanha russa, é suficiente modificar estes dois arquivos.

## Rodar Localmente

Faça o clone do repositório e instale as dependências necessárias com o comando:

```bash
$ npm install
```

Por fim, o comando abaixo roda a aplicação:

```bash
$ npm run dev
```
