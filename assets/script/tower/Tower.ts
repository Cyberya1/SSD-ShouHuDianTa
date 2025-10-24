import { _decorator, Component, Node } from 'cc';
import { ZombieMager } from '../zombie/ZombieMager';
import { Vec3 } from 'cc';
import { Zombie } from '../zombie/Zombie';
import { GameMager } from '../GameMager';
import { Label } from 'cc';
import { GameInfo, TowerInfo } from '../config/GameData';
import { v3 } from 'cc';
import { tween } from 'cc';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { isValid } from 'cc';
import { UIOpacity, Sprite } from 'cc';
import { EVENT_TYPE, IEvent } from '../tools/CustomEvent';
const { ccclass, property } = _decorator;

@ccclass('Tower')
export class Tower extends Component {
    public static ins: Tower = null;

    @property(Node) goldUI: Node = null;

    @property(Node) level1AttackRangeTip: Node = null;
    @property(Node) level2AttackRangeTip: Node = null;
    @property(Node) bulletFirePoint: Node = null;
    @property(Prefab) bullet: Prefab = null;
    @property(Node) hp: Node = null;
    @property(Node) bujian: Node = null;


    private gold: number = 0;
    private level_1_need_gold: number = 50;
    private level_2_need_gold: number = 500;
    private currentHP: number = TowerInfo.HP;
    private uio: UIOpacity = null;
    private hpbar: Sprite = null;

    level: number = 1;
    data: any = null;

    protected onLoad(): void {
        Tower.ins = this;
        this.data = TowerInfo.Level1;
        this.uio = this.hp.getComponent(UIOpacity);
        this.hpbar = this.hp.getChildByName("Bar").getComponent(Sprite);
    }

    protected update(dt: number): void {
        this.goldUI.setWorldRotation(GameMager.ins.camera.node.worldRotation);
        const gold = this.level == 1 ? this.level_1_need_gold : this.level_2_need_gold;
        this.goldUI.getChildByName("Label").getComponent(Label).string = `${this.gold}/${gold}`;
    }

    protected lateUpdate(dt: number): void {
        this.hp.setWorldRotation(GameMager.ins.camera.node.worldRotation);
    }

    start() {
        this.schedule(() => {
            if (GameMager.ins.GameEnd) return;
            this.attack();
        }, this.data.AttackInterval)
    }

    attack() {
        const zombie = ZombieMager.ins.returnMinDistanceZombie(this.node);
        if (zombie) {
            if (Vec3.distance(zombie.node.worldPosition, this.node.worldPosition) < this.data.AttackRange) {
                const bullet = instantiate(this.bullet);
                bullet.parent = this.bulletFirePoint;
                tween(bullet)
                    .to(0.2, { worldPosition: zombie.node.worldPosition })
                    .call(() => {
                        if (zombie && isValid(zombie)) {
                            zombie.getComponent(Zombie).beHurt(this.data.Attack);
                        }
                        bullet.destroy();
                    })
                    .start();
            }
        }
    }

    beHurt(num: number) {
        this.currentHP -= num;
        this.hpbar.fillRange = this.currentHP / TowerInfo.HP;

        if (this.currentHP <= 0) {
            IEvent.emit(EVENT_TYPE.GAME_OVER);
        }
    }

    changeGold(num: number) {
        this.gold += num;
        let _gold: number = 0;
        if (this.level == 1)
            _gold = this.level_1_need_gold;
        else if (this.level == 2)
            _gold = this.level_2_need_gold;

        if (this.gold >= _gold) {
            this.Upgrade();
            this.gold = 0;
        }
    }

    Upgrade() {
        this.level++;
        this.bujian.active = true;

        if (this.level == 2) {
            this.data = TowerInfo.Level2;
            GameInfo.C = 3;
            // this.level1AttackRangeTip.active = false;
            // this.level2AttackRangeTip.active = true;
            ZombieMager.ins.loadSecondZombies();
        }
        tween(this.node)
            .to(0.2, { scale: v3(0.9, 0.9, 0.9) })
            .to(0.2, { scale: v3(1, 1, 1) })
            .call(() => {
                console.log("Upgrade TowerInfo", this.level, TowerInfo);
            })
            .start();
    }

}


