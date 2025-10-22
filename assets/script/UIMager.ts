import { Label } from 'cc';
import { Sprite } from 'cc';
import { Vec3 } from 'cc';
import { instantiate } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameMager } from './GameMager';
import { tween } from 'cc';
import { v3 } from 'cc';
import { Event } from 'cc';
import { isValid } from 'cc';
import { PlayableSDK } from './common/PlayableSDK';
import { Tower } from './tower/Tower';
import { find } from 'cc';
import { Tween } from 'cc';
import { UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMager')
export class UIMager extends Component {
    public static instance: UIMager = null;

    @property(Prefab) goldPre: Prefab = null;

    @property(Node) goldUI: Node = null;

    @property(Node) tryAgainPanel: Node = null;
    @property(Node) playNowPanel: Node = null;


    @property(Label) maxTip: Label = null;
    private maxTipUio: UIOpacity = null;

    private goldIcon: Sprite = null;

    protected onLoad(): void {
        UIMager.instance = this;

        this.maxTipUio = this.maxTip.node.getComponent(UIOpacity);

        this.goldIcon = this.goldUI.getChildByName('Icon').getComponent(Sprite);
    }

    // protected lateUpdate(dt: number): void {
    //     if (this._gold && isValid(this._gold)) {
    //         this._gold.setWorldRotation(GameMager.ins.camera.node.worldRotation);
    //     }
    // }


    bezierTwn: Tween<Node> = null;
    loadGoldToUI(): void {
        const gold = instantiate(this.goldPre);
        gold.setParent(find("场景"));

        gold.setWorldPosition(1.5, 1, -15)
        gold.setWorldRotation(GameMager.ins.camera.node.worldRotation);

        const startPos = gold.worldPosition.clone();
        const endPos = this.goldIcon.node.worldPosition;
        const controlPos = new Vec3(
            startPos.x + 5,
            startPos.y,
            startPos.z
        )

        this.bezierTwn = new Tween(gold)
            .bezierTo3D(0.3, startPos, controlPos, endPos)
            .call(() => {
                Tower.ins.changeGold(1);
                gold.destroy();
            })
            .start();

        // tween(gold)
        //     .to(0.5, { position: this.goldIcon.node.worldPosition })
        //     .call(() => {
        //         Tower.ins.changeGold(1);
        //         gold.destroy();
        //     })
        //     .start();
    }

    tryAgain(e: Event) {
        console.log('tryAgain');
        this.tryAgainPanel.active = false;
        this.playNowPanel.active = true;
    }

    playNow(e: Event) {
        console.log('playNow');
        PlayableSDK.download('playNow')
    }


    maxTipTween: Tween<Node> = null;
    maxTipAni() {
        if (this.maxTipTween) return;
        this.maxTipTween = new Tween(this.maxTip.node)
            .delay(3)
            .call(() => {
                this.maxTipUio.opacity = 0;
            })
            .start();
    }
}


