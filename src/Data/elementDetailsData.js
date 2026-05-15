// Additional detailed information for elements
// This complements the main elementsData.js

const elementDetailsData = {
  1: { // Hydrogen
    oxidation_states: [1, -1],
    year_discovered: 1766,
    common_uses: [
      "Fuel and energy production",
      "Ammonia synthesis",
      "Methanol production",
      "Petroleum refining",
      "Hydrogenation of oils"
    ],
    isotopes: [
      { symbol: "¹H", name: "Protium", abundance: "99.985%", half_life: "Stable" },
      { symbol: "²H", name: "Deuterium", abundance: "0.015%", half_life: "Stable" },
      { symbol: "³H", name: "Tritium", abundance: "Trace", half_life: "12.3 years" }
    ],
    orbitals: "1s¹",
    historical_significance: "First element discovered, lightest element"
  },
  2: { // Helium
    oxidation_states: [0],
    year_discovered: 1868,
    common_uses: [
      "Balloons and airships",
      "Cryogenic cooling",
      "Welding",
      "Medical applications",
      "Deep-sea diving"
    ],
    isotopes: [
      { symbol: "³He", name: "Helium-3", abundance: "0.000137%", half_life: "Stable" },
      { symbol: "⁴He", name: "Helium-4", abundance: "99.999863%", half_life: "Stable" }
    ],
    orbitals: "1s²",
    historical_significance: "Second lightest element, noble gas"
  },
  3: { // Lithium
    oxidation_states: [1],
    year_discovered: 1817,
    common_uses: [
      "Battery production",
      "Medication for bipolar disorder",
      "Aluminum alloys",
      "Ceramics and glass",
      "Lubricating greases"
    ],
    isotopes: [
      { symbol: "⁶Li", name: "Lithium-6", abundance: "7.59%", half_life: "Stable" },
      { symbol: "⁷Li", name: "Lithium-7", abundance: "92.41%", half_life: "Stable" }
    ],
    orbitals: "1s² 2s¹",
    historical_significance: "First alkali metal, lightest metal element"
  },
  6: { // Carbon
    oxidation_states: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    year_discovered: 1772,
    common_uses: [
      "Fossil fuels and coal",
      "Diamonds and industrial abrasives",
      "Carbon fiber composites",
      "Biochemistry",
      "Electronics and semiconductors"
    ],
    isotopes: [
      { symbol: "¹²C", name: "Carbon-12", abundance: "98.89%", half_life: "Stable" },
      { symbol: "¹³C", name: "Carbon-13", abundance: "1.11%", half_life: "Stable" },
      { symbol: "¹⁴C", name: "Carbon-14", abundance: "Trace", half_life: "5,730 years" }
    ],
    orbitals: "1s² 2s² 2p²",
    historical_significance: "Backbone of organic chemistry, essential for life"
  },
  7: { // Nitrogen
    oxidation_states: [-3, -2, -1, 0, 1, 3, 5],
    year_discovered: 1772,
    common_uses: [
      "Fertilizer production",
      "Nitrogen gas for inert atmosphere",
      "Explosives",
      "Pharmaceuticals",
      "Food preservation"
    ],
    isotopes: [
      { symbol: "¹⁴N", name: "Nitrogen-14", abundance: "99.632%", half_life: "Stable" },
      { symbol: "¹⁵N", name: "Nitrogen-15", abundance: "0.368%", half_life: "Stable" }
    ],
    orbitals: "1s² 2s² 2p³",
    historical_significance: "Essential for amino acids and proteins"
  },
  8: { // Oxygen
    oxidation_states: [-2, -1, 0],
    year_discovered: 1774,
    common_uses: [
      "Respiration and combustion",
      "Water production",
      "Medical applications",
      "Welding and cutting",
      "Steelmaking"
    ],
    isotopes: [
      { symbol: "¹⁶O", name: "Oxygen-16", abundance: "99.757%", half_life: "Stable" },
      { symbol: "¹⁷O", name: "Oxygen-17", abundance: "0.038%", half_life: "Stable" },
      { symbol: "¹⁸O", name: "Oxygen-18", abundance: "0.205%", half_life: "Stable" }
    ],
    orbitals: "1s² 2s² 2p⁴",
    historical_significance: "Essential for life, supports combustion"
  },
  26: { // Iron
    oxidation_states: [-2, 0, 2, 3, 4, 6],
    year_discovered: -5000,
    common_uses: [
      "Steel production",
      "Construction materials",
      "Transportation",
      "Machinery and tools",
      "Medical supplements"
    ],
    isotopes: [
      { symbol: "⁵⁴Fe", name: "Iron-54", abundance: "5.845%", half_life: "Stable" },
      { symbol: "⁵⁶Fe", name: "Iron-56", abundance: "91.754%", half_life: "Stable" },
      { symbol: "⁵⁷Fe", name: "Iron-57", abundance: "2.119%", half_life: "Stable" },
      { symbol: "⁵⁸Fe", name: "Iron-58", abundance: "0.282%", half_life: "Stable" }
    ],
    orbitals: "[Ar] 3d⁶ 4s²",
    historical_significance: "Most abundant metal in Earth's core"
  },
  79: { // Gold
    oxidation_states: [-1, 0, 1, 3, 5],
    year_discovered: -3000,
    common_uses: [
      "Jewelry and decorative items",
      "Electronics and computers",
      "Dentistry",
      "Medical treatments",
      "Investment"
    ],
    isotopes: [
      { symbol: "¹⁹⁷Au", name: "Gold-197", abundance: "100%", half_life: "Stable" }
    ],
    orbitals: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹",
    historical_significance: "Noble metal, valued for millennia"
  },
};

export default elementDetailsData;
