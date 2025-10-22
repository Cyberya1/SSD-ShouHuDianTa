import { _decorator, Component } from 'cc';
import { Tower } from '../tower/Tower';
const { ccclass, property } = _decorator;

@ccclass('Wall')
export class Wall extends Component {

    beHurt(num: number) {
        Tower.ins.beHurt(num);
    }
}


