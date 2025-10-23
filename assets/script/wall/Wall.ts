import { _decorator, Component } from 'cc';
import { Tower } from '../tower/Tower';
import { ZombieMager } from '../zombie/ZombieMager';
import { isValid } from 'cc';
import { Vec3 } from 'cc';
import { WallInfo } from '../config/GameData';
const { ccclass, property } = _decorator;

@ccclass('Wall')
export class Wall extends Component {

    private isAttacling: boolean = false;

    protected update(dt: number): void {
        if (this.isAttacling) return;
        this.attack(Tower.ins.data.AttackInterval);
    }

    private attack(dt: number) {
        this.isAttacling = true;
        ZombieMager.ins.Zombies.forEach(zombie => {
            const bol = Vec3.distance(zombie.node.worldPosition, this.node.worldPosition) < WallInfo.AttackRange;
            if (bol) {
                if (zombie && isValid(zombie) && zombie.node && isValid(zombie.node)) {
                    zombie.beHurt(WallInfo.Attack);
                }
            }
        });
        this.scheduleOnce(() => {
            this.isAttacling = false;
        }, dt);
    }

    public beHurt(num: number) {
        Tower.ins.beHurt(num);
    }
}


