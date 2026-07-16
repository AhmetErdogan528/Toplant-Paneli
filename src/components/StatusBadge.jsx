import React from "react";

const STATUS_MAP = {
  beklemede: { text: "Beklemede", cls: "bg-slate-100 text-slate-600" },
  onay_bekliyor: { text: "Onay Bekliyor", cls: "bg-arel-amberBg text-arel-amber" },
  tamamlandi: { text: "Tamamlandı", cls: "bg-arel-greenBg text-arel-green" },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.beklemede;
  return (
    <span className={`text-xs rounded-full px-3 py-1 font-medium ${s.cls}`}>
      {s.text}
    </span>
  );
}