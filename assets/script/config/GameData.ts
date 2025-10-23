/**
 * A个小麦=B个麦垛
 * 1个麦垛=C个金币
 */
export const GameInfo = {
    A: 4,
    B: 1,
    C: 3,
}

/**
 * 僵尸属性
 * first 第一波加载数量
 * second 第二波加载数量
 * HP: 血量
 * Attack: 攻击力
 * speed: 移动速度
 * Meat: 掉落肉数量
 */
export const ZombieInfo = {
    First: 20,   //第一波
    Second: 100, //第二波

    Big: {
        HP: 500,
        Attack: 30,
        Speed: 1,
        Meat: 3,
    }
    ,
    Small: {
        HP: 200,
        Attack: 15,
        Speed: 1.5,
        Meat: 1,
    }
}

/**
 * 猎人属性
 * HP: 血量
 * Attack: 攻击力
 * speed: 移动速度
 * AttackRange: 攻击范围
 * Max: 最大数量
 * Current: 当前数量
 * Meat: 需要肉的数量
 */
export const HunterInfo = {
    HP: 200,
    Attack: 40,
    Speed: 5,
    AttackRange: 3,
    Max: 2,
    Current: 0,
    Meat: 15,
}

/**
 * 玩家属性
 * HP: 血量
 * Attack: 攻击力
 * speed: 移动速度
 * AttackRange: 攻击范围
 * AttackSpeed: 攻击速度
 * CollectRange: 收集范围
 */
export const PlayerInfo = {
    HP: 1000,
    Attack: 100,
    Speed: 10,
    AttackRange: 3,
    AttackSpeed: 1,
    CollectRange: 10,
}

/**
 * 塔属性
 * HP: 血量
 * Attack: 攻击力
 * AttackRange: 攻击范围
 * AttackInterval: 攻击间隔
 */
export const TowerInfo = {
    Level1: {
        HP: 5000,
        Attack: 50,
        AttackRange: 16.5,
        AttackInterval: 1,
    }
    ,
    Level2: {
        HP: 5000,
        Attack: 100,
        AttackRange: 21.5,
        AttackInterval: 0.5,
    }
}

export const WallInfo = {
    Attack: 10,
    AttackRange: 5,
}














export const ColliderGroup = {
    Default: 1 << 0,
    /** 玩家 */
    Player: 1 << 1,
    /** 建筑 */
    Building: 1 << 2,
    /** 僵尸 */
    Zombie: 1 << 3,
    /** 地标 */
    Landmark: 1 << 4,
    /** 资源 */
    Resouce: 1 << 5,
    /** 麦子 */
    Wheat: 1 << 6,
    /** 收割机 */
    ShouGeJi: 1 << 7,
    /** 猎人 */
    Hunter: 1 << 8,
}

/** 
 * 地标类型
 * None: 无
 * SubmitWheat: 提交小麦
 * SubmitMeat: 提交肉
 */
export enum LandmarkType {
    None,
    SubmitWheat,
    SubmitMeat,
}

/**
 * 资源类型
 */
export enum RESOURCE_TYPE {
    NONE = "none",
    MEAT = "meat",
    WHEAT = "wheat",
}

/**
 * 自定义请求体
 */
export class ResquetBody {
    type: RESOURCE_TYPE;
    params: any;

    public constructor(type: RESOURCE_TYPE, params?: any) {
        this.type = type;
        this.params = params;
    }
}