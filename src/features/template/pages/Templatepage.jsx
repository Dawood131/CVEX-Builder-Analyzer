import React, { useState, useMemo } from "react";
import { useCV } from "../../../context/CVContext";
import { getTemplatesByCategory, getTemplateById } from "../../../utils/helper";
import { Button } from "../../../shared/ui/UIComponents";
import { cn } from "../../../utils/helper";
import { TEMPLATE_CATEGORIES, TEMPLATES } from "../../../data/templates";
import TemplateCard from "../components/TemplateCard";
import { useNavigate } from 'react-router-dom';

// React Icons
import {
  FaArrowLeft,
  FaMoon,
  FaSun,
  FaSearch,
  FaFolderOpen,
  FaTrash
} from "react-icons/fa";

function TemplatesPage() {
  const navigate = useNavigate();
  const {
    cvData,
    savedCVs = [],
    loadVersion,
    deleteVersion,
    newCV,
    showToast,
    darkMode,
    setDarkMode,
  } = useCV();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Filter templates safely
  const filtered = useMemo(() => {
    let list = [...getTemplatesByCategory(filter, TEMPLATES)] || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, search]);

  const selectTpl = (id) => {
    const tpl = getTemplateById(id);
    newCV(id, tpl?.colors?.[0] || "#4f46e5");
    navigate("/editor");
  };

  const loadSaved = (id) => {
    loadVersion(id);
    navigate("/editor");
    showToast("CV loaded successfully!", "success");
  };

  const deleteSaved = (id) => {
    if (confirm("Delete this saved CV?")) {
      deleteVersion(id);
      showToast("CV deleted", "success");
    }
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-[var(--surface-50)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-[var(--surface-200)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <FaArrowLeft />
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img
                  src="/CVEX Logo Design.png"
                  alt="CVEX Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={setDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 text-[var(--surface-900)]">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Choose Your Template
          </h1>
          <p className="mt-3 text-surface-500 dark:text-surface-400 text-lg">
            Select a professional template to get started. You can always change it later.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={filter === cat.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter(cat.id)}
              >
                <Icon className="mr-1" /> {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--surface-900)]" />
            <input
              type="text"
              className="w-full px-3.5 py-2.5 pl-10 border-[1.5px] border-[var(--surface-200)] rounded-[0.625rem] text-sm bg-[var(--surface-100)] focus:outline-none focus:border-[var(--brand-500)] focus:ring-[3px] focus:ring-[VAR(--brand-500)]/10 text-[var(--surface-900)]"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered?.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={cvData?.design?.template === t.id}
              onClick={() => selectTpl(t.id)}
            />
          ))}
        </div>

        {/* Saved CVs */}
        {savedCVs?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaFolderOpen className="text-brand-500" />
              Your Saved CVs
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCVs.map((cv) => (
                <div
                  key={cv.id}
                  className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 card-hover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold">{cv.name}</div>
                      <div className="text-xs text-surface-400">
                        {new Date(cv.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadSaved(cv.id)}
                        title="Load"
                      >
                        <FaFolderOpen />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => deleteSaved(cv.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => loadSaved(cv.id)}
                  >
                    Continue Editing
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplatesPage;