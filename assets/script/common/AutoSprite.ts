import { resources } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { SpriteFrame } from 'cc';
import { Language } from './Language';
const { ccclass, property } = _decorator;

@ccclass('AutoSprite')
export class AutoSprite extends Component {

	protected onLoad(): void {
		let sp = this.node.getComponent(Sprite);
		if (!sp) return;
		let uuid = sp.spriteFrame.uuid;
		let info: any = resources.getAssetInfo(uuid);
		let lc = Language.getLanguageCode();
		if (info && info.path) {
			let path: string = info.path;
			path = path.replace('/en/', '/' + lc + '/')
			// //console.log('------', path)
			let spf = resources.get(path, SpriteFrame);
			if (spf) {
				sp.spriteFrame = spf;
			} else {
				resources.load(path, SpriteFrame, (err, res) => {
					if (res) {
						sp.spriteFrame = res;
					}
				});
			}
		}
	}

}
