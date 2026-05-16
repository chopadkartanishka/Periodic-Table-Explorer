import React, { useState } from "react";
import PeriodicTable from "./Components/PeriodicTable";
import Trends from "./Components/Trends/Trends";
import CompareElements from "./Components/compareElements";
import ThemeToggle from "./Components/ThemeToggle/ThemeToggle";
import Assistant from "./Components/Assistant/Assistant";
import QuizMode from "./Components/QuizMode";
import ElementDetailsPanel from "./Components/ElementDetailsPanel";


function App() {
  const [quizOpen, setQuizOpen] = useState(false);

  
  return (
    <div className="app">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
  <h1
  style={{
    margin: 0,
    fontSize: "2.8rem",
    letterSpacing: "1px",
  }}
>
  Periodic Table Explorer
</h1>
  <p style={{ marginTop: "8px", opacity: 0.7 }}>
    Interactive chemistry experience built with React
  </p>
</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setQuizOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(167, 139, 250, 0.35)',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(167, 139, 250, 0.22))',
              color: '#ddd6fe',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease',
            }}
            title="Open Quiz Mode">
            ⚗️ Quiz Mode
          </button>
          <ThemeToggle />
        </div>
      </header>
      <PeriodicTable />
      <Trends />
      <CompareElements />
      <Assistant />
      <ElementDetailsPanel />
      {quizOpen && <QuizMode onClose={() => setQuizOpen(false)} />}
    </div>
  );
}

export default App;

