import { assetManager, AudioClip, AudioSource, game, Game, Node, sys, view } from "cc";

declare var window;

class AudioItem {
    audioSource: AudioSource;
    playing: boolean;
    loop: boolean;
    duration: number;
    startTime: number;
}

export class AudioManager {
    private static _audioSource?: AudioSource;
    private static _cachedAudioClipMap: Record<string, AudioClip> = {};

    private static audioSourceMap: Record<string, AudioItem> = {};
    private static rootNode: Node;

    private static basePath = 'audio/';

    public static musicEnable: boolean = true;
    public static soundEnable: boolean = true;
    public static volume: number = 1;

    public static firstClick = false;

    private static audioNames: string[] = [];

    private static isplayed = false;

    // init AudioManager in GameRoot component.
    public static init(audioSource: AudioSource, node?) {
        AudioManager._audioSource = audioSource;
        AudioManager.rootNode = node;
        for (let name in AudioManager.audioSourceMap) {
            const item = AudioManager.audioSourceMap[name];
            item && item.playing && item.audioSource.stop();
        }
        AudioManager.audioSourceMap = {};
        AudioManager.audioNames = [];

        if ('volumeSwitch' in window && window.volumeSwitch !== void 0) {
            //console.log('Init AudioManager volumeSwitch', window.volumeSwitch);
            AudioManager.musicEnable = !!window.volumeSwitch;
            AudioManager.soundEnable = !!window.volumeSwitch;
        }
        if (window.__PLATFORM == 'Ironsource') {
            //Ironsource 平台音量
            var vs = window.volumeAudio;
            if (vs <= 0) {
                AudioManager.volume = 0;
                AudioManager.musicEnable = false;
                AudioManager.soundEnable = false;
            } else if (typeof vs == 'number') {
                AudioManager.volume = vs;
            }
        }
        //console.log('Init AudioManager:', AudioManager.musicEnable, AudioManager.volume);

        game.on(Game.EVENT_HIDE, function () {
            AudioManager.pause();
        });
        game.on(Game.EVENT_SHOW, function () {
            AudioManager.resume();
        });

        view.on("audioVolumeChange", AudioManager.audioVolumeChange, this);

        if (window.AnalyticsIns) {
            window.AnalyticsIns.voiceOn();
        }
    }

    public static audioVolumeChange(e) {

        let last = AudioManager.musicEnable;
        AudioManager.musicEnable = e;
        AudioManager.soundEnable = e;
        if (last && !e) {
            AudioManager.pause();
        } else if (!last && e) {
            AudioManager.resume();
        }
        // this.isPlatformPlay = e, t.mute = !e
    }

    public static resume() {
        if (!AudioManager.musicEnable) {
            return;
        }
        const audioSource = AudioManager._audioSource!;
        audioSource.play();

        for (let name in AudioManager.audioSourceMap) {
            const item = AudioManager.audioSourceMap[name];
            item && item.playing && (item.loop || game.totalTime - item.startTime < item.duration - 500) && item.audioSource.play();
        }
    }

    public static pause() {
        const audioSource = AudioManager._audioSource!;
        audioSource.pause();

        for (let name in AudioManager.audioSourceMap) {
            const item = AudioManager.audioSourceMap[name];
            item && item.audioSource.pause();
        }
    }

