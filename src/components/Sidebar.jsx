import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  FileText,
  House,
  List,
  MagnifyingGlass,
  TrendUp,
  User,
  X,
} from "@phosphor-icons/react";
import { navigation } from "../data/site";

const navIcons = [House, BookOpen, Briefcase, User, FileText, TrendUp];

function SearchDialog({ items, open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items.slice(0, 5);
    return items
      .filter((item) =>
        [item.title, item.description, item.theme, ...(item.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 8);
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="搜索文章"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="search-dialog__input">
          <MagnifyingGlass size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、主题或标签"
            aria-label="搜索标题、主题或标签"
          />
          <button type="button" onClick={onClose} aria-label="关闭搜索">
            <X size={19} />
          </button>
        </div>
        <p className="search-dialog__hint">
          {query ? `找到 ${results.length} 条结果` : "最近更新"}
        </p>
        <div className="search-results">
          {results.length ? (
            results.map((item) => (
              <a className="search-result" href={item.href} key={item.href}>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.theme} · {item.description}</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            ))
          ) : (
            <p className="search-empty">没有找到相关内容，换个关键词试试。</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function Sidebar({ currentPath, searchItems = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (href) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href);

  return (
    <>
      <header className="mobile-header">
        <a className="mobile-brand" href="/">庞成康</a>
        <div className="mobile-actions">
          <button type="button" onClick={() => setSearchOpen(true)} aria-label="搜索文章">
            <MagnifyingGlass size={21} />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <List size={23} />}
          </button>
        </div>
      </header>

      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__identity">
          <a href="/" className="sidebar__name">庞成康</a>
          <p>学习者 · 构建者</p>
        </div>

        <nav className="sidebar__nav" aria-label="主要导航">
          {navigation.map((item, index) => {
            const Icon = navIcons[index];
            return (
              <a
                href={item.href}
                className={isActive(item.href) ? "is-active" : ""}
                aria-current={isActive(item.href) ? "page" : undefined}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={21} weight={isActive(item.href) ? "fill" : "regular"} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <button
          className="sidebar__search"
          type="button"
          onClick={() => setSearchOpen(true)}
        >
          <MagnifyingGlass size={19} />
          <span>搜索文章</span>
          <kbd>⌘K</kbd>
        </button>
      </aside>

      {menuOpen && (
        <button
          className="menu-backdrop"
          aria-label="关闭菜单"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <SearchDialog
        items={searchItems}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
