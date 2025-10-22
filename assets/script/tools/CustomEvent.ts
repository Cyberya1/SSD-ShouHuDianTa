import { EventTarget } from "cc";

export const IEvent = new EventTarget();

export enum EVENT_TYPE {
    /**
     * 播放音效
     */
    PLAY_AUDIO = "PLAY_AUDIO",

    /**
     * 游戏开始
     */
    GAME_START = "GAME_START",

    /**
     * 游戏结束
     */
    GAME_OVER = "GAME_OVER",

    /**
     * 僵尸死亡
     */
    ZOMBIE_DIED = "ZOMBIE_DIED",

    // /**
    //  * 掉落肉
    //  */
    // DROP_MEAT = "DROP_MEAT",

    /**
     * 掉落资源
     */
    DROP_RESOURCE = "DROP_RESOURCE",

}


