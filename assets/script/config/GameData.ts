
export const ZombieInfo = {
    Furst: 20,   //第一波
    Second: 100, //第二波
    Big: {
        HP: 300,
        Attack: 20,
        Speed: 1.5,
        Meat: 3,
        AttackRange: 5,
        AttackInterval: 5,
    }
    , Small: {
        HP: 100,
        Attack: 10,
        Speed: 1.5,
        Meat: 1,
        AttackRange: 3,
        AttackInterval: 3,
    }

}

export const HunterInfo = {
    HP: 100,
    Attack: 50,
    Speed: 5,
    AttackRange: 3,
    AttackInterval: 1,
    Max: 2,
    Current: 0,
}

export const PlayerInfo = {
    HP: 1000,
    Attack: 100,
    Speed: 10,
    AttackRange: 3,
    AttackSpeed: 1,
    CollectRange: 10,
}

// export const WallInfo = {
//     HP: 3000,
// }

export const TowerInfo = {
    Level1: {
        HP: 5000,
        Attack: 50,
        AttackRange: 14,
        AttackInterval: 1,
    }
    ,
    Level2: {
        HP: 5000,
        Attack: 100,
        AttackRange: 18,
        AttackInterval: 0.5,
    }
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

export const ResouceInfo = {
    // [RESOURCE_TYPE.MEAT]: {
    //     HP: 100,
    //     Attack: 10,
    //     Speed: 2,
    //     Meat: 3,
    // },
    // [RESOURCE_TYPE.WHEAT]: {
    //     HP: 100,
    //     Attack: 10,
    //     Speed: 2,
    //     Meat: 3,
    // }
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