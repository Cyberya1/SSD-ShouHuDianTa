import { _decorator, Camera, Component, ResolutionPolicy, screen, Size, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameSceneFit')
export class GameSceneFit extends Component {
    @property(Camera)
    gameCamera: Camera = null!;

    start() {
        view.on("canvas-resize", this.resize, this);
        this.scheduleOnce(this.resize);

        // @ts-ignore
        if (window.setLoadingProgress) {
            // @ts-ignore
            window.setLoadingProgress(100);
        }
    }

    update(deltaTime: number) {

    }

    private viewScale: number = 1;

    private resize(e?) {

        let screenInPx: Size = screen.windowSize; // 屏幕像素尺寸
        const sceneRatio = screenInPx.width / screenInPx.height; // 场景宽高比

        // 判断是否为竖屏
        const isPortrait = screenInPx.width < screenInPx.height;
        console.log("屏幕方向:", isPortrait ? "竖屏" : "横屏", "尺寸:", screenInPx.width, "x", screenInPx.height);

        // if (UIManager.instance) {
        //     UIManager.instance.refeshUI(isPortrait, screenInPx);
        // }

        if (screen.windowSize.height > screen.windowSize.width && screen.windowSize.width / screen.windowSize.height < 1) {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
            // this.gameCamera.getComponent(Camera).orthoHeight = screenInPx.height / (screenInPx.width / 720);
        } else {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
            // this.gameCamera.getComponent(Camera).orthoHeight = 640;
        }
    }
}