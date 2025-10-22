import { instantiate } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { EVENT_TYPE, IEvent } from '../tools/CustomEvent';
import { RESOURCE_TYPE, ResquetBody } from '../config/GameData';
const { ccclass, property } = _decorator;

@ccclass('WheatMager')
export class WheatMager extends Component {
    public static instance: WheatMager = null;

    @property(Prefab) wheatT: Prefab = null;

    //玩家收割数量
    private wheatCount: number = 0;

    changeWheatCount(num: number) {
        this.wheatCount += num;
        if (this.wheatCount == 4) {
            IEvent.emit(EVENT_TYPE.DROP_RESOURCE, new ResquetBody(RESOURCE_TYPE.WHEAT));
            this.wheatCount = 0;
        }
    }

    protected onLoad(): void {
        WheatMager.instance = this;
    }
}


