import { _decorator, Component, Node } from 'cc';
import { Language } from './Language';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AutoLabel')
export class AutoLabel extends Component {
    @property({ displayName: "中文(简体)" })
    zh_CN: string = '';
    @property({ displayName: "中文(繁体)" })
    zh_TW: string = '';
    @property({ displayName: "英文" })
    en: string = '';
    @property({ displayName: "日文" })
    ja: string = '';
    @property({ displayName: "韩文" })
    ko: string = '';
    @property({ displayName: "法文" })
    fr: string = '';
    @property({ displayName: "德文" })
    de: string = '';
    @property({ displayName: "俄文" })
    ru: string = '';

    protected onLoad(): void {

        let labelString = '';
        let lc = Language.getLanguageCode();
        switch (lc) {
            case 'zh-s':
                labelString = this.zh_CN;
                break;
            case 'zh_t':
                labelString = this.zh_TW;
                break;
            case 'en':
                labelString = this.en;
                break;
            case 'ja':
                labelString = this.ja;
                break;
            case 'ko':
                labelString = this.ko;
                break;
            case 'fr':
                labelString = this.fr;
                break;
            case 'de':
                labelString = this.de;
                break;
            case 'ru':
                labelString = this.ru;
                break;
            case 'default':
                labelString = this.en;
                break;
        }
        this.getComponent(Label).string = labelString;
    }
    start() {

    }

    update(deltaTime: number) {

    }
}


