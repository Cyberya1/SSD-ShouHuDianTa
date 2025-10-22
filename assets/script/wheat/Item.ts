import { BoxCollider } from 'cc';
import { ICollisionEvent } from 'cc';
import { Collider } from 'cc';
import { _decorator, Component } from 'cc';
import { WheatMager } from './WheatMager';
import { ColliderGroup } from '../config/GameData';
const { ccclass, property } = _decorator;

@ccclass('Item')
export class Item extends Component {

    private collider: Collider = null;

    protected onLoad(): void {
        this.collider = this.getComponent(BoxCollider);
    }

    protected start(): void {
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    onTriggerEnter(event: ICollisionEvent) {
        if (event.otherCollider.getGroup() === ColliderGroup.Player) {
            WheatMager.instance.changeWheatCount(1);
            this.node.destroy();
        }
        if (event.otherCollider.getGroup() === ColliderGroup.Zombie) {
            this.node.destroy();
        }
    }
}


