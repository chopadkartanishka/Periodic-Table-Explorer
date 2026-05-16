import React, { useState, useCallback, useMemo } from "react";
import elementsData from "../Data/elementsData";
import "./AdvancedFilterPanel.css";

// Classification helpers
const METAL_CATEGORIES = [
  "alkali metal",
  "alkaline earth metal",
  "transition metal",
  "post-transition metal",
  "lanthanide",
  "actinide",
];

const NONMETAL_CATEGORIES = [
  "diatomic nonmetal",
  "polyatomic nonmetal",
];

const NOBLE_GAS_CATEGORY = "noble gas";
const METALLOID_CATEGORY = "metalloid";

const classifyElement = (category) => {
  if (!category) return "unknown";
  const cat = category.toLowerCase();
  if (cat === NOBLE_GAS_CATEGORY || cat.includes("noble gas")) return "noble-gas";
  if (NONMETAL_CATEGORIES.some((c) => cat.includes(c))) return "nonmetal";
  if (cat === METALLOID_CATEGORY || cat.includes("metalloid")) return "metalloid";
  if (METAL_CATEGORIES.some((c) => cat.includes(c)) || cat.includes("metal")) return "metal";
  return "unknown";
};

const AdvancedFilterPanel = ({ onFilterChange }) => {
  const [activeType, setActiveType] = useState("all");
  const [activePeriod, setActivePeriod] = useState("all");
  const [activeGroup, setActiveGroup] = useState("all");
  const [activePhases, setActivePhases] = useState([]);
  const [activeElectronAffinity, setActiveElectronAffinity] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const typeFilters = [
    { key: "all", label: "All", icon: "⚛️" },
    { key: "metal", label: "Metals", icon: "🔩" },
    { key: "nonmetal", label: "Non-metals", icon: "💨" },
    { key: "metalloid", label: "Metalloids", icon: "⚡" },
    { key: "noble-gas", label: "Noble Gases", icon: "✨" },
  ];

  const quickCategories = [
    { key: "lanthanide", label: "Lanthanides", icon: "🟡" },
    { key: "actinide", label: "Actinides", icon: "🟣" },
  ];

  const phaseOptions = [
    { key: "solid", label: "Solid", icon: "🪨" },
    { key: "liquid", label: "Liquid", icon: "💧" },
    { key: "gas", label: "Gas", icon: "☁️" },
  ];

  const electronAffinityRanges = [
    { key: "all", label: "All", description: "All ranges" },
    { key: "high-positive", label: "High Positive", description: "> 100 kJ/mol" },
    { key: "positive", label: "Positive", description: "0 - 100 kJ/mol" },
    { key: "low", label: "Low/Negative", description: "< 0 kJ/mol" },
  ];

  const periods = [1, 2, 3, 4, 5, 6, 7];
  const groups = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  // Get unique categories from data
  const uniqueCategories = useMemo(() => {
    const cats = new Set(elementsData.map(e => e.category));
    return Array.from(cats).sort();
  }, []);

  const emitFilterChange = useCallback(
    (type, period, group, phases, electronAffinity, category) => {
      onFilterChange({
        type,
        period,
        group,
        phases,
        electronAffinity,
        category,
        classify: classifyElement,
      });
    },
    [onFilterChange]
  );

  const handleTypeChange = (key) => {
    setActiveType(key);
    emitFilterChange(key, activePeriod, activeGroup, activePhases, activeElectronAffinity, activeCategory);
  };

  const handlePeriodChange = (p) => {
    const val = activePeriod === p ? "all" : p;
    setActivePeriod(val);
    emitFilterChange(activeType, val, activeGroup, activePhases, activeElectronAffinity, activeCategory);
  };

  const handleGroupChange = (g) => {
    const val = activeGroup === g ? "all" : g;
    setActiveGroup(val);
    emitFilterChange(activeType, activePeriod, val, activePhases, activeElectronAffinity, activeCategory);
  };

  const handlePhaseChange = (phase) => {
    let newPhases;
    if (activePhases.includes(phase)) {
      newPhases = activePhases.filter(p => p !== phase);
    } else {
      newPhases = [...activePhases, phase];
    }
    setActivePhases(newPhases);
    emitFilterChange(activeType, activePeriod, activeGroup, newPhases, activeElectronAffinity, activeCategory);
  };

  const handleElectronAffinityChange = (key) => {
    const val = activeElectronAffinity === key ? "all" : key;
    setActiveElectronAffinity(val);
    emitFilterChange(activeType, activePeriod, activeGroup, activePhases, val, activeCategory);
  };

  const handleCategoryChange = (category) => {
    const val = activeCategory === category ? "all" : category;
    setActiveCategory(val);
    emitFilterChange(activeType, activePeriod, activeGroup, activePhases, activeElectronAffinity, val);
  };

  const handleQuickCategory = (category) => {
    setActiveType("all");
    setActivePeriod("all");
    setActiveGroup("all");
    setActivePhases([]);
    setActiveElectronAffinity("all");
    setActiveCategory(category);
    emitFilterChange("all", "all", "all", [], "all", category);
  };

  const hasActiveFilters =
    activeType !== "all" ||
    activePeriod !== "all" ||
    activeGroup !== "all" ||
    activePhases.length > 0 ||
    activeElectronAffinity !== "all" ||
    activeCategory !== "all";

  const filterCount =
    (activeType !== "all" ? 1 : 0) +
    (activePeriod !== "all" ? 1 : 0) +
    (activeGroup !== "all" ? 1 : 0) +
    activePhases.length +
    (activeElectronAffinity !== "all" ? 1 : 0) +
    (activeCategory !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setActiveType("all");
    setActivePeriod("all");
    setActiveGroup("all");
    setActivePhases([]);
    setActiveElectronAffinity("all");
    setActiveCategory("all");
    emitFilterChange("all", "all", "all", [], "all", "all");
  };

  return (
    <div className={`advanced-filter-panel ${isExpanded ? "expanded" : ""}`}>
      <div className="filter-header">
        <button
          className="filter-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          title="Toggle filters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Advanced Filters</span>
          {hasActiveFilters && (
            <span className="filter-badge">{filterCount}</span>
          )}
          <svg
            className={`filter-chevron ${isExpanded ? "rotated" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {hasActiveFilters && (
          <button className="filter-clear-all" onClick={clearAllFilters} title="Clear all filters">
            Clear all
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filter-body">
          {/* Quick Category Filters */}
          <div className="filter-section">
            <label className="filter-label">Quick Filters</label>
            <div className="filter-chips">
              {quickCategories.map((cat) => (
                <button
                  key={cat.key}
                  className={`filter-chip quick-chip ${activeCategory === cat.key ? "active" : ""}`}
                  onClick={() => handleQuickCategory(cat.key)}
                  title={`Filter by ${cat.label}`}
                >
                  <span className="chip-icon">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Filters */}
          <div className="filter-section">
            <label className="filter-label">Classification</label>
            <div className="filter-chips">
              {typeFilters.map((f) => (
                <button
                  key={f.key}
                  className={`filter-chip ${activeType === f.key ? "active" : ""} chip-${f.key}`}
                  onClick={() => handleTypeChange(f.key)}
                  title={`Filter by ${f.label}`}
                >
                  <span className="chip-icon">{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Period Filters */}
          <div className="filter-section">
            <label className="filter-label">Period</label>
            <div className="filter-number-chips">
              {periods.map((p) => (
                <button
                  key={p}
                  className={`filter-num-chip ${activePeriod === p ? "active" : ""}`}
                  onClick={() => handlePeriodChange(p)}
                  title={`Period ${p}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Group Filters */}
          <div className="filter-section">
            <label className="filter-label">Group</label>
            <div className="filter-number-chips">
              {groups.map((g) => (
                <button
                  key={g}
                  className={`filter-num-chip ${activeGroup === g ? "active" : ""}`}
                  onClick={() => handleGroupChange(g)}
                  title={`Group ${g}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Physical Phase Filters */}
          <div className="filter-section">
            <label className="filter-label">Physical Phase</label>
            <div className="filter-chips">
              {phaseOptions.map((phase) => (
                <button
                  key={phase.key}
                  className={`filter-chip phase-chip ${activePhases.includes(phase.key) ? "active" : ""}`}
                  onClick={() => handlePhaseChange(phase.key)}
                  title={`Filter by ${phase.label}`}
                >
                  <span className="chip-icon">{phase.icon}</span>
                  <span>{phase.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={showAdvanced ? "rotated" : ""}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span>{showAdvanced ? "Hide" : "Show"} Advanced Filters</span>
          </button>

          {showAdvanced && (
            <>
              {/* Electron Affinity Filters */}
              <div className="filter-section advanced-section">
                <label className="filter-label">Electron Affinity</label>
                <div className="filter-option-list">
                  {electronAffinityRanges.map((range) => (
                    <button
                      key={range.key}
                      className={`filter-option ${activeElectronAffinity === range.key ? "active" : ""}`}
                      onClick={() => handleElectronAffinityChange(range.key)}
                      title={`Filter by ${range.label}`}
                    >
                      <div className="option-content">
                        <span className="option-label">{range.label}</span>
                        <span className="option-description">{range.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="filter-section advanced-section">
                <label className="filter-label">Element Category</label>
                <div className="category-grid">
                  {uniqueCategories.map((category) => (
                    <button
                      key={category}
                      className={`category-filter ${activeCategory === category ? "active" : ""}`}
                      onClick={() => handleCategoryChange(category)}
                      title={`Filter by ${category}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="active-filters">
              <div className="active-filters-label">Active Filters:</div>
              <div className="active-filter-chips">
                {activeType !== "all" && (
                  <span className="active-chip">
                    {typeFilters.find(f => f.key === activeType)?.label}
                    <button onClick={() => handleTypeChange("all")} className="chip-close">×</button>
                  </span>
                )}
                {activePeriod !== "all" && (
                  <span className="active-chip">
                    Period {activePeriod}
                    <button onClick={() => handlePeriodChange(activePeriod)} className="chip-close">×</button>
                  </span>
                )}
                {activeGroup !== "all" && (
                  <span className="active-chip">
                    Group {activeGroup}
                    <button onClick={() => handleGroupChange(activeGroup)} className="chip-close">×</button>
                  </span>
                )}
                {activePhases.map(phase => (
                  <span key={phase} className="active-chip">
                    {phaseOptions.find(p => p.key === phase)?.label}
                    <button onClick={() => handlePhaseChange(phase)} className="chip-close">×</button>
                  </span>
                ))}
                {activeElectronAffinity !== "all" && (
                  <span className="active-chip">
                    {electronAffinityRanges.find(r => r.key === activeElectronAffinity)?.label} EA
                    <button onClick={() => handleElectronAffinityChange(activeElectronAffinity)} className="chip-close">×</button>
                  </span>
                )}
                {activeCategory !== "all" && (
                  <span className="active-chip">
                    {activeCategory}
                    <button onClick={() => handleCategoryChange(activeCategory)} className="chip-close">×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { classifyElement };
export default AdvancedFilterPanel;
