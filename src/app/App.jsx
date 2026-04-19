import React, { useEffect } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import useScrollReveal from "../hooks/useScrollReveal";
import { CVProvider } from '../context/CVContext';
import ReactGA from 'react-ga4';

function AppContent() {
    const location = useLocation();
    
    useEffect(() => {
        ReactGA.send({ 
            hitType: "pageview", 
            page: location.pathname 
        });
    }, [location]);
    
    useScrollReveal();
    return <AppRoutes />;
}

const App = () => {
    return (
        <Router>
            <CVProvider>
                <AppContent />
            </CVProvider>
        </Router>
    );
};

export default App;