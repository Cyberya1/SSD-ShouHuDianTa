import { _decorator, Vec2, Vec3, Component, Node, EventTouch, UITransform, v3, NodeEventType } from 'cc';
import { GameMager } from '../GameMager';
import { SkeletalAnimation } from 'cc';
const { property, ccclass, } = _decorator

@ccclass("Joystick")
export class Joystick extends Component {

    public static ins: Joystick = null;

    @property(Node) point: Node = null;
    @property(Node) touchPanel: Node = null;

    // @property(SkeletalAnimation) gcjAni: SkeletalAnimation = null;

    // 摇杆最大半径
    MaxRadius: number = 0;

    // 摇杆方向(用于中心点)
    private _dir: Vec3 = new Vec3(0, 0);

    // 摇杆方向(用于角色移动)
    private _direction: Vec2 = new Vec2();

    /** 角度 */
    // roleAngle: number = 0;

    currentPos: Vec3 = v3(0, 0);


    onLoad() {
        this.currentPos = this.node.getPosition().clone();

        if (Joystick.ins == null) {
            Joystick.ins = this;
        }
        this.init();
    }

    init() {
        this.MaxRadius = this.node.getComponent(UITransform).width / 2;

        this.touchPanel.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
        this.touchPanel.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchPanel.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
        this.touchPanel.on(NodeEventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        let pos = this.touchPanel.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y, 0));
        this.node.setPosition(pos.x, pos.y, 0);

        GameMager.ins.handTip.active = false;
        GameMager.ins.handTipTimer = 0;

        // this.gcjAni.play("Work");
    }

    private onTouchMove(event: EventTouch) {
        let worldPos = event.getUILocation();
        let localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(worldPos.x, worldPos.y, 0));
        let length = localPos.length();
        GameMager.ins.handTipTimer = 0;

        this._direction = new Vec2(localPos.x, localPos.y).normalize()

        if (length > 0) {
            //  只计算方向
            this._dir.x = localPos.x / length;
            this._dir.y = localPos.y / length;
            // 计算最外一圈的x,y位置
            if (length > this.MaxRadius) {
                localPos.x = this.MaxRadius * this._dir.x;
                localPos.y = this.MaxRadius * this._dir.y;
            }
            this.point.setPosition(localPos);
        }
    }

    private onTouchEnd(event: NodeEventType) {
        this._dir = v3(0, 0, 0);
        this.point.setPosition(0, 0, 0);

        this.node.setPosition(this.currentPos);
        GameMager.ins.handTipTimer = 0;

        this._direction = new Vec2();

        // this.gcjAni.pause();
    }

    // /** 求角度 */
    // public calculateAngle() {
    //     if (this._dir.x === 0 && this._dir.y === 0) return this.roleAngle;
    //     // 计算单位向量相对于正右方向的角度（以弧度表示）
    //     let angleRad = Math.atan2(this._dir.y, this._dir.x);
    //     // 将弧度转换为角度（以度数表示）
    //     this.roleAngle = angleRad * 180 / Math.PI;
    //     return this.roleAngle;
    // }

    public get direction(): Vec2 {
        return this._direction;
    }

}