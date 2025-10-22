import { _decorator, Component } from 'cc';
import { Tower } from '../tower/Tower';
const { ccclass, property } = _decorator;

@ccclass('Wall')
export class Wall extends Component {

    // @property(Node) hp: Node = null;

    // protected hpTween: Tween<Node> = null;

    // private hpbar: Sprite = null;
    // private uio: UIOpacity = null;

    // _hp: number = 0;


    // protected onLoad(): void {
    //     this._hp = WallInfo.HP;

    //     this.hpbar = this.hp.getChildByName("Bar").getComponent(Sprite);
    //     this.uio = this.hp.getComponent(UIOpacity);

    //     this.uio.opacity = 0;
    // }

    // protected lateUpdate(dt: number): void {
    //     this.hp.setWorldRotation(GameMager.ins.camera.node.worldRotation);
    // }

    beHurt(num: number) {
        Tower.ins.beHurt(num);
        // this.uio.opacity = 255;
        // this._hp -= num;
        // this.hpbar.fillRange = this._hp / WallInfo.HP;
        // if (this._hp <= 0 || this.hpbar.fillRange <= 0) {
        //     IEvent.emit(EVENT_TYPE.GAME_OVER);
        //     this.node.destroy();
        // }
        // if (this.hpTween) {
        //     this.hpTween.stop();
        // }
        // this.hpTween = tween(this.hp)
        //     .delay(3)
        //     .call(() => {
        //         this.uio.opacity = 0;
        //     })
        //     .start();
    }
}


