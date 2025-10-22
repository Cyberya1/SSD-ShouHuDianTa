import { _decorator, AudioClip, AudioSource, Component, Node, resources } from 'cc';
import { EVENT_TYPE, IEvent } from './tools/CustomEvent';
const { ccclass, property } = _decorator;

export enum AudioInfo {
    BGM = "BGM",
}

@ccclass('AudioMager')
export class AudioMager extends Component {

    @property(AudioSource) audioSource: AudioSource = null;

    protected onLoad(): void {
        IEvent.on(EVENT_TYPE.PLAY_AUDIO, this.playAudio, this);
    }

    playAudio(audio: AudioInfo) {
        resources.load(`audio${audio}`, AudioClip, (err, clip) => {
            if (err) {
                console.log(err);
                return;
            }
            this.audioSource.playOneShot(clip);
        });
    }

}