import { resources, sys } from "cc";

export class Language {
  private static languageCode = null;

  public static init(rootDir = null, endCall?) {
    if (!this.languageCode) {
      this.getLanguageCode();
    }

    if (!rootDir) {
      rootDir = "texture";
    }
    resources.loadDir(rootDir + "/" + this.languageCode, () => {
      endCall && endCall();
    });
  }

  public static getLanguageCode() {
    if (this.languageCode) return this.languageCode;
    let codeNum = "";
    switch (sys.languageCode) {
      //中文
      case "zh":
      case "zh-cn":
      case "zh_CN":
        codeNum = "zh-s";
        break;
      case "zh-tw":
      case "zh_TW":
        codeNum = "zh-t";
        break;
      //法语
      case "fr":
        codeNum = "fr";
        break;
      //英语
      case "en":
      //意呆利语
      case "it":
      //德语
      case "de":
        codeNum = 'de';
        break;
      //西班牙语
      case "es":
      //风车语
      case "du":
      //匈牙利语
      case "hu":
      //葡萄牙语
      case "pt":
      //挪威语
      case "no":
      //波兰语
      case "pl":
      //大肉串语
      case "tr":
      //乌克兰语
      case "uk":
      //罗马尼亚语
      case "ro":
      //保加利亚语
      case "bg":
      //阿三语
      case "hi":
      //未知
      case "unknown":
        codeNum = "en";
        break;
      //俄语
      case "ru":
        codeNum = "ru";
        break;
      //日语
      case "ja":
        codeNum = "ja";
        break;
      //大户语
      case "ar":
        codeNum = "en";
        break;
      //韩语
      case "ko":
        codeNum = "ko";
        break;
    }
    this.languageCode = codeNum;
    return this.languageCode;
  }
}
