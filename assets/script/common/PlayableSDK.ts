import { game, Vec3 } from "cc";

declare var window;

export enum PlatForm {
	Aarki = 'Aarki',
	Applovin = 'Applovin',
	Facebook = 'Facebook',
	Google = 'Google',
	Ironsource = 'Ironsource',
	Liftoff = 'Liftoff',
	Mintegral = 'Mintegral',
	Moloco = 'Moloco',
	Tiktok = 'Tiktok',
	Unity = 'Unity',
	Vungle = 'Vungle',

	Wechat = 'Wechat',

	Preview = 'Preview',
}

export class PlayableSDK {

	private static isFirstClick = false;

	private static lastReportTime = 0;
	private static coordinate_old: Vec3 = new Vec3();

	/**
	 * 渠道/平台
	 */
	static get platform(): PlatForm {
		if ('__PLATFORM' in window) {
			if (window.__PLATFORM) return PlatForm[window.__PLATFORM];
		}

		if (window.wx) {
			return PlatForm.Wechat;
		}

		return PlatForm.Preview;
	}

	/**
	 * 隐藏加载进度
	 */
	static hideLoadingBar() {
		if (window.setLoadingProgress) {
			window.setLoadingProgress(100);
		}
	}

	/**
	 * 由sdk传入的配置参数
	 * @param key 
	 * @returns 
	 */
	static getGameConfs(key) {
		if ('GameConfs' in window) {
			return window.GameConfs[key];
		} else {
			return null;
		}
	}

	/**
	 * @param from 跳转商店的原因，next点击next、again点击again、download点击download按钮、automatic_jump自动跳转等
	 */
	static download(from = 'download') {
		if (window.xsd_playable) {
			window.xsd_playable.download();
		}
		else if (PlayableSDK.platform === PlatForm.Wechat) {
			window.wx.notifyMiniProgramPlayableStatus({
				isEnd: true
			});
		}

		// //console.log('Report:', window.AnalyticsIns)
		if (window.AnalyticsIns) {
			window.AnalyticsIns.reportActionbar(from)
		}
	}

	/**结束自动调用下载 */
	public static autoDownload() {
		if (!PlayableSDK.getGameConfs("autoDownload"))
			return;

		setTimeout(() => PlayableSDK.download(), 1000)
	}

	///// 上报数据
	/**
	 * @param totalGames 游戏次数
	 */
	static reportGameStart(stage = '') {
		if (window.AnalyticsIns) {
			window.AnalyticsIns.reportGameStart(stage)
		}
	}
	/**
	 * @param totalGames 游戏次数
	 * @param result 本次游戏结果，通关win、通关失败lose
	 */
	static reportGameEnd(result, stage = '') {
		if (window.AnalyticsIns) {
			window.AnalyticsIns.reportGameEnd(result, stage)
		}
	}
	/**
	 * 游戏存在交互行为时上报，包括点击屏幕、按住屏幕拖动人物等，任何在游戏期间有屏幕接触的行为。每秒上报1次
	 */
	static reportGameInteraction(coordinate_new: Vec3) {
		if (window.AnalyticsIns) {
			if (game.totalTime - this.lastReportTime >= 1000) {
				this.lastReportTime = game.totalTime;
				window.AnalyticsIns.reportGameInteraction(this.coordinate_old, coordinate_new);
				this.coordinate_old = coordinate_new;
			}
		}
	}

	static reportGameTouch(type: string, coordinate_new: Vec3) {
		if (window.AnalyticsIns) {
			window.AnalyticsIns.reportGameTouch(type, this.coordinate_old, coordinate_new);
			this.coordinate_old = coordinate_new;
		}
	}
	static getPlatform() {
		if (window.__PLATFORM == 'Google') {
			return true;
		}
		return false
	}
	/////////////////////////


	static adapter() {
		window.xsd_playable && window.xsd_playable.adapter()
	}


	static gameReady() {
		window.xsd_playable && window.xsd_playable.gameReady()
	}
	static gameEnd() {
		window.xsd_playable && window.xsd_playable.gameEnd()
	}
	static onInteracted() {
		if (!this.isFirstClick) {
			window.xsd_playable && window.xsd_playable.onInteracted();
			this.isFirstClick = true;
		}
	}
	static HttpAPI() { }
	static unicodeEncode(t) {
		for (var e = "", o = 0; o < t.length; o++) {
			var n = t.charCodeAt(o);
			e += "\\u" + this.padLeft(n.toString(16), "0", 4)
		}
		return e
	}
	static unicodeDecode(t) {
		return t.replace(/\\u([\d\w]{4})/gi, function (t, e) {
			return String.fromCharCode(parseInt(e, 16))
		})
	}
	static padLeft(t, e, o) {
		for (; t.length < o;) t = e + t;
		return t
	}

	static androidUrl = ""
	static iosUrl = ""
}


