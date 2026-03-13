import React from "react";
import { useCV } from "../../../context/CVContext";
import { Button } from "../../../shared/ui/UIComponents";
import { FaEdit, FaCopy, FaTrash, FaPlus } from "react-icons/fa"; // <-- React Icons

function MultiEntryForm({ section, label, renderItem, addEntry, editEntry, emptyText }) {
  const { cvData, dispatch } = useCV();
  const items = cvData[section] || [];

  return (
    <div className="space-y-3">
      {items.length ? items.map(item => (
        <div key={item.id} className="bg-[var(--surface-50)] rounded-lg p-3 border border-[var(--surface-200)]">
          <div className="flex items-center justify-between mb-2">
            {renderItem(item)}
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => editEntry(item.id)}>
                <FaEdit size={14} className="text-[var(--brand-600)]" />
              </Button>
             
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'REMOVE_ENTRY', section, id: item.id })}>
                <FaTrash size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      )) : (
        <p className="text-sm text-[var(--surface-900)] text-center py-4">{emptyText || 'No entries yet.'}</p>
      )}
      <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={addEntry}>
        <FaPlus /> Add {label}
      </Button>
    </div>
  );
}

export default MultiEntryForm;