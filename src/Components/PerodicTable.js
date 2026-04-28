import React, { useState } from "react";
import elementsData from "../Data/elementsData";
import "./PeriodicTable.css";
import getBlockColor from "./blockColor";
import { getMainElements , getLanthanides , getActinides } from "./filterBlocks";
import SmallBox from "./SmallBox";

const PeriodicTable = () => {

  // Display Info on clicking the particular element
  const [selectedElement, setSelectedElement] = useState(null);

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  // Filter Blocks

  const mainElements = getMainElements(elementsData);
  const lanthanides = getLanthanides(elementsData);
  const actinides = getActinides(elementsData);


  return (
    <div>   

      <div className="box-container">

        <div style={{display: 'flex'}}><SmallBox color="skyblue" />s block</div>
        <div style={{display: 'flex'}}><SmallBox color="orange" />d block</div>
        <div style={{display: 'flex'}}><SmallBox color="green" />p block</div>
        <div style={{display: 'flex'}}><SmallBox color="purple" />f block</div>
      </div>

      {/* Main Periodic Table */}
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
            
        onClick = {() => handleElementClick(element)}
          >
            <strong className={`element-block ${element.block}`}>{element.symbol}</strong>
            <span className="atomic-number">{element.number}</span>
          </div>
        ))}
      </div>


      {/* Lanthanides Row */}
      <div className="f-block">
        {lanthanides.map((element, index) => (
          <div
            key={element.number}
            className="element"
            style={{
              gridColumn: index + 4,
              backgroundColor: getBlockColor(element.block),
            }}

        onClick = {() => handleElementClick(element)}
          >
            <strong className={`element-block ${element.block}`}>{element.symbol}</strong>
            <span className="atomic-number">{element.number}</span>
          </div>
        ))}
      </div>


      {/* Actinides Row (Below Lanthanides) */}
      <div className="f-block">
        {actinides.map((element, index) => (
          <div
            key={element.number}
            className="element"
            style={{
              gridColumn: index + 4,
              backgroundColor: getBlockColor(element.block),
            }}
           
        onClick = {() => handleElementClick(element)}
          >

            <strong className={`element-block ${element.block}`}>{element.symbol}</strong>
            <span className="atomic-number">{element.number}</span>
          </div>
        ))}
        </div>
  
        
      {/* Element Information Modal */}
      {selectedElement && (
        <div className="modal-overlay" onClick={() => setSelectedElement(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedElement(null)}>&times;</button>
            <div className="modal-header">
              <div className="modal-symbol" style={{ backgroundColor: getBlockColor(selectedElement.block) }}>
                {selectedElement.symbol}
              </div>
              <div className="modal-title">
                <h2>{selectedElement.name}</h2>
                <span className="modal-category">{selectedElement.category}</span>
              </div>
            </div>
            
            <div className="modal-body">
              <p><strong>Atomic Number:</strong> {selectedElement.number}</p>
              <p><strong>Atomic Mass:</strong> {selectedElement.atomic_mass}</p>
              <p><strong>Electron Config:</strong> {selectedElement.electron_configuration_semantic}</p>
              <p><strong>Group:</strong> {selectedElement.group || 'N/A'}</p>
              <p><strong>Period:</strong> {selectedElement.period}</p>
              <p><strong>Phase:</strong> {selectedElement.phase}</p>
              <p style={{ gridColumn: "1 / -1" }}><strong>Discovered by:</strong> {selectedElement.discovered_by || 'Unknown'}</p>
            </div>
            
            <div className="modal-footer">
              <p><strong>Summary:</strong> {selectedElement.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicTable;



