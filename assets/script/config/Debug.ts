import { EditBox } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { HunterInfo, PlayerInfo, TowerInfo, ZombieInfo } from './GameData';
const { ccclass, property } = _decorator;

@ccclass('Debug')
export class Debug extends Component {

    @property(EditBox) 玩家血量: EditBox = null;
    @property(EditBox) 玩家攻击力: EditBox = null;
    @property(EditBox) 玩家移速: EditBox = null;

    @property(EditBox) 小怪血量: EditBox = null;
    @property(EditBox) 小怪攻击力: EditBox = null;
    @property(EditBox) 小怪移速: EditBox = null;
    @property(EditBox) 小怪肉: EditBox = null;

    @property(EditBox) 大怪血量: EditBox = null;
    @property(EditBox) 大怪攻击力: EditBox = null;
    @property(EditBox) 大怪移速: EditBox = null;
    @property(EditBox) 大怪肉: EditBox = null;

    @property(EditBox) 第一波: EditBox = null;
    @property(EditBox) 第二波: EditBox = null;

    @property(EditBox) 防御塔血量1: EditBox = null;
    @property(EditBox) 防御塔攻击力1: EditBox = null;
    @property(EditBox) 防御塔攻速1: EditBox = null;
    @property(EditBox) 防御塔范围1: EditBox = null;

    @property(EditBox) 防御塔血量2: EditBox = null;
    @property(EditBox) 防御塔攻击力2: EditBox = null;
    @property(EditBox) 防御塔攻速2: EditBox = null;
    @property(EditBox) 防御塔范围2: EditBox = null;

    @property(EditBox) 猎人血量: EditBox = null;
    @property(EditBox) 猎人攻击力: EditBox = null;
    @property(EditBox) 猎人移速: EditBox = null;
    @property(EditBox) 猎人肉: EditBox = null;

    protected onLoad(): void {
        this.玩家血量.string = `${PlayerInfo.HP}`;
        this.玩家攻击力.string = `${PlayerInfo.Attack}`;
        this.玩家移速.string = `${PlayerInfo.Speed}`;

        this.小怪血量.string = `${ZombieInfo.Small.HP}`;
        this.小怪攻击力.string = `${ZombieInfo.Small.Attack}`;
        this.小怪移速.string = `${ZombieInfo.Small.Speed}`;
        this.小怪肉.string = `${ZombieInfo.Small.Meat}`;

        this.大怪血量.string = `${ZombieInfo.Big.HP}`;
        this.大怪攻击力.string = `${ZombieInfo.Big.Attack}`;
        this.大怪移速.string = `${ZombieInfo.Big.Speed}`;
        this.大怪肉.string = `${ZombieInfo.Big.Meat}`;

        this.第一波.string = `${20}`;
        this.第二波.string = `${100}`;

        this.防御塔血量1.string = `${TowerInfo.Level1.HP}`;
        this.防御塔攻击力1.string = `${TowerInfo.Level1.Attack}`;
        this.防御塔攻速1.string = `${TowerInfo.Level1.AttackInterval}`;
        this.防御塔范围1.string = `${TowerInfo.Level1.AttackRange}`;

        this.防御塔血量2.string = `${TowerInfo.Level2.HP}`;
        this.防御塔攻击力2.string = `${TowerInfo.Level2.Attack}`;
        this.防御塔攻速2.string = `${TowerInfo.Level2.AttackInterval}`;
        this.防御塔范围2.string = `${TowerInfo.Level2.AttackRange}`;
    }

    setData() {
        PlayerInfo.HP = parseInt(this.玩家血量.string);
        PlayerInfo.Attack = parseInt(this.玩家攻击力.string);
        PlayerInfo.Speed = parseInt(this.玩家移速.string);

        ZombieInfo.Small.HP = parseInt(this.小怪血量.string);
        ZombieInfo.Small.Attack = parseInt(this.小怪攻击力.string);
        ZombieInfo.Small.Speed = parseInt(this.小怪移速.string);
        ZombieInfo.Small.Meat = parseInt(this.小怪肉.string);

        ZombieInfo.Big.HP = parseInt(this.大怪血量.string);
        ZombieInfo.Big.Attack = parseInt(this.大怪攻击力.string);
        ZombieInfo.Big.Speed = parseInt(this.大怪移速.string);
        ZombieInfo.Big.Meat = parseInt(this.大怪肉.string);

        HunterInfo.HP = parseInt(this.猎人血量.string);
        HunterInfo.Attack = parseInt(this.猎人攻击力.string);
        HunterInfo.Speed = parseInt(this.猎人移速.string);
        HunterInfo.AttackRange = parseInt(this.猎人肉.string);
    }
}


