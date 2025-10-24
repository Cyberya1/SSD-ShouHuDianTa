import { _decorator, Component, find, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
import { WallMager } from '../wall/WallMager';
import { Zombie } from './Zombie';
import { EVENT_TYPE, IEvent } from '../tools/CustomEvent';
import { ZombieInfo } from '../config/GameData';
const { ccclass, property } = _decorator;

export enum ZombieType {
    Small = 0,
    Big = 1,
}

@ccclass('ZombieMager')
export class ZombieMager extends Component {
    public static ins: ZombieMager = null;

    @property(Prefab) smallZombie: Prefab = null;
    @property(Prefab) bigZombie: Prefab = null;
    @property([Node]) points: Node[] = [];

    Zombies: Zombie[] = [];
    zombieTotal: number = 0;


    protected onLoad(): void {
        ZombieMager.ins = this;

        IEvent.on(EVENT_TYPE.ZOMBIE_DIED, this.zombieDied, this);
        IEvent.on(EVENT_TYPE.GAME_START, (() => {
            this.loadFirstZombies();
        }));
    }

    private isSecondZombiesLoaded: boolean = false;
    protected start(): void {
        if (this.isSecondZombiesLoaded) return;
        this.scheduleOnce(() => {
            this.loadSecondZombies();
        }, 100)
    }

    loadFirstZombies() {
        for (let i = 0; i < ZombieInfo.First; i++) {
            this.scheduleOnce(() => {
                this.loadZombie();
            }, 0.2 * i);
        }
    }

    // 第二波批次
    private pc: number = 2;
    loadSecondZombies() {

        for (let i = 0; i < ZombieInfo.Second / 2; i++) {
            this.scheduleOnce(() => {
                this.loadZombie();
            }, 0.2 * i);
        }

        this.scheduleOnce(() => {
            for (let i = 0; i < ZombieInfo.Second / 2; i++) {
                this.scheduleOnce(() => {
                    this.loadZombie();
                }, 0.2 * i);
            }
        }, 10)
    }

    zombieDied(die_node: Node, type: ZombieType) {
        this.Zombies = this.Zombies.filter(zombie => zombie !== die_node.getComponent(Zombie));

        this.scheduleOnce(() => {
            die_node.destroy();
        }, 0)
    }

    loadZombie() {
        this.zombieTotal++
        let data: any = null;
        let _zombie: Node = null;
        let type: ZombieType = null;
        if (this.zombieTotal % 5 == 0) {
            _zombie = instantiate(this.bigZombie);
            data = ZombieInfo.Big;
            type = ZombieType.Big;
        } else {
            _zombie = instantiate(this.smallZombie);
            data = ZombieInfo.Small;
            type = ZombieType.Small;
        }
        const targetPos = this.getRandomPoint().worldPosition;
        _zombie.setWorldPosition(new Vec3(targetPos.x, _zombie.worldPosition.y, targetPos.z))
        _zombie.parent = this.node;
        _zombie.name = `Zombie ${this.zombieTotal} 号`
        const target = this.getTarget(_zombie);
        _zombie.getComponent(Zombie).init(type, data, target);
        this.Zombies.push(_zombie.getComponent(Zombie));
    }

    /**
     * 随机出生点
     * @returns 
     */
    getRandomPoint(): Node {
        if (this.points.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * this.points.length);
        return this.points[randomIndex];
    }

    /**
     * 最近的wall
     * @param node 
     * @returns 
     */
    getTarget(node: Node) {
        const walls = WallMager.ins.node.children;
        if (walls.length === 0) {
            return null;
        }

        let closestWall: Node = null;
        let minDistance = Number.MAX_VALUE;

        const nodePosition = node.worldPosition;

        for (let i = 0; i < walls.length; i++) {
            const wall = walls[i];
            const distance = Vec3.distance(nodePosition, wall.worldPosition);

            if (distance < minDistance) {
                minDistance = distance;
                closestWall = wall;
            }
        }

        return closestWall;
    }

    /**
     * 查找最近距离的zombie
     * @param target 目标
     * @returns zombie
     */
    public returnMinDistanceZombie(target: Node): Zombie {
        let minDisZombie: Zombie = null;
        let minDis = Number.MAX_VALUE;
        for (let i = 0; i < this.Zombies.length; i++) {
            const zombie = this.Zombies[i];
            const dis = Vec3.distance(target.worldPosition, zombie.node.worldPosition);
            if (dis < minDis) {
                minDis = dis;
                minDisZombie = zombie;
            }
        }
        return minDisZombie;
    }
}