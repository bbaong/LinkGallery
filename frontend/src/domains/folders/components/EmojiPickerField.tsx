import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import { Input } from "../../../shared/ui/Input";
import { recommendEmojis, searchEmojis, takeEmojiInput } from "../constants/emojiCatalog";
import { useT } from "../../../shared/i18n/useT";

interface EmojiPickerFieldProps {
  value: string;
  folderName: string;
  onChange: (emoji: string) => void;
}

export function EmojiPickerField({ value, folderName, onChange }: EmojiPickerFieldProps) {
  const [query, setQuery] = useState("");
  const { t } = useT();

  const visibleItems = useMemo(() => {
    const list = query.trim() ? searchEmojis(query) : recommendEmojis(folderName);
    return list.slice(0, 8);
  }, [folderName, query]);

  function handleQueryChange(text: string) {
    const emoji = takeEmojiInput(text);
    if (emoji) {
      onChange(emoji);
      setQuery("");
      return;
    }
    setQuery(text);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">{t("folder.icon")}</p>
        <span className="text-xs text-ink-soft">{t("folder.iconPaste")}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-canvas text-xl"
          aria-label={t("folder.iconSelected")}
          title={t("folder.iconClear")}
        >
          {value || "＋"}
        </button>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder={t("folder.emojiPlaceholder")}
            className="pl-10"
            aria-label={t("folder.emojiSearch")}
          />
        </div>
      </div>

      <div className="flex h-10 items-center gap-1">
        {visibleItems.length === 0 ? (
          <p className="px-1 text-xs text-ink-soft">{t("folder.emojiEmpty")}</p>
        ) : (
          visibleItems.map((item) => (
            <button
              key={item.emoji}
              type="button"
              onClick={() => onChange(value === item.emoji ? "" : item.emoji)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl text-lg hover:bg-canvas",
                value === item.emoji && "bg-brand-100 ring-2 ring-brand-500"
              )}
              aria-label={item.keywords[0] ?? item.emoji}
            >
              {item.emoji}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
