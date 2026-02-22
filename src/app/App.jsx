// App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes";
import useScrollReveal from "../hooks/useScrollReveal";

function AppContent() {
  useScrollReveal();
  return <AppRoutes />;
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;