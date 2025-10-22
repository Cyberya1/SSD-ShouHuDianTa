import { instantiate } from 'cc';
import { Vec3 } from 'cc';
import { NodePool } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Hunter } from './Hunter';
import { HunterController } from './HunterController';
const { ccclass, property } = _decorator;

@ccclass('HunterMager')
export class HunterMager extends Component {
    public static instance: HunterMager = null;

    @property(Prefab) hunter: Prefab = null;
    @property([Node]) doors: Node[] = [];
    @property(Node) point: Node = null;

    private MaxHunterNum: number = 2;
    private currentHunterNum: number = 0;

    public hunters: Node[] = [];

    protected onLoad(): void {
        HunterMager.instance = this;
    }

    loadHunter() {
        if (this.currentHunterNum >= this.MaxHunterNum) {
            return;
        }

        const hunter = instantiate(this.hunter);
        hunter.parent = this.node;
        hunter.setPosition(Vec3.ZERO)

        // let minDisDoor: Node = null;
        // let minDis = Number.MAX_VALUE;
        // for (let i = 0; i < this.doors.length; i++) {
        //     const door = this.doors[i];
        //     const dis = Vec3.distance(hunter.worldPosition, door.worldPosition);
        //     if (dis < minDis) {
        //         minDis = dis;
        //         minDisDoor = door;
        //     }
        // }

        const hunterCtrl = hunter.getComponent(HunterController);
        hunterCtrl.setPoint(this.point);

        this.hunters.push(hunter)

        this.currentHunterNum++;
    }

    recycleHunter(hunter: Node) {
        this.hunters.splice(this.hunters.indexOf(hunter), 1);
        this.currentHunterNum -= 1;
        hunter.destroy();
    }
}


