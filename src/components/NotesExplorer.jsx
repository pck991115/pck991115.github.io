import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";

const allThemes = ["全部", "知识管理", "理财学习", "职业成长"];

export default function NotesExplorer({ notes }) {
  const [theme, setTheme] = useState("全部");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("theme");
    if (allThemes.includes(value)) setTheme(value);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return notes.filter((note) => {
      const themeMatches = theme === "全部" || note.theme === theme;
      const queryMatches =
        !normalized ||
        [note.title, note.description, note.theme, ...note.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return themeMatches && queryMatches;
    });
  }, [notes, query, theme]);

  return (
    <section className="notes-explorer">
      <div className="notes-toolbar">
        <div className="notes-filters" aria-label="按主题筛选">
          {allThemes.map((item) => (
            <button
              type="button"
              className={theme === item ? "is-active" : ""}
              onClick={() => setTheme(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="notes-query">
          <MagnifyingGlass size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="筛选当前列表"
          />
        </label>
      </div>

      <div className="notes-list">
        {filtered.map((note) => (
          <a href={note.href} className="note-row" key={note.href}>
            <time dateTime={note.isoDate}>{note.date}</time>
            <span className="note-row__content">
              <small>{note.theme}</small>
              <strong>{note.title}</strong>
              <span>{note.description}</span>
            </span>
            <span className="note-row__meta">
              {note.readingTime}
              <ArrowRight size={17} />
            </span>
          </a>
        ))}
        {!filtered.length && (
          <p className="empty-state">这里暂时没有匹配的笔记。</p>
        )}
      </div>
    </section>
  );
}
