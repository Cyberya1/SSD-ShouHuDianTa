import { _decorator, CCFloat, Component, Node, Vec3 } from 'cc';
import { Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum CameraMode {
    None,
    Follow
}

@ccclass('CameraCtrl')
export class CameraCtrl extends Component {
    public static ins: CameraCtrl = null;

    @property(Node)
    cameraNode: Node = null!;

    @property({ type: Enum(CameraMode) })
    cameraMode: CameraMode = CameraMode.None;

    // 跟随模式参数
    @property(Node)
    public followTarget: Node = null!;

    @property(Vec3)
    public followOffset: Vec3 = new Vec3(0, 0, 0);

    private _originalOffset: Vec3 = new Vec3(0, 0, 0);
    private _currentPosition: Vec3 = new Vec3(0, 0, 0);

    @property({ displayName: "加载后自动跟随" })
    public playOnLoadFollow: boolean = false;

    @property({ displayName: "平滑跟随", tooltip: "启用后相机会平滑地跟随目标" })
    public smoothFollow: boolean = true;

    @property({
        type: CCFloat,
        displayName: "平滑速度",
        tooltip: "值越大跟随越快",
        visible: function (this: CameraCtrl) { return this.smoothFollow; }
    })
    public smoothSpeed: number = 5.0;

    @property({
        displayName: "限制移动边界",
        tooltip: "启用后相机会在设定的边界内移动"
    })
    public enableBounds: boolean = false;

    @property({
        displayName: "最小边界",
        visible: function (this: CameraCtrl) { return this.enableBounds; }
    })
    public minBounds: Vec3 = new Vec3(-100, -100, -100);

    @property({
        displayName: "最大边界",
        visible: function (this: CameraCtrl) { return this.enableBounds; }
    })
    public maxBounds: Vec3 = new Vec3(100, 100, 100);

    protected onLoad(): void {
        CameraCtrl.ins = this;
    }

    protected start(): void {
        if (this.playOnLoadFollow) {
            if (!this.followTarget) {
                console.log("请设置跟随目标");
            } else {
                this.cameraMode = CameraMode.Follow;
                this.calculateOriginalOffset();
            }
        }

        if (this.cameraNode == null) {
            this.cameraNode = this.node;
        }

        // 初始化当前位置
        if (this.cameraNode) {
            this.cameraNode.getWorldPosition(this._currentPosition);
        }

    }


    public setCamera(cameraNode: Node): void {
        this.cameraNode = cameraNode;
        this.cameraNode.getWorldPosition(this._currentPosition);
    }

    public setFollowTarget(target: Node): void {
        this.followTarget = target;
        this.calculateOriginalOffset();
    }

    private calculateOriginalOffset(): void {
        if (this.followTarget && this.cameraNode) {
            const targetPos = new Vec3();
            const cameraPos = new Vec3();

            this.followTarget.getWorldPosition(targetPos);
            this.cameraNode.getWorldPosition(cameraPos);

            Vec3.subtract(this._originalOffset, cameraPos, targetPos);
        }
    }

    public switchCameraMode(mode: CameraMode): void {
        this.cameraMode = mode;
        if (mode === CameraMode.Follow && this.followTarget) {
            this.calculateOriginalOffset();
        }
    }

    public setFollowOffset(offset: Vec3): void {
        this.followOffset.set(offset);
    }

    protected lateUpdate(dt: number): void {
        if (this.cameraMode === CameraMode.Follow) {
            this.handleFollowMode(dt);
        }
    }

    private handleFollowMode(dt: number): void {
        if (!this.followTarget || !this.cameraNode) {
            return;
        }

        // 获取目标世界位置
        const targetWorldPos = new Vec3();
        this.followTarget.getWorldPosition(targetWorldPos);

        // 计算目标相机位置
        const targetCameraPos = new Vec3();
        Vec3.add(targetCameraPos, targetWorldPos, this._originalOffset);
        Vec3.add(targetCameraPos, targetCameraPos, this.followOffset);

        // 应用边界限制
        if (this.enableBounds) {
            this.applyBounds(targetCameraPos);
        }

        // 平滑移动或直接设置位置
        if (this.smoothFollow) {
            this.smoothMoveTo(targetCameraPos, dt);
        } else {
            this.cameraNode.setWorldPosition(targetCameraPos);
            targetCameraPos.set(this._currentPosition);
        }
    }

    private smoothMoveTo(targetPos: Vec3, dt: number): void {
        // 使用插值实现平滑移动
        Vec3.lerp(this._currentPosition, this._currentPosition, targetPos, this.smoothSpeed * dt);
        this.cameraNode.setWorldPosition(this._currentPosition);
    }

    private applyBounds(position: Vec3): void {
        position.x = Math.max(this.minBounds.x, Math.min(this.maxBounds.x, position.x));
        position.y = Math.max(this.minBounds.y, Math.min(this.maxBounds.y, position.y));
        position.z = Math.max(this.minBounds.z, Math.min(this.maxBounds.z, position.z));
    }

    // 立即跳转到目标位置
    public teleportToTarget(): void {
        if (!this.followTarget || !this.cameraNode) {
            return;
        }

        const targetWorldPos = new Vec3();
        this.followTarget.getWorldPosition(targetWorldPos);

        const targetCameraPos = new Vec3();
        Vec3.add(targetCameraPos, targetWorldPos, this._originalOffset);
        Vec3.add(targetCameraPos, targetCameraPos, this.followOffset);

        if (this.enableBounds) {
            this.applyBounds(targetCameraPos);
        }

        this.cameraNode.setWorldPosition(targetCameraPos);
        targetCameraPos.set(this._currentPosition);
    }

    // 重置偏移量
    public resetOffset(): void {
        this.followOffset.set(0, 0, 0);
        if (this.followTarget) {
            this.calculateOriginalOffset();
        }
    }

    // 获取当前相机在世界空间中的位置
    public getCameraWorldPosition(out?: Vec3): Vec3 {
        if (!out) {
            out = new Vec3();
        }
        return this.cameraNode ? this.cameraNode.getWorldPosition(out) : out;
    }
}