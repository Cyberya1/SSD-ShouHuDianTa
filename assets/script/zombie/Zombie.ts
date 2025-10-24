import { _decorator, CapsuleCollider, Component, ICollisionEvent, isValid, Node, Sprite, UIOpacity, Vec3 } from 'cc';
import { ZombieMager, ZombieType } from './ZombieMager';
import { ColliderGroup, RESOURCE_TYPE, ResquetBody } from '../config/GameData';
import { Wall } from '../wall/Wall';
import { EVENT_TYPE, IEvent } from '../tools/CustomEvent';
import { GameMager } from '../GameMager';
import { Tween } from 'cc';
import { tween } from 'cc';
import { SkeletalAnimation } from 'cc';
import { HunterController } from '../hunter/HunterController';
const { ccclass, property } = _decorator;

export enum ZombieState {
    Idle = "Idle",
    Run = "Run",
    Attack = "Attack",
    _Attack = "_Attack",
    Die = "Die",
}

@ccclass('Zombie')
export class Zombie extends Component {

    @property(Node) hp: Node = null;
    @property(SkeletalAnimation) ske: SkeletalAnimation = null;
    @property(CapsuleCollider) capsuleCollider: CapsuleCollider = null;

    private hpbar: Sprite = null;
    private uio: UIOpacity = null;
    private target: Node = null;
    private _hp: number = 0;
    private type: ZombieType = null;
    private _data: any = null;
    private state: ZombieState = ZombieState.Idle;
    private hpTween: Tween<Node> = null;
    private _attackTarget: Node = null;

    protected onLoad(): void {
        this.hpbar = this.hp.getChildByName("Bar").getComponent(Sprite);
        this.uio = this.hp.getComponent(UIOpacity);
        this.playAni(ZombieState.Idle);
    }

    protected start(): void {
        this.capsuleCollider.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    protected update(dt: number): void {
        this.move(dt);
        this.hp.setWorldRotation(GameMager.ins.camera.node.worldRotation);
    }

    public init(type: ZombieType, data: any, target: Node) {
        this.type = type;
        this._data = data;
        this.target = target;
        this.reset();
    }

    private onTriggerEnter(event: ICollisionEvent) {
        if (event.otherCollider.getGroup() === ColliderGroup.Building ||
            event.otherCollider.getGroup() === ColliderGroup.Hunter) {
            this.state = ZombieState.Attack;
            this._attackTarget = event.otherCollider.node;
            this.capsuleCollider.enabled = false;

            if (this._attackTarget && isValid(this._attackTarget)) {
                const targetPos = this._attackTarget.worldPosition;
                const currentPos = this.node.worldPosition;
                const direction = new Vec3();
                Vec3.subtract(direction, targetPos, currentPos);

                if (direction.length() > 0.1) {
                    direction.y = 0;
                    const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
                    this.node.eulerAngles = new Vec3(0, angle, 0);
                }
            }

            let attackAniName: ZombieState = ZombieState.Attack;
            if (this.type == ZombieType.Big) {
                const randomNum = Math.floor(Math.random() * 2) + 1;
                if (randomNum === 2) attackAniName = ZombieState._Attack;
            }

            this.playAni(attackAniName);

            this.ske.once(SkeletalAnimation.EventType.FINISHED, (() => {
                this.state = ZombieState.Run;
                this.capsuleCollider.enabled = true;
                this._attackTarget = null;
                this.playAni(ZombieState.Idle);
            }));
        }
    }

    onAttack() {
        if (this._attackTarget && isValid(this._attackTarget)) {
            if (this._attackTarget.getComponent(Wall)) {
                this._attackTarget.getComponent(Wall).beHurt(this._data.Attack);
            } else if (this._attackTarget.getComponent(HunterController)) {
                this._attackTarget.getComponent(HunterController).beHurt(this._data.Attack);
            }
        }
    }


    private move(dt: number) {
        if (!this._data) return;
        if (this.state == ZombieState.Run || this.state == ZombieState.Idle) {

            const currentPosition = this.node.worldPosition;
            let targetPosition: Vec3 = null;
            if (this.target && isValid(this.target)) {
                targetPosition = this.target.worldPosition;

                // 计算方向向量
                const direction = new Vec3();
                Vec3.subtract(direction, targetPosition, currentPosition);

                // 设置移动速度
                const movement = new Vec3();
                Vec3.normalize(movement, direction);
                movement.multiplyScalar(this._data.Speed * dt);

                // 更新位置
                const newPosition = new Vec3();
                Vec3.add(newPosition, currentPosition, movement);
                this.node.setWorldPosition(newPosition);

                this.playAni(ZombieState.Run);

                if (direction.length() > 0.1) { 
                    direction.y = 0; 
                    const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
                    this.node.eulerAngles = new Vec3(0, angle, 0);
                }
            } else {
                this.target = ZombieMager.ins.getTarget(this.node);
                targetPosition = this.target.worldPosition;
            }
        }
    }

    public beHurt(num: number) {
        if (this.node && isValid(this.node)) {
            this.uio.opacity = 255;
            this._hp -= num;
            this.hpbar.fillRange = this._hp / this._data.HP;

            if (this._hp <= 0) {
                this.state = ZombieState.Die;
                this.capsuleCollider.enabled = false;

                const requstBody = new ResquetBody(RESOURCE_TYPE.MEAT, { pos: this.node.worldPosition.clone(), meat: this._data.Meat })
                IEvent.emit(EVENT_TYPE.DROP_RESOURCE, requstBody)

                this.scheduleOnce(() => {
                    IEvent.emit(EVENT_TYPE.ZOMBIE_DIED, this.node, this.type);
                }, 0)
            }

            if (this.hpTween) {
                this.hpTween.stop();
            }
            this.hpTween = tween(this.hp)
                .delay(3)
                .call(() => {
                    this.uio.opacity = 0;
                })
                .start();
        }
    }

    private playAni(state: ZombieState) {
        this.state = state;
        if (this.ske.getState(state)?.isPlaying) return;
        this.ske.play(state);
    }

    private reset() {
        this._hp = this._data.HP;
        this.hpbar.fillRange = 1;
        this.capsuleCollider.enabled = true;
        this.uio.opacity = 0;
    }

    protected onDestroy(): void {
        if (this.capsuleCollider) {
            this.capsuleCollider.off('onTriggerEnter', this.onTriggerEnter, this);
        }
    }


}


