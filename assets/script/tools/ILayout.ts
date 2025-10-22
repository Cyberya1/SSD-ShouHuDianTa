import { Vec3, CCFloat } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ILayout')
export class ILayout extends Component {
    @property({ visible: true, tooltip: '初始位置' })
    position: Vec3 = new Vec3(0, 0, 0);

    @property({ type: CCFloat, tooltip: 'x轴间隔' })
    spacingX: number;

    @property({ type: CCFloat, tooltip: 'y轴间隔' })
    spacingY: number;

    @property({ type: CCFloat, tooltip: 'z轴间隔' })
    spacingZ: number;

    @property({ visible: true, tooltip: '是否排列X轴' })
    x = true;

    @property
    edit_update = false;

    protected onLoad(): void {
        for (let i = 0; i < this.node.children.length; i++) {
            if (this.x) {
                let newPos = new Vec3(this.position.x - this.spacingX * i, this.position.y + this.spacingY * i, this.position.z - this.spacingZ * i)
                this.node.children[i].setPosition(newPos)
            }
            else {
                let newPos = new Vec3(this.node.children[i].position.x - this.spacingX * i, this.position.y + this.spacingY * i, this.position.z - this.spacingZ * i)
                this.node.children[i].setPosition(newPos)
            }
        }
    }

    protected update(dt: number): void {
        if (this.edit_update) {
            for (let i = 0; i < this.node.children.length; i++) {
                if (this.x) {
                    let newPos = new Vec3(this.position.x - this.spacingX * i, this.position.y + this.spacingY * i, this.position.z - this.spacingZ * i)
                    this.node.children[i].setPosition(newPos)
                }
                else {
                    let newPos = new Vec3(this.node.children[i].position.x - this.spacingX * i, this.position.y + this.spacingY * i, this.position.z - this.spacingZ * i)
                    this.node.children[i].setPosition(newPos)
                }
            }
        }
    }
}


