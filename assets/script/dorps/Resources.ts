import { Tween, Vec3 } from 'cc';
import { Enum } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Player } from '../player/Player';
import { DropsMager } from './DropsMager';
import { CCFloat } from 'cc';
import { RESOURCE_TYPE } from '../config/GameData';
import { GameMager } from '../GameMager';
import { UIMager } from '../UIMager';
const { ccclass, property } = _decorator;

@ccclass('Resources')
export class Resources extends Component {

    @property({ type: Enum(RESOURCE_TYPE), tooltip: "资源类型" })
    type: RESOURCE_TYPE = RESOURCE_TYPE.NONE;

    @property(CCFloat) offsetX: number = 0;
    @property(CCFloat) offsetZ: number = 0;
    @property(CCFloat) offsetY: number = 0;


    private checkRange: number = 5;
    private tween: Tween<Node> = null;

    // 是否可以检测玩家
    public bol: boolean = false;

    protected onLoad(): void {
    }

    timer: any = null;

    protected start(): void {
        this.schedule(() => {
            if (!this.bol) return;
            if (this.tween) return;
            this.collect();
        }, 0.1);

        this.timer = setTimeout(() => {
            clearTimeout(this.timer);
            this.node.destroy();
        }, 30000);
    }

    collect() {
        const player = Player.ins;
        const playerCom = player.getComponent(Player);
        const playerNode = player.node;

        const meatPos = this.node.worldPosition; // 起点是自身
        const playerPos = playerNode.worldPosition;

        if (Vec3.distance(playerPos, meatPos) < this.checkRange) {
            const _point = this.type == RESOURCE_TYPE.MEAT ? playerCom.point1 : playerCom.point2; // 挂点

            if (_point.children.length >= 50) {
                UIMager.instance.maxTipAni();
                return;
            }

            if (this.timer) {
                clearTimeout(this.timer);
            }

            const endPos = this.getEndPos(_point);

            const controlPos = new Vec3(
                endPos.x + this.offsetX,
                endPos.y + this.offsetY,
                endPos.z + this.offsetZ
            )

            this.tween = new Tween(this.node)
                .bezierTo3D(0.3, meatPos, controlPos, endPos)
                .call(() => {

                    // const _node = DropsMager.instance.getResourceNode(this.type);
                    // _node.parent = _point;
                    // const list = this.type == RESOURCE_TYPE.MEAT ? playerCom.meatList : playerCom.wheatList;
                    // list.push(_node);
                    // this.node.destroy();

                    // 保存世界坐标
                    const worldPos = this.node.worldPosition.clone();

                    // 切换父节点
                    this.node.setParent(_point);

                    // 将世界坐标转换为新父节点的本地坐标
                    const localPos = new Vec3();
                    _point.inverseTransformPoint(localPos, worldPos);
                    this.node.setPosition(localPos);

                    this.bol = false;
                    const list = this.type == RESOURCE_TYPE.MEAT ? playerCom.meatList : playerCom.wheatList;
                    list.push(this.node);
                })
                .start();

        }
    }

    getEndPos(_point: Node): Vec3 {
        let endPos = new Vec3();
        if (_point.children.length > 0) {
            endPos = _point.children[_point.children.length - 1].worldPosition;
        } else {
            endPos = _point.worldPosition;
        }
        return endPos;
    }
}


