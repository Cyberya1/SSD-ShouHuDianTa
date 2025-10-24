import { Label } from 'cc';
import { Sprite } from 'cc';
import { Vec3 } from 'cc';
import { instantiate } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameMager } from './GameMager';
import { Event } from 'cc';
import { PlayableSDK } from './common/PlayableSDK';
import { Tower } from './tower/Tower';
import { find } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMager')
export class UIMager extends Component {
    public static instance: UIMager = null;

    @property(Prefab) goldPre: Prefab = null;
    @property(Node) goldUI: Node = null;
    @property(Node) tryAgainPanel: Node = null;
    @property(Node) playNowPanel: Node = null;
    @property(Prefab) maxTip: Prefab = null;
    @property(Node) moreZombiesComingTip: Node = null;

    private goldIcon: Sprite = null;

    protected onLoad(): void {
        UIMager.instance = this;
        this.goldIcon = this.goldUI.getChildByName('Icon').getComponent(Sprite);
    }


    bezierTwn: Tween<Node> = null;
    loadGoldToUI(): void {
        const gold = instantiate(this.goldPre);
        gold.setParent(find("Map"));

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


    // maxTipAni() {
    //     const tip = instantiate(this.maxTip);
    //     tip.setParent(this.node);
    //     tween(tip)
    //         .to(0.5, { position: tip.position.add(new Vec3(0, 100, 0)) })
    //         .call(() => {
    //             tip.destroy();
    //         })
    //         .start();
    //     // if (this.maxTip.node.active) return;
    //     // this.maxTip.node.active = true;
    //     // this.scheduleOnce(() => {
    //     //     this.maxTip.node.active = false;
    //     // }, 3)
    // }
}


