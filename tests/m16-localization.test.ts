import { describe, expect, it } from "vitest";
import { detectLocale, localeCatalogs, supportedLocales, translate } from "../apps/web/src/i18n/catalog.js";
import { buildInviteUrl } from "../apps/web/src/lobby.js";

describe("M16 language packs", () => {
  it("ships complete catalogs for all required locales", () => {
    expect(supportedLocales).toEqual(["en", "ru", "es", "ja", "zh-CN", "ko"]);
    const keys = Object.keys(localeCatalogs.en).sort();
    for (const locale of supportedLocales) expect(Object.keys(localeCatalogs[locale]).sort()).toEqual(keys);
  });

  it("does not silently fall back to English in translated application chrome", () => {
    const intentional = new Set(["ru:home.pack", "es:join.compatible", "es:table.phase.social"]);
    for (const locale of supportedLocales.slice(1)) {
      const untranslated = Object.entries(localeCatalogs[locale])
        .filter(([key, value]) => value === localeCatalogs.en[key as keyof typeof localeCatalogs.en] && !intentional.has(`${locale}:${key}`));
      expect(untranslated).toEqual([]);
    }
  });

  it("detects regional languages and falls back to English", () => {
    expect(detectLocale(["ru-RU"])).toBe("ru");
    expect(detectLocale(["es-MX"])).toBe("es");
    expect(detectLocale(["ja-JP"])).toBe("ja");
    expect(detectLocale(["zh-TW"])).toBe("zh-CN");
    expect(detectLocale(["ko-KR"])).toBe("ko");
    expect(detectLocale(["de-DE"])).toBe("en");
  });

  it("interpolates translated text", () => {
    expect(translate("ru", "home.saved", { count: 3 })).toBe("Сохранённые игры: 3");
    expect(translate("ja", "lobby.players", { count: 2 })).toBe("プレイヤー: 2");
  });

  it("builds a self-contained invite link", () => {
    expect(buildInviteUrl("https://play.example", "/masterhost", "friends", "042911"))
      .toBe("https://play.example/masterhost?realm=friends&pin=042911#join");
  });
});
