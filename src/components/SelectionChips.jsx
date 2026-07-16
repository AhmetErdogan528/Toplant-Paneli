
import React from "react";
import { Building2, Users, X } from "lucide-react";
import { DEPARTMENTS } from "../data/mockData"; // Verinin olduğu klasöre göre yolunu kontrol et!
function SelectionChips({ selection, onRemove }) {
  const items = [];
  selection.departments.forEach((depId) => {
    const dep = DEPARTMENTS.find((d) => d.id === depId);
    if (dep) items.push({ key: `dep-${depId}`, label: dep.name, icon: Building2, onRemove: () => onRemove("department", depId) });
  });
  selection.people.forEach((perId) => {
    for (const dep of DEPARTMENTS) {
      const person = dep.people.find((p) => p.id === perId);
      if (person) {
        items.push({ key: `per-${perId}`, label: person.name, sub: dep.name, icon: Users, onRemove: () => onRemove("person", perId) });
      }
    }
  });

  if (items.length === 0) {
    return <p className="text-sm text-[#8A8C93] italic">Henüz seçim yapılmadı.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.key}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#16233D] text-white pl-3 pr-2 py-1.5 text-sm"
          >
            <Icon size={13} className="opacity-70 shrink-0" />
            <span className="font-medium">{item.label}</span>
            {item.sub && <span className="text-[#9FADC7] text-xs">· {item.sub}</span>}
            <button
              onClick={item.onRemove}
              className="ml-1 rounded-full hover:bg-white/15 p-0.5 transition-colors"
              aria-label={`${item.label} seçimini kaldır`}
            >
              <X size={12} />
            </button>
          </span>
        );
      })}
    </div>
  );
}
export default SelectionChips;