import React, { useEffect, useState } from 'react';
import { useElement } from '../contexts/ElementContext';
import elementDetailsData from '../Data/elementDetailsData';
import './ElementDetailsPanel.css';

const ElementDetailsPanel = () => {
  const { selectedElement } = useElement();
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (selectedElement) {
      setIsOpen(true);
      const elementDetails = elementDetailsData[selectedElement.number];
      setDetails(elementDetails || getDefaultDetails(selectedElement));
    } else {
      setIsOpen(false);
    }
  }, [selectedElement]);

  const getDefaultDetails = (element) => {
    // Provide sensible defaults for elements without detailed data
    return {
      oxidation_states: ['N/A'],
      year_discovered: 'Unknown',
      common_uses: ['Scientific research', 'Industrial applications'],
      isotopes: [
        { symbol: element.symbol, name: element.name, abundance: '100%', half_life: 'Stable' }
      ],
      orbitals: element.electron_configuration || 'N/A',
      historical_significance: `Atomic number: ${element.number}`,
    };
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!selectedElement) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`element-details-overlay ${isOpen ? 'active' : ''}`}
        onClick={handleClose}
      />

      {/* Side Panel */}
      <div className={`element-details-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="panel-header">
          <div className="element-title">
            <div
              className="element-circle"
              style={{ backgroundColor: `#${selectedElement['cpk-hex'] || 'cccccc'}` }}
            >
              <span className="atomic-number">{selectedElement.number}</span>
            </div>
            <div>
              <h2>{selectedElement.name}</h2>
              <p className="element-symbol">{selectedElement.symbol}</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose} aria-label="Close panel">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="panel-content">
          {/* Basic Information */}
          <section className="panel-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Atomic Mass</span>
                <span className="value">{selectedElement.atomic_mass.toFixed(3)}</span>
              </div>
              <div className="info-item">
                <span className="label">Atomic Number</span>
                <span className="value">{selectedElement.number}</span>
              </div>
              <div className="info-item">
                <span className="label">Period</span>
                <span className="value">{selectedElement.period}</span>
              </div>
              <div className="info-item">
                <span className="label">Group</span>
                <span className="value">{selectedElement.group}</span>
              </div>
              <div className="info-item">
                <span className="label">Category</span>
                <span className="value">{selectedElement.category}</span>
              </div>
              <div className="info-item">
                <span className="label">Phase</span>
                <span className="value">{selectedElement.phase}</span>
              </div>
            </div>
          </section>

          {/* Electron Configuration */}
          <section className="panel-section">
            <h3 className="section-title">Electron Configuration</h3>
            <div className="electron-config">
              <p className="config-text">{selectedElement.electron_configuration}</p>
              <p className="config-label">{details?.orbitals || selectedElement.electron_configuration}</p>
            </div>
          </section>

          {/* Oxidation States */}
          {details?.oxidation_states && (
            <section className="panel-section">
              <h3 className="section-title">Oxidation States</h3>
              <div className="oxidation-states">
                {details.oxidation_states.map((state, idx) => (
                  <span key={idx} className="state-badge">
                    {state > 0 ? `+${state}` : state}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Year Discovered */}
          {details?.year_discovered && (
            <section className="panel-section">
              <h3 className="section-title">Discovery</h3>
              <div className="discovery-info">
                <p className="year">
                  {typeof details.year_discovered === 'number' && details.year_discovered < 0
                    ? `Ancient Times (${Math.abs(details.year_discovered)} BC)`
                    : details.year_discovered}
                </p>
                {selectedElement.discovered_by && (
                  <p className="discoverer">Discovered by: {selectedElement.discovered_by}</p>
                )}
              </div>
            </section>
          )}

          {/* Common Uses */}
          {details?.common_uses && details.common_uses.length > 0 && (
            <section className="panel-section">
              <h3 className="section-title">Common Uses</h3>
              <ul className="uses-list">
                {details.common_uses.map((use, idx) => (
                  <li key={idx}>{use}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Isotopes */}
          {details?.isotopes && details.isotopes.length > 0 && (
            <section className="panel-section">
              <h3 className="section-title">Isotopes</h3>
              <div className="isotopes-list">
                {details.isotopes.map((isotope, idx) => (
                  <div key={idx} className="isotope-item">
                    <div className="isotope-header">
                      <span className="isotope-name">{isotope.symbol}</span>
                      <span className="abundance-badge">{isotope.abundance}</span>
                    </div>
                    <div className="isotope-details">
                      <p className="isotope-desc">{isotope.name}</p>
                      <p className="half-life">Half-life: {isotope.half_life}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Physical Properties */}
          <section className="panel-section">
            <h3 className="section-title">Physical Properties</h3>
            <div className="properties-grid">
              {selectedElement.density && (
                <div className="property-item">
                  <span className="prop-label">Density</span>
                  <span className="prop-value">{selectedElement.density.toFixed(3)} g/cm³</span>
                </div>
              )}
              {selectedElement.melt && (
                <div className="property-item">
                  <span className="prop-label">Melting Point</span>
                  <span className="prop-value">{selectedElement.melt.toFixed(2)} K</span>
                </div>
              )}
              {selectedElement.boil && (
                <div className="property-item">
                  <span className="prop-label">Boiling Point</span>
                  <span className="prop-value">{selectedElement.boil.toFixed(2)} K</span>
                </div>
              )}
              {selectedElement.electronegativity_pauling && (
                <div className="property-item">
                  <span className="prop-label">Electronegativity</span>
                  <span className="prop-value">{selectedElement.electronegativity_pauling}</span>
                </div>
              )}
            </div>
          </section>

          {/* Historical Significance */}
          {details?.historical_significance && (
            <section className="panel-section">
              <h3 className="section-title">Historical Significance</h3>
              <p className="significance-text">{details.historical_significance}</p>
            </section>
          )}

          {/* Summary */}
          {selectedElement.summary && (
            <section className="panel-section">
              <h3 className="section-title">Summary</h3>
              <p className="summary-text">{selectedElement.summary}</p>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default ElementDetailsPanel;
