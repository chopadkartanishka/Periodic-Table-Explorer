import React, { useState, useRef, useEffect } from "react";
import "./SearchBar.css";

const SearchBar = ({ elements, onSearch, onSelectElement }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      onSearch("");
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = elements.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        el.number.toString() === q
    );

    setSuggestions(filtered.slice(0, 8));
    setShowSuggestions(filtered.length > 0);
    setActiveIndex(-1);
    onSearch(query);
  }, [query, elements, onSearch]);

  // Global keyboard shortcut: "/" to focus, "Escape" to blur
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable = tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable;

      if (e.key === "/" && !isEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        setShowSuggestions(false);
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleSelect = (element) => {
    setQuery(element.name);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSelectElement(element);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch("");
    inputRef.current?.focus();
  };

  const getCategoryClass = (category) => {
    if (!category) return "";
    if (category.includes("noble gas")) return "cat-noble";
    if (category.includes("nonmetal")) return "cat-nonmetal";
    if (category.includes("metalloid")) return "cat-metalloid";
    return "cat-metal";
  };

  return (
    <div className="search-bar-container" id="search-bar">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          id="element-search-input"
          type="text"
          placeholder="Search by name, symbol, or atomic number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && suggestions.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
        />
        {query && (
          <button
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
            id="search-clear-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {showSuggestions && (
        <ul className="search-suggestions" ref={suggestionsRef} id="search-suggestions">
          {suggestions.map((el, index) => (
            <li
              key={el.number}
              className={`suggestion-item ${index === activeIndex ? "active" : ""} ${getCategoryClass(el.category)}`}
              onClick={() => handleSelect(el)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="suggestion-number">#{el.number}</span>
              <span className="suggestion-symbol">{el.symbol}</span>
              <span className="suggestion-name">{el.name}</span>
              <span className="suggestion-category">{el.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
