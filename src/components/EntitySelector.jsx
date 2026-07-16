import React, { useState } from "react";
import { Building2, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { DEPARTMENTS } from "../data/mockData";
import SelectionChips from "./SelectionChips";


function EntitySelector({ selection, setSelection }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (depId) =>
    setExpanded((prev) => ({ ...prev, [depId]: !prev[depId] }));

  const toggleDepartment = (depId) => {
    setSelection((prev) => {
      const has = prev.departments.includes(depId);
      return {
        ...prev,
        departments: has ? prev.departments.filter((id) => id !== depId) : [...prev.departments, depId],
      };
    });
  };

  const togglePerson = (perId) => {
    setSelection((prev) => {
      const has = prev.people.includes(perId);
      return {
        ...prev,
        people: has ? prev.people.filter((id) => id !== perId) : [...prev.people, perId],
      };
    });
  };

  const removeSelection = (type, id) => {
    if (type === "department") toggleDepartment(id);
    else togglePerson(id);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#DADCE3] divide-y divide-[#DADCE3] overflow-hidden bg-white">
        {DEPARTMENTS.map((dep) => {
          const isOpen = !!expanded[dep.id];
          const isDepSelected = selection.departments.includes(dep.id);
          const selectedPeopleCount = dep.people.filter((p) => selection.people.includes(p.id)).length;

          return (
            <div key={dep.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(dep.id)}
                  className="text-[#6B7280] hover:text-[#16233D] transition-colors shrink-0"
                  aria-label={isOpen ? "Kişileri gizle" : "Kişileri göster"}
                >
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDepSelected}
                    onChange={() => toggleDepartment(dep.id)}
                    className="w-4 h-4 rounded border-[#C3C7D1] accent-[#16233D]"
                  />
                  <Building2 size={16} className="text-[#8A8C93] shrink-0" />
                  <span className="font-medium text-[#1B1D23]">{dep.name}</span>
                </label>

                <span className="text-xs text-[#8A8C93]">
                  {isDepSelected ? "Departman seçildi" : selectedPeopleCount > 0 ? `${selectedPeopleCount} kişi seçildi` : `${dep.people.length} kişi`}
                </span>
              </div>

              {isOpen && (
                <div className="bg-[#F4F5F8] px-4 py-2 pl-12 space-y-1">
                  {dep.people.map((person) => (
                    <label
                      key={person.id}
                      className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none group"
                    >
                      <input
                        type="checkbox"
                        checked={selection.people.includes(person.id)}
                        onChange={() => togglePerson(person.id)}
                        disabled={isDepSelected}
                        className="w-4 h-4 rounded border-[#C3C7D1] accent-[#2E4A7D] disabled:opacity-40"
                      />
                      <span className={`text-sm ${isDepSelected ? "text-[#AEB1BA]" : "text-[#1B1D23]"} group-hover:text-[#16233D]`}>
                        {person.name}
                      </span>
                      <span className="text-xs text-[#8A8C93]">{person.title}</span>
                    </label>
                  ))}
                  {isDepSelected && (
                    <p className="text-xs text-[#6B7A99] flex items-center gap-1 pt-1">
                      <AlertCircle size={12} /> Departmanın tamamı seçili olduğu için kişiler tek tek seçilemez.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8C93] mb-2">Seçilenler</p>
        <SelectionChips selection={selection} onRemove={removeSelection} />
      </div>
    </div>
  );
}
export default EntitySelector;