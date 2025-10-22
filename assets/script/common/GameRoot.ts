import { _decorator, Component, AudioSource, director } from 'cc';
import { AudioManager } from './AudioManager';
import { PlayableSDK } from './PlayableSDK';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {
    private _audioSource: AudioSource = null!;

    onLoad() {
        this._audioSource = this.getComponent(AudioSource)!;
        director.addPersistRootNode(this.node);

        PlayableSDK.adapter();
        PlayableSDK.gameReady();

        // init AudioManager
        AudioManager.init(this._audioSource, this.node);

        let enableAudio = (e) => {
            AudioManager.firstClick = true;
            AudioManager.playSoundLog(e.type);
            AudioManager.resume();

            // document.removeEventListener('mouseup', enableAudio, true);
            // document.removeEventListener('touchend', enableAudio, true);
            document.removeEventListener('mousedown', enableAudio, true);
            document.removeEventListener('touchstart', enableAudio, true);
        }

        // document.addEventListener('mouseup', enableAudio, true);
        // document.addEventListener('touchend', enableAudio, true);
        document.addEventListener('mousedown', enableAudio, true);
        document.addEventListener('touchstart', enableAudio, true);
    }
}