    /**
     * 播放音效
     * @param name 
     */
    public static soundPlay(name: string, volumeScale = 1) {
        if (!AudioManager.soundEnable || !AudioManager.firstClick) {
            return;
        }

        const audioSource = AudioManager._audioSource!;

        let path = AudioManager.basePath + name;
        let cachedAudioClip = AudioManager._cachedAudioClipMap[path];
        if (cachedAudioClip) {
            audioSource.playOneShot(cachedAudioClip, volumeScale * 1.6);
        } else {
            assetManager.resources?.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(err);
                    return;
                }

                AudioManager._cachedAudioClipMap[path] = clip;
                audioSource.playOneShot(clip, volumeScale * 1.6);
            });
        }
    }

    /**
     * 播放背景音乐
     * @param {Boolean} loop 是否循环播放
     */
    public static musicPlay(name: string, loop: boolean) {
        const audioSource = AudioManager._audioSource!;
        if (audioSource.playing) {
            // audioSource.stop();
            return;
        }
        audioSource.loop = loop;

        let path = AudioManager.basePath + name;
        let cachedAudioClip = AudioManager._cachedAudioClipMap[path];
        if (cachedAudioClip) {
            audioSource.clip = cachedAudioClip;
            if (AudioManager.musicEnable) {
                audioSource.play();
                if (AudioManager.firstClick) {
                    this.playSoundLog('auto');
                }
            }
            if (!AudioManager.firstClick) {
                audioSource.pause();
            }
        } else {
            assetManager.resources?.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(err);
                    return;
                }

                AudioManager._cachedAudioClipMap[path] = clip;
                audioSource.clip = clip;
                audioSource.volume = 0.6;

                if (AudioManager.musicEnable) {
                    audioSource.play();
                    if (AudioManager.firstClick) {
                        this.playSoundLog('auto');
                    }
                }
                if (!AudioManager.firstClick) {
                    audioSource.pause();
                }
            });
        }
    }

    public static musicStop() {
        const audioSource = AudioManager._audioSource!;
        audioSource.stop();
    }


    public static audioPlay(name, loop = false, volumeScale?: number) {
        if (!AudioManager.rootNode) {
            return;
        }
        AudioManager.audioNames.push(name);
        let item: AudioItem = AudioManager.audioSourceMap[name];
        if (!item) {
            const as = AudioManager.rootNode.addComponent(AudioSource);
            item = AudioManager.audioSourceMap[name] = { audioSource: as, playing: true, startTime: game.totalTime, loop: loop, duration: 0 };

            let path = AudioManager.basePath + name;
            assetManager.resources?.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(err);
                    return;
                }

                AudioManager._cachedAudioClipMap[path] = clip;
                as.clip = clip;
                if (loop) {
                    as.loop = true;
                }
                as.volume = volumeScale && !isNaN(volumeScale) ? AudioManager.volume * volumeScale : AudioManager.volume;
                item.duration = as.duration * 1000;
                if (AudioManager.soundEnable) {
                    as.play();
                    item.startTime = game.totalTime;
                }
                if (!AudioManager.firstClick) {
                    as.pause();
                }
            });
        } else {
            const as = item.audioSource;
            if (loop) {
                as.loop = true;
            }
            item.loop = loop;

            as.volume = volumeScale && !isNaN(volumeScale) ? AudioManager.volume * volumeScale : AudioManager.volume;
            item.duration = as.duration * 1000;
            if (!as.playing && AudioManager.firstClick && AudioManager.soundEnable) {
                as.play();
                item.startTime = game.totalTime;
            }
        }
    }

    public static removeAudioPlay() {
        for (let i = 0; i < AudioManager.audioNames.length; i++) {
            let item: AudioItem = AudioManager.audioSourceMap[AudioManager.audioNames[i]];
            if (item) {
                item.playing = false;
                item.audioSource.stop();
            }
            AudioManager.audioSourceMap[AudioManager.audioNames[i]] = null;
        }
        let audios = AudioManager.rootNode.getComponents(AudioSource);
        for (let i = 1; i < audios.length; i++) {//i初始化为1，跳过背景音乐
            audios[i].destroy();
        }
    }

    public static audioStop(name) {
        let item: AudioItem = AudioManager.audioSourceMap[name];
        if (item) {
            item.playing = false;
            item.audioSource.stop();
        }
    }

    public static audioPause(name) {
        let item: AudioItem = AudioManager.audioSourceMap[name];
        if (item) {
            item.playing = false;
            item.audioSource.pause();
        }
    }

    public static audioVolume(name, volumeScale: number = 1) {
        let item: AudioItem = AudioManager.audioSourceMap[name];
        if (item) {
            item.audioSource.volume = AudioManager.volume * volumeScale;
        }
    }


    // 设置音乐音量
    public static musicVolumeSet(v: number) {
        const audioSource = AudioManager._audioSource!;
        audioSource.volume = v;
        AudioManager.volume = v;
        sys.localStorage.setItem("volume", String(v));
    }

    public static musicEnableSet(enable: boolean) {
        const audioSource = AudioManager._audioSource!;
        AudioManager.musicEnable = enable;
        sys.localStorage.setItem("musicEnable", enable ? "1" : "0");
        if (enable) {
            if (!audioSource.playing) {
                audioSource.play();
            }
        } else {
            if (audioSource.playing) {
                audioSource.stop();
            }
        }
    }

    public static soundEnableSet(enable: boolean) {
        const audioSource = AudioManager._audioSource!;
        AudioManager.soundEnable = enable;
        sys.localStorage.setItem("soundEnable", enable ? "1" : "0");
    }


    public static playSoundLog(type) {
        // //console.log('==+++', type)
        if (!this.isplayed) {
            this.isplayed = true;
            if (window.AnalyticsIns) {
                try {
                    window.AnalyticsIns.voiceTouch(type);
                } catch (error) {
                }
            }
        }
    }
}