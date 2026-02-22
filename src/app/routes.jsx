// src/app/routes.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'

// // Pages
import LandingPage from '../features/landing/pages/Landingpage'
// import AnalyzerPage from '../features/analyzer/pages/AnalyzerPage'
// import EditorPage from '../features/editor/pages/EditorPage'
import TemplatesPage from '../features/template/pages/Templatepage'
import NotFound from '../shared/pages/NotFound'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* <Route path="/analyzer" element={<AnalyzerPage />} /> */}
      {/* <Route path="/editor" element={<EditorPage />} /> */}
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
