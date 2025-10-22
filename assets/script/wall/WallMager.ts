import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WallMager')
export class WallMager extends Component {
    public static ins: WallMager = null;

    protected onLoad(): void {
        WallMager.ins = this;
    }
}


