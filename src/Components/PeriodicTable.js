import React, { useState } from "react";
import elementsData from "../Data/elementsData";
import "./PeriodicTable.css";
import getBlockColor from "./blockColor";

import {
  getMainElements,
  getLanthanides,
  getActinides,
} from "./filterBlocks";

const PeriodicTable = () => {
  const [selectedElement, setSelectedElement] = useState(null);

  const mainElements = getMainElements(elementsData);
  const lanthanides = getLanthanides(elementsData);
  const actinides = getActinides(elementsData);

  return (
    <div className="periodic-table-wrapper">
      <h1>Periodic Table Explorer</h1>

import { getMainElements, getLanthanides, getActinides } from "./filterBlocks";
import SmallBox from "./SmallBox";
import SearchBar from "./SearchBar";
import AdvancedFilterPanel, { classifyElement } from "./AdvancedFilterPanel";
import { useElement } from "../contexts/ElementContext";

const PeriodicTable = () => {
  const { selectedElement, setSelectedElement } = useElement();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    period: "all",
    group: "all",
    phases: [],
    electronAffinity: "all",
    category: "all",
    classify: classifyElement,
  });

  const [hoveredBlock, setHoveredBlock] = useState(null);

    // Tooltip state
  const [hoveredElement, setHoveredElement] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, placement: "top" });
  const hoverTimeoutRef = useRef(null);
  const elementRefs = useRef({});
  const tableRef = useRef(null);

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSelectElement = useCallback((element) => {
    setSelectedElement(element);
    // Scroll the element into view with a highlight pulse
    const ref = elementRefs.current[element.number];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      ref.classList.add("element-pulse");
      setTimeout(() => ref.classList.remove("element-pulse"), 1200);
    }
  }, [setSelectedElement]);
    // Tooltip handlers
   const showTooltip = useCallback((element, event) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    const rect = event.currentTarget.getBoundingClientRect();
    const tableRect = tableRef.current?.getBoundingClientRect();

    if (!tableRect) return;

    const tooltipWidth = 240;
    const tooltipHeight = 120;
    const gap = 12;

    let x = rect.left + rect.width / 2 - tableRect.left;
    let y = rect.top - tableRect.top - gap;
    let placement = "top";

    if (rect.top - tableRect.top < tooltipHeight + 10) {
      y = rect.bottom - tableRect.top + gap;
      placement = "bottom";
    }

    x = Math.max(
      tooltipWidth / 2 + 8,
      Math.min(x, tableRect.width - tooltipWidth / 2 - 8)
    );

    setHoveredElement(element);
    setTooltipPosition({ x, y, placement });
    setTooltipVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setTooltipVisible(false);
    setHoveredElement(null);
  }, []);

   const getElementGalleryUrl = useCallback((element) => {
    const query = encodeURIComponent(`${element.name} element`);
    return `https://commons.wikimedia.org/w/index.php?search=${query}&title=Special:MediaSearch&type=image`;
  }, []);

  // Determine if an element matches current search + filters
  const isElementVisible = useCallback(
    (element) => {
      // Hovered Block Filter
      if (hoveredBlock && element.block !== hoveredBlock) return false;

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          element.name.toLowerCase().includes(q) ||
          element.symbol.toLowerCase().includes(q) ||
          element.number.toString() === q;
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type !== "all") {
        const classification = filters.classify(element.category);
        if (classification !== filters.type) return false;
      }

      // Period filter
      if (filters.period !== "all") {
        if (element.period !== filters.period) return false;
      }

      // Group filter
      if (filters.group !== "all") {
        if (element.group !== filters.group) return false;
      }

      // Category filter (element type like "lanthanide", "alkali metal", etc.)
      if (filters.category !== "all") {
        if (!element.category || !element.category.toLowerCase().includes(filters.category.toLowerCase())) {
          return false;
        }
      }

      // Physical phase filter
      if (filters.phases.length > 0) {
        const phase = element.phase ? element.phase.toLowerCase() : "";
        const hasMatchingPhase = filters.phases.some(p => phase === p.toLowerCase());
        if (!hasMatchingPhase) return false;
      }

      // Electron affinity filter
      if (filters.electronAffinity !== "all") {
        const ea = element.electron_affinity;
        if (ea !== undefined && ea !== null) {
          switch (filters.electronAffinity) {
            case "high-positive":
              if (ea <= 100) return false;
              break;
            case "positive":
              if (ea < 0 || ea > 100) return false;
              break;
            case "low":
              if (ea >= 0) return false;
              break;
            default:
              break;
          }
        }
      }

      return true;
    },
    [searchQuery, filters, hoveredBlock]
  );

  // Filter data
  const mainElements = useMemo(() => getMainElements(elementsData), []);
  const lanthanides = useMemo(() => getLanthanides(elementsData), []);
  const actinides = useMemo(() => getActinides(elementsData), []);

  // Count visible
  const visibleCount = useMemo(() => {
    return elementsData.filter(isElementVisible).length;
  }, [isElementVisible]);

  const hasActiveFilters = searchQuery || filters.type !== "all" || filters.period !== "all" || filters.group !== "all" || filters.phases.length > 0 || filters.electronAffinity !== "all" || filters.category !== "all";

  // Render element cell
  const renderElement = (element, gridStyle = {}) => {
    const visible = isElementVisible(element);
    const isSelected = selectedElement && selectedElement.number === element.number;

    return (
      <div
        key={element.number}
        ref={(el) => (elementRefs.current[element.number] = el)}
        className={`element ${!visible ? "element-hidden" : ""} ${isSelected ? "element-selected" : ""}`}
        style={{
          ...gridStyle,
          backgroundColor: visible ? getBlockColor(element.block) : undefined,
        }}
        onClick={() => {
          if (visible) handleElementClick(element);
        }}
        onMouseEnter={visible ? (e) => showTooltip(element, e) : undefined}
        onMouseLeave={hideTooltip}
        onFocus={visible ? (e) => showTooltip(element, e) : undefined}
        onBlur={hideTooltip}
        tabIndex={visible ? 0 : -1}
        title={visible ? `${element.name} (${element.symbol}) - #${element.number}` : ""}
      >
        {element.bohr_model_image && (
          <img
            src={element.bohr_model_image}
            alt=""
            className="element-bg-image"
            loading="lazy"
            aria-hidden="true"
          />
        )}
        <strong className={`element-block ${element.block}`}>
          {element.symbol}
        </strong>
        <span className="atomic-number">{element.number}</span>
      </div>
    );
  };

  return (
    <div className="periodic-table-wrapper">
      {/* Controls Bar */}
      <div className="controls-bar">
        <SearchBar
          elements={elementsData}
          onSearch={handleSearch}
          onSelectElement={handleSelectElement}
        />
        <AdvancedFilterPanel onFilterChange={handleFilterChange} />
main

      <div className="periodic-table">
        {mainElements.map((element) => (
          <div
            key={element.number}
            className="element"
            style={{
              gridColumn: element.group,
              gridRow: element.period,
              backgroundColor: getBlockColor(element.block),
            }}
            onClick={() => setSelectedElement(element)}
          >
            <strong>{element.symbol}</strong>
            <span>{element.number}</span>
          </div>
        ))}
      </div>

      <div className="f-block">
        {lanthanides.map((element, index) => (
          <div
            key={element.number}
            className="element"
            style={{
              gridColumn: index + 4,
              backgroundColor: getBlockColor(element.block),
            }}
            onClick={() => setSelectedElement(element)}
          >
            <strong>{element.symbol}</strong>
            <span>{element.number}</span>
          </div>
        ))}
      </div>

      <div className="f-block">
        {actinides.map((element, index) => (
          <div
            key={element.number}
            className="element"
            style={{
              gridColumn: index + 4,
              backgroundColor: getBlockColor(element.block),
            }}
            onClick={() => setSelectedElement(element)}
          >
            <strong>{element.symbol}</strong>
            <span>{element.number}</span>
          </div>
        ))}
      </div>

      {selectedElement && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedElement(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setSelectedElement(null)}
            >
              ×
            </button>

            <h2>{selectedElement.name}</h2>

            <p>
              <strong>Symbol:</strong> {selectedElement.symbol}
            </p>

            <p>
              <strong>Atomic Number:</strong> {selectedElement.number}
            </p>

            <p>
              <strong>Electron Configuration:</strong>{" "}
              {selectedElement.electron_configuration_semantic}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicTable;