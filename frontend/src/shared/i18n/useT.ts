import { useLocaleStore } from "./localeStore";
import { messages, type MessageKey } from "./messages";

export function translate(key: MessageKey, vars?: Record<string, string | number>) {
  const locale = useLocaleStore.getState().locale;
  let text: string = messages[locale][key] ?? messages.ko[key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function tErr(key: MessageKey) {
  return { error: () => translate(key) };
}

export function useT() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  function t(key: MessageKey, vars?: Record<string, string | number>) {
    void locale;
    return translate(key, vars);
  }

  return { t, locale, setLocale };
}
