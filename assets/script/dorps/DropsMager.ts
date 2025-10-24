import { _decorator, Component, instantiate, Node, Prefab, Tween, Vec3 } from 'cc';
import { EVENT_TYPE, IEvent } from '../tools/CustomEvent';
import { Player } from '../player/Player';
import { Resources } from './Resources';
import { ResquetBody, RESOURCE_TYPE } from '../config/GameData';
const { ccclass, property } = _decorator;

@ccclass('DropsMager')
export class DropsMager extends Component {

    public static instance: DropsMager = null;

    @property({ type: Prefab, tooltip: "麦垛" }) wheats: Prefab = null;
    @property({ type: Prefab, tooltip: "肉" }) meat: Prefab = null;

    protected onLoad(): void {
        DropsMager.instance = this;
        IEvent.on(EVENT_TYPE.DROP_RESOURCE, this.dropResource, this)
    }

    dropResource(body: ResquetBody) {
        const type: RESOURCE_TYPE = body.type;
        let num: number = 0;
        switch (type) {
            case RESOURCE_TYPE.NONE: break;
            case RESOURCE_TYPE.MEAT: num = body.params.meat; break;
            case RESOURCE_TYPE.WHEAT: num = 1; break;
            default: break;
        }

        for (let i = 0; i < num; i++) {
            const startPos = body.params ? body.params.pos : Player.ins.node.worldPosition;
            const _node = this.getResourceNode(body.type);
            _node.parent = this.node;
            _node.setWorldPosition(startPos);

            // 高度
            const controlPos = new Vec3(
                startPos.x,
                startPos.y + 5,
                startPos.z
            );

            // 计算随机终点（在node周围随机位置）
            const randomRadius = 1; // 随机半径范围
            const randomAngle = Math.random() * Math.PI;
            const offsetX = Math.cos(randomAngle) * randomRadius;
            const offsetZ = Math.sin(randomAngle) * randomRadius;
            const endPos = new Vec3(
                startPos.x + offsetX,
                0.5,
                startPos.z + offsetZ
            );

            new Tween(_node)
                .bezierTo3D(0.5, startPos, controlPos, endPos)
                .call(() => {
                    _node.getComponent(Resources).bol = true;
                })
                .start();
        }

    }

    public getResourceNode(type: RESOURCE_TYPE): Node {
        switch (type) {
            case RESOURCE_TYPE.MEAT:
                return instantiate(this.meat);

            case RESOURCE_TYPE.WHEAT:
                return instantiate(this.wheats);

            default:
                return null;
        }
    }


}


