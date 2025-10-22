import { _decorator, Component, Node, Vec3 } from 'cc';
import { ZombieMager } from '../zombie/ZombieMager';
import { Zombie } from '../zombie/Zombie';
import { GameMager } from '../GameMager';
import { CapsuleCollider } from 'cc';
import { ICollisionEvent } from 'cc';
import { ColliderGroup, HunterInfo } from '../config/GameData';
import { UIOpacity } from 'cc';
import { Sprite } from 'cc';
import { tween } from 'cc';
import { Tween } from 'cc';
import { HunterMager } from './HunterMager';
import { SkeletalAnimation } from 'cc';
import { isValid } from 'cc';

const { ccclass, property } = _decorator;

export enum HunterState {
    IDLE = "Idle",
    RUN = "Run",
    ATTACK = "Attack",
    DIE = "Die"
}

@ccclass('HunterController')
export class HunterController extends Component {

    @property(Node) hp: Node = null;

    @property(SkeletalAnimation) ani: SkeletalAnimation = null;

    /** 临时目标  门外 */
    private _Target: Node = null;
    private currentHP: number = 0;
    private uio: UIOpacity = null;
    private hpbar: Sprite = null;
    private state: HunterState = HunterState.IDLE;
    private hpTween: Tween<Node> = null;
    private currentTarget: Zombie = null;

    protected onLoad(): void {
        this.currentHP = HunterInfo.HP;
        this.uio = this.hp.getComponent(UIOpacity);
        this.hpbar = this.hp.getChildByName("Bar").getComponent(Sprite);

        this.playAni(HunterState.IDLE)
    }

    start() {
        this.playAni(HunterState.RUN);
    }


    update(deltaTime: number) {
        if (this.state == HunterState.IDLE || this.state == HunterState.RUN) {

            // 优先移动到设定的目标点
            if (this._Target) {
                const targetPos = this._Target.worldPosition;
                const currentPos = this.node.worldPosition;
                const distanceToTarget = Vec3.distance(targetPos, currentPos);

                if (distanceToTarget > 1) {
                    this.moveToTarget(targetPos, currentPos, deltaTime);
                    return;
                } else {
                    this._Target = null;
                }
            }

            if (this.currentTarget && isValid(this.currentTarget)) {
                const targetPos = this.currentTarget.node.worldPosition;
                const currentPos = this.node.worldPosition;
                const distanceToTarget = Vec3.distance(targetPos, currentPos);

                if (distanceToTarget <= HunterInfo.AttackRange) {
                    this.performAttack();
                } else {
                    this.moveToTarget(targetPos, currentPos, deltaTime);
                }
            } else {
                this.currentTarget = ZombieMager.ins.returnMinDistanceZombie(this.node);
            }
        }
    }

    setPoint(point: Node) {
        this._Target = point;
    }

    /**
     * 动画帧事件，触发实际造成伤害的逻辑
     */
    onAttack() {
        if (this.currentTarget && isValid(this.currentTarget)) {
            console.log("攻击", this.currentTarget.name)
            this.currentTarget.beHurt(HunterInfo.Attack);
        }
    }

    /**
     * 播放攻击动画并切换状态为攻击
     * 设置动画监听，动画播放完毕后设置状态为idle
     * @returns 
     */
    private performAttack(): void {
        if (this.state == HunterState.ATTACK) return;
        this.playAni(HunterState.ATTACK);

        this.ani.once(SkeletalAnimation.EventType.FINISHED, (() => {
            this.playAni(HunterState.RUN);
            this.currentTarget = null;
            console.log("攻击动画结束 恢复为待机状态", this.state)
        }))
    }

    protected lateUpdate(dt: number): void {
        this.hp.setWorldRotation(GameMager.ins.camera.node.worldRotation);
    }

    public beHurt(num: number) {
        this.currentHP -= num;
        this.uio.opacity = 255;
        this.hpbar.fillRange = this.currentHP / HunterInfo.HP;

        if (this.currentHP <= 0) {
            HunterMager.instance.recycleHunter(this.node);
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

    /**
     * 移动到目标节点
     * @param targetPos 目标世界坐标
     * @param currentPos 当前世界坐标
     * @param deltaTime 时间
     */
    private moveToTarget(targetPos: Vec3, currentPos: Vec3, deltaTime: number): void {
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, currentPos);

        if (direction.length() > 1) {
            direction.normalize();
            const moveDistance = HunterInfo.Speed * deltaTime;
            const newPos = currentPos.add(direction.multiplyScalar(moveDistance));

            this.node.setWorldPosition(newPos);
            this.playAni(HunterState.RUN)

            if (direction.length() > 0.1) {
                const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
                this.node.eulerAngles = new Vec3(0, angle, 0);
            }
        }
    }

    /**
     * 播放动画并切换状态
     * @param state 状态
     * @returns 
     */
    private playAni(state: HunterState) {
        this.state = state;
        if (this.ani.getState(state)?.isPlaying) return;
        this.ani.play(state);
    }
}