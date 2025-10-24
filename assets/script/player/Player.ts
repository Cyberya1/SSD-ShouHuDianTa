import { _decorator, Camera, CCBoolean, Component, isValid, Node, RigidBody, Sprite, UIOpacity, Vec3 } from 'cc';
import { Joystick } from './Joystick';
import { PlayerInfo } from '../config/GameData';
import { ZombieMager } from '../zombie/ZombieMager';
import { Zombie } from '../zombie/Zombie';
import { GameMager } from '../GameMager';
import { Tween } from 'cc';
import { tween } from 'cc';
import { SkeletalAnimation } from 'cc';
import { EVENT_TYPE, IEvent } from '../tools/CustomEvent';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    public static ins: Player = null;

    max: number = 50;

    @property(Node)
    joystick: Node = null!; // 虚拟摇杆节点

    @property(Camera)
    mainCamera: Camera = null!; // 主相机节点

    @property(Node)
    hp: Node = null; // HP节点

    @property({
        type: CCBoolean,
        displayName: "相机朝向",
        visible: function (this: Player) { return !!this.mainCamera; }
    })
    isCameraOrientation: boolean = true;

    meatList: Node[] = [];
    wheatList: Node[] = [];

    // @property(Bag) bag: Bag = null;

    @property({ type: Node, tooltip: "物品挂载点" }) point1: Node = null;
    @property({ type: Node, tooltip: "物品挂载点" }) point2: Node = null;

    private rigidBody: RigidBody = null;
    private hpbar: Sprite = null;
    private uio: UIOpacity = null;
    private currentHp: number = PlayerInfo.HP;
    private startGame: boolean = false;

    private playerAni: SkeletalAnimation = null;

    protected onLoad(): void {
        Player.ins = this;

        this.rigidBody = this.getComponent(RigidBody);
        this.hpbar = this.hp.getChildByName("Bar").getComponent(Sprite);
        this.uio = this.hp.getComponent(UIOpacity);
        this.playerAni = this.getComponent(SkeletalAnimation);


        this.uio.opacity = 0;
        IEvent.on(EVENT_TYPE.GAME_START, () => {
            this.startGame = true;
        });
    }

    protected start(): void {
        this.schedule(() => {
            this.attack();
        }, 0.1)
    }

    attack() {

        // 获取所有存活的僵尸
        const zombies = ZombieMager.ins.Zombies.filter(zombie =>
            zombie && zombie.node && isValid(zombie.node)
        );

        if (zombies.length === 0) return;

        // 获取玩家位置
        const playerPos = this.node.worldPosition;

        // 筛选出攻击范围内的僵尸
        const zombiesInRange = zombies.filter(zombie => {
            const zombiePos = zombie.node.worldPosition;
            const distance = Vec3.distance(playerPos, zombiePos);
            return distance <= PlayerInfo.AttackRange;
        });

        if (zombiesInRange.length === 0) return;

        // 找到距离最近的僵尸
        let closestZombie: Zombie | null = null;
        let minDistance = Infinity;

        for (const zombie of zombiesInRange) {
            const zombiePos = zombie.node.worldPosition;
            const distance = Vec3.distance(playerPos, zombiePos);

            if (distance < minDistance) {
                minDistance = distance;
                closestZombie = zombie;
            }
        }

        // 攻击最近的僵尸
        if (closestZombie) {
            // 转向目标僵尸
            // const targetPos = closestZombie.node.worldPosition;
            // const direction = new Vec3();
            // Vec3.subtract(direction, targetPos, playerPos);
            // direction.y = 0; // 保持在水平面上

            // if (direction.length() > 0.1) {
            //     const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
            //     this.node.setRotationFromEuler(0, angle, 0);
            // }

            // 执行攻击
            closestZombie.beHurt(PlayerInfo.Attack);
        }
    }

    private hpTween: Tween<Node> = null;
    beHurt(num: number) {
        this.currentHp -= num;
        this.hpbar.fillRange = this.currentHp / PlayerInfo.HP;
        this.uio.opacity = 255;


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

    update(deltaTime: number) {
        if (!this.startGame) return;
        const joystickComp = this.joystick.getComponent(Joystick);
        const joystickDir = joystickComp.direction;
        let moveDirection = new Vec3();

        if (joystickDir.length() > 0.1) {
            // 使用相机朝向
            if (this.isCameraOrientation) {
                const cameraForward = new Vec3();
                const cameraRight = new Vec3();

                Vec3.transformQuat(cameraForward, Vec3.FORWARD, this.mainCamera.node.worldRotation);
                cameraForward.y = 0;
                cameraForward.normalize();

                Vec3.transformQuat(cameraRight, Vec3.RIGHT, this.mainCamera.node.worldRotation);
                cameraRight.y = 0;
                cameraRight.normalize();

                Vec3.scaleAndAdd(moveDirection, moveDirection, cameraForward, joystickDir.y);
                Vec3.scaleAndAdd(moveDirection, moveDirection, cameraRight, joystickDir.x);

                moveDirection.normalize();

                // 旋转角色朝向移动方向
                if (moveDirection.length() > 0.1) {
                    let targetAngle: number;
                    if (this.isCameraOrientation) {
                        targetAngle = Math.atan2(moveDirection.x, moveDirection.z) * 180 / Math.PI;
                    } else {
                        // 使用摇杆方向计算角色朝向
                        targetAngle = Math.atan2(joystickDir.x, joystickDir.y) * 180 / Math.PI;
                    }
                    const currentAngle = this.node.eulerAngles.y;
                    // let newAngle = this.lerpAngle(currentAngle, targetAngle, this.rotationSpeed * deltaTime);
                    this.node.setRotationFromEuler(0, targetAngle, 0);
                }

                // 不使用相机朝向，直接使用摇杆方向
            } else {
                moveDirection.set(joystickDir.x, 0, -joystickDir.y);
                moveDirection.normalize();

                // 旋转角色朝向移动方向
                if (moveDirection.length() > 0.1) {
                    let targetAngle: number;
                    if (this.isCameraOrientation) {
                        targetAngle = Math.atan2(moveDirection.x, moveDirection.z) * 180 / Math.PI;
                    } else {
                        // 使用摇杆方向计算角色朝向
                        targetAngle = Math.atan2(joystickDir.x, -joystickDir.y) * 180 / Math.PI;
                    }
                    const currentAngle = this.node.eulerAngles.y;
                    // let newAngle = this.lerpAngle(currentAngle, targetAngle, this.rotationSpeed * deltaTime);
                    this.node.setRotationFromEuler(0, targetAngle, 0);

                }
            }

            // 设置线性速度
            const velocity = new Vec3(
                moveDirection.x * PlayerInfo.Speed,
                0,
                moveDirection.z * PlayerInfo.Speed
            );
            this.rigidBody.setLinearVelocity(velocity);
            this.playAni("Run");
        } else {
            // 当没有输入时，停止移动
            this.rigidBody.setLinearVelocity(Vec3.ZERO);
            this.playAni("Idle");
        }
    }

    protected lateUpdate(dt: number): void {
        this.hp.setWorldRotation(GameMager.ins.camera.node.worldRotation);
    }

    // 角度插值函数（处理360度环绕）
    private lerpAngle(current: number, target: number, factor: number): number {
        let delta = target - current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        return current + delta * factor;
    }

    public static GetPlayerNode(): Node {
        return Player.ins.node;
    }

    public static GetPlaerComp(): Player {
        return Player.ins.getComponent(Player);
    }

    playAni(name: string) {
        if (this.playerAni.getState(name)?.isPlaying) return;
        this.playerAni.play(name);
    }
}