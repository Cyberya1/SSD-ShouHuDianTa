import { _decorator, Camera, Component, director, Director, find, Node, Scene } from 'cc';
import { EVENT_TYPE, IEvent } from './tools/CustomEvent';
import { ColliderGroup, HunterInfo, PlayerInfo, ZombieInfo } from './config/GameData';
import { Vec3 } from 'cc';
import { v3 } from 'cc';
import { Quat } from 'cc';
import { tween } from 'cc';
import { Label } from 'cc';
import { CameraCtrl } from './player/CameraCtrl';
import { Player } from './player/Player';
import { UIOpacity } from 'cc';
import { Tween } from 'cc';
import { NavLine } from './common/NavLine';
const { ccclass, property } = _decorator;

@ccclass('GameMager')
export class GameMager extends Component {
    public static ins: GameMager = null;

    @property(Node) gameOver: Node = null;
    @property(Camera) camera: Camera = null;

    @property(Node) zb: Node = null;
    @property(Label) startTip: Label = null;
    @property(Node) handTip: Node = null;

    @property(NavLine) line: NavLine = null;
    @property(Node) test: Node = null;


    private camera_pos: Vec3 = v3(-0.34456, 39.083, 28.920985);
    private _camera_pos: Vec3 = v3(-31.958, 39.083, 23.919);

    protected onLoad(): void {
        GameMager.ins = this;

        IEvent.on(EVENT_TYPE.GAME_OVER, this._GameOver, this);
    }

    protected start(): void {
        // @ts-ignore
        if (window.setLoadingProgress) {
            // @ts-ignore
            window.setLoadingProgress(100);
        }

        this.camera.node.setWorldPosition(this.camera_pos);
        this.scheduleOnce(() => {
            tween(this.camera.node)
                .to(0.5, {
                    position: this._camera_pos,
                })
                .call(() => {
                    this.camera.node.setWorldPosition(this._camera_pos);
                    CameraCtrl.ins.setFollowTarget(Player.ins.node);
                    this.startTip.node.active = true;
                    this.scheduleOnce(() => {
                        this.startTip.node.active = false;
                        this.zb.destroy();
                        IEvent.emit(EVENT_TYPE.GAME_START);
                    }, 3);
                })
                .start();
        }, 2)
    }

    handTipTimer: number = 0;
    protected update(dt: number): void {
        if (this.handTip.active == false) {
            this.handTipTimer += dt;
            if (this.handTipTimer >= 5) {
                this.handTip.active = true;
            }
        }
    }

    protected lateUpdate(dt: number): void {
        this.line.node.setWorldPosition(Player.ins.node.worldPosition);
        this.line.init(this.test.getWorldPosition().clone());
    }

    GameEnd: boolean = false;

    _GameOver() {
        this.gameOver.active = true;
        this.GameEnd = true;

        ZombieInfo.Big.Speed = 0;
        ZombieInfo.Small.Speed = 0;
        HunterInfo.Speed = 0;
        PlayerInfo.Speed = 0;
    }

    protected onDestroy(): void {
        IEvent.off(EVENT_TYPE.GAME_OVER, this._GameOver, this);
    }

}


