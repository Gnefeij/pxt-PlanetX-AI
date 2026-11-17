![](https://img.shields.io/badge/Plantfrom-Micro%3Abit-red) ![](https://img.shields.io/travis/com/elecfreaks/pxt-PlanetX-AI) ![](https://img.shields.io/github/v/release/elecfreaks/pxt-PlanetX-AI) ![](https://img.shields.io/github/last-commit/elecfreaks/pxt-PlanetX-AI) ![](https://img.shields.io/github/languages/top/elecfreaks/pxt-PlanetX-AI) ![](https://img.shields.io/github/issues/elecfreaks/pxt-PlanetX-AI) ![](https://img.shields.io/github/license/elecfreaks/pxt-PlanetX-AI) 

# AiLens Package

![](/image.jpg/)

This extension is designed to programme and drive the AiLens.

The AI Lens is able to achieve the functions of face recognition, balls tracking, cards recognition and characteristics acquisition.

## Get Product

You can [get AiLens from the Elecfreaks store](https://www.elecfreaks.com/elecfreaks-smart-ai-lens-kit.html)

## Use Tutorial

You can get a detailed tutorial on how to use it here [ELECFREAKS WIKI](
https://elecfreaks.com/learn-en/microbitplanetX/ai/index.html)
### Block
* Initialize AI Lens and wait for AIlens to upload IIC data
```JavaScript
PlanetX_AILens.initModule()
```
* Switch ailens function, including, card, ball, color, line inspection, feature learning
```JavaScript
PlanetX_AILens.switchfunc(PlanetX_AILens.FuncList.Card)
```
* Get the data of current frame from ailens
```JavaScript
PlanetX_AILens.cameraImage()
```
* Process the data of small ball in the screen (if the screen contains small ball and the function is selected as small ball)
```Javascript
PlanetX_AILens.checkBall()
PlanetX_AILens.ballColor(PlanetX_AILens.ballColorList.Red)
PlanetX_AILens.BallTotalNum()
PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.X)
```
* Process the data of face in the picture (if the picture contains face and the function is face)
```JavaScript
PlanetX_AILens.checkFace()
PlanetX_AILens.faceTotalNum()
PlanetX_AILens.faceData(PlanetX_AILens.Facestatus.X)
```
* Process the card data in the screen (if the screen contains cards and the function is selected as card)
```javascript
PlanetX_AILens.numberCard(numberCards.1)
PlanetX_AILens.letterCard(letterCards.A)
PlanetX_AILens.trafficCard(trafficCards.forward)
PlanetX_AILens.otherCard(otherCards.cat)
PlanetX_AILens.cardTotalNum()
PlanetX_AILens.CardData(Cardstatus.X)
```
* Process the data of line segments in the screen (if the screen contains line segments and the function is tracking)

```javascript
PlanetX_AILens.lineData(Linestatus.angle)
PlanetX_AILens.lineDirection(Linestatus.angle)
```

* Learn the characteristics of the object in the current picture, and record and save
```javascript
PlanetX_AILens.learnObject(1)
```
* Remove all learned objects
```javascript
PlanetX_AILens.ClearlearnObject()
```
* Deal with the confidence of the learned object in the picture
```javascript
PlanetX_AILens.objectCheck(PlanetX_AILens.learnID.ID1)
PlanetX_AILens.objectConfidence(PlanetX_AILens.learnID.ID1)
```

## AI Lens Pro

AI Lens Pro blocks use the `PlanetX_AILens` namespace and are available in the `AI Lens Pro` subcategory.

```JavaScript
PlanetX_AILens.initAiLensPro()
PlanetX_AILens.switchApp(PlanetX_AILens.AppMode.FaceRecognize)
PlanetX_AILens.getOneFrame()
```

## ASR

ASR blocks remain in the `PlanetX_AILens` namespace and are available in the `ASR` subcategory.

```JavaScript
PlanetX_AILens.onASR(PlanetX_AILens.vocabularyList.Hi_Shaun, function () {
    basic.showIcon(IconNames.Yes)
})
```

## Supported targets
for PXT/microbit

## License
MIT


### AI Lens Pro AI 助手事件

事件积木为“当 AI 助手收到命令 [前进]”，不需要填写 ID；每个不同描述自动获得递增 ID。同描述的多个事件积木共享一条命令并分别执行回调。支持最多 32 条命令，每条描述最多 180 个 UTF-8 字节。积木自动向 AI Lens Pro 注册并保存命令表，用“AI 助手命令已注册”判断同步是否完成，不需要循环注册。扩展配置启用 `utf8` 编译选项以保留 micro:bit 原生程序中的中文。

“清空 AI 助手指令”同时移除本程序的命令和事件回调，并向 AI Lens Pro 同步空命令表；同步确认前“AI 助手命令已注册”为假，同步完成后为真。清空后旧事件不会执行，新注册命令继续使用递增 ID。放在“当开机时”会清除启动阶段事件积木已注册的命令，通常应绑定到按键或需要清空的业务流程。旧项目升级后若事件积木仍显示 ID 输入，请重新拖入新版事件积木；TypeScript 调用改为 `onAssistantCommand("前进", function () { ... })`。

对助手说“积木指令，往前走一点”，LLM 从已注册命令中选择“前进”的 ID，micro:bit 执行对应事件积木。普通闲聊、应用切换、音量和视觉问答继续使用助手原有功能。没有合适命令或有歧义时不会执行。需配套含 MCU 串口代理和助手命令服务的 AI Lens Pro 固件；事件邮箱为 0x03C0–0x03FF，协议沿用扩展 MCU 现有透明转发及虚拟寄存器。
