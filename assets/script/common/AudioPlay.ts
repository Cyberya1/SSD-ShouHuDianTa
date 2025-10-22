import { _decorator } from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('AudioPlay')
export class AudioPlay {
    private static _instance: AudioPlay;

    private constructor() { }

    public static get instance(): AudioPlay {
        if (!AudioPlay._instance) {
            AudioPlay._instance = new AudioPlay();
        }
        return AudioPlay._instance;
    }

    private enemyDieCount: number = 0;
    /**敌人死亡音效 */
    public enemyDie() {
        if (this.enemyDieCount >= 3)
            return;

        this.enemyDieCount++;
        this.enemyDieCount == 3 && setTimeout(() => this.enemyDieCount = 0, 500);

        AudioManager.soundPlay("sangshisiwangshenyin");
    }

    private coinCount: number = 0;
    /**金币音效 */
    public coin() {
        if (this.coinCount >= 3)
            return;

        this.coinCount++;
        this.coinCount == 3 && setTimeout(() => this.coinCount = 0, 500);

        AudioManager.soundPlay("baochujinbi", 0.3);
    }
    /**造箭塔 */
    public arrowTowr() {
        AudioManager.soundPlay("jianzaofangyuta");
    }
    /**建造建筑 */
    public building() {
        AudioManager.soundPlay("levelUp");
    }
    /**场景扩建 */
    public upgrade() {
        AudioManager.soundPlay("levelUp");
    }
    /**主角开枪 */
    public attack() {
        AudioManager.soundPlay("attack",0.3)
    }
    /**背包改变 */
    public bagChange() {
        AudioManager.soundPlay("啵儿");
    }
    /**英雄登场 */
    public heroShow() {
        AudioManager.soundPlay('yingxiongdengchang');
    }
    /**胜利 */
    public victory() {
        AudioManager.musicStop();
        AudioManager.soundPlay("qingzhushengli");
    }
    /**点击 */
    public click() {
        AudioManager.soundPlay('Click');
    }
    /**招募英雄 卡牌 */
    public recruit() {
        AudioManager.soundPlay('卡牌弹出');
    }
}