import { _decorator, BoxCollider, Component, Enum, ICollisionEvent, Node } from 'cc';
import { Player } from '../player/Player';
import { Vec3 } from 'cc';
import { LandmarkType } from '../config/GameData';
import { Tween } from 'cc';
import { director } from 'cc';
import { Label } from 'cc';
import { HunterMager } from '../hunter/HunterMager';
import { UIMager } from '../UIMager';
const { ccclass, property } = _decorator;

// let mark: Landmark = null;

let meatNumber: number = 0;
let wheatNumber: number = 0;

@ccclass('Landmark')
export class Landmark extends Component {

    @property({ type: Enum(LandmarkType), displayName: "地标类型" })
    landmarkType: LandmarkType = LandmarkType.None;

    private boxCollider: BoxCollider = null!;

    private isCollideing: boolean = false;

    protected onLoad(): void {
        this.boxCollider = this.node.getComponent(BoxCollider);
    }

    protected start(): void {
        this.boxCollider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.boxCollider.on('onTriggerExit', this.onTriggerExit, this);

        this.schedule(() => {
            if (!this.isCollideing) return;

            const player = Player.ins;
            const playerCom = player.node.getComponent(Player);

            let startPos = new Vec3();
            let controlPos = new Vec3();
            let endPos = new Vec3();

            let node: Node = null!;

            switch (this.landmarkType) {
                case LandmarkType.SubmitWheat:
                    if (playerCom.wheatList.length <= 0) return;
                    node = playerCom.wheatList.pop();
                    break;

                case LandmarkType.SubmitMeat:
                    if (playerCom.meatList.length <= 0) return;
                    node = playerCom.meatList.pop();
                    // meatNumber++;
                    // this.node.getChildByName("Label").getComponent(Label).string = `${meatNumber}/50`;
                    // if (meatNumber >= 50) {
                    //     meatNumber -= 50;
                    // }
                    break;
            }

            const worldPos = node.worldPosition.clone();
            startPos = worldPos;

            director.getScene().addChild(node);

            node.setWorldPosition(worldPos);
            node.setRotation(player.node.rotation)

            endPos = this.node.worldPosition;
            controlPos = new Vec3(
                startPos.x,
                startPos.y,
                startPos.z
            )

            new Tween(node)
                .bezierTo3D(0.3, startPos, controlPos, endPos)
                .call(() => {

                    if (this.landmarkType === LandmarkType.SubmitWheat) {
                        wheatNumber++;
                        for (let i = 0; i < 3; i++) {
                            this.scheduleOnce(() => {
                                UIMager.instance.loadGoldToUI();
                            }, 0.1 * i)
                        }
                        // UIMager.instance.loadGoldToUI();
                    }
                    if (this.landmarkType === LandmarkType.SubmitMeat) {
                        meatNumber++;
                        if (meatNumber == 1) {
                            meatNumber = 0;
                            HunterMager.instance.loadHunter();
                        }
                    }

                    // 逻辑。。。。
                    // 提交小麦获取金币
                    // 提交肉召唤猎人
                    node.destroy();
                })
                .start();
        }, 0.1)
    }

    onTriggerEnter(event: ICollisionEvent) {
        this.isCollideing = true;
    }

    onTriggerExit(event: ICollisionEvent) {
        this.isCollideing = false;
    }

    protected onDestroy(): void {
        this.boxCollider.off('onTriggerEnter', this.onTriggerEnter, this);
        this.boxCollider.off('onTriggerExit', this.onTriggerExit, this);
    }
}