import { _decorator, Component, Node } from 'cc';
import { NavLine } from './NavLine';
import { CCFloat } from 'cc';
import { Player } from '../player/Player';
import { isValid } from 'cc';
import { Tower } from '../tower/Tower';
import { ZombieMager } from '../zombie/ZombieMager';
import { HunterInfo } from '../config/GameData';
const { ccclass, property } = _decorator;

@ccclass('PointConfig')
export class PointConfig {
    @property(Node) point: Node = null;
    @property(CCFloat) z1: number = 0;
    @property(CCFloat) z2: number = 0;
}

/**
 * 引导控制器
 * 1.开局引导玩家收割小麦
 * 2.麦垛足够时引导玩家前往地标处提交小麦升级Tower
 * 3.引导玩家收集肉
 * 4.肉足够时引导玩家前往地标处提交肉召唤Hunter
 */
@ccclass('GuideCtrl')
export class GuideCtrl extends Component {
    public static ins: GuideCtrl = null;

    /** 导航线 */
    @property({ type: NavLine, tooltip: "导航线" }) line: NavLine = null;
    /** 箭头 */
    @property({ type: Node, tooltip: "箭头" }) JianTou: Node = null;
    /** 将按照数组顺序进行引导 */
    @property({ type: [Node], tooltip: "引导点" }) points: Node[] = [];

    /** 当前引导点索引 */
    private index: number = 0;

    private isActiveTip: boolean = false;

    protected onLoad(): void {
        GuideCtrl.ins = this;
    }

    protected update(dt: number): void {
        this.line.node.setWorldPosition(Player.ins.node.worldPosition);
        let point: Node = null;
        
        if (Player.ins.meatList.length >= HunterInfo.Meat) {
            point = this.points[2];
        } else if (Tower.ins.level == 2) {
            point = ZombieMager.ins.returnMinDistanceZombie(Player.ins.node).node;
        } else if (Player.ins.wheatList.length >= 50) {
            point = this.points[1];
        } else if (Tower.ins.level == 1) {
            point = this.points[0];
        } else {
            this.line.node.active = false;
        }

        if (point && isValid(point)) {
            this.line.node.active = true;
            this.line.init(point.worldPosition.clone());
        } else {
            this.line.node.active = false;
        }
    }
}


