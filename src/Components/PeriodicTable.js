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
  <div>
    <h1>Periodic Table Explorer</h1>

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
          onClick={() => setSelectedElement(element) }
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