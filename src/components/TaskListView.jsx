import React, { useState, useMemo } from "react";
import {
  Eye, EyeOff, ClipboardList, Users, UserCheck, CalendarClock,
  Paperclip, Check, RotateCcw,
} from "lucide-react";
import { ALL_PEOPLE, DEPARTMENTS } from "../data/mockData";
import { useMeetingData } from "../MeetingDataContext";
import StatusBadge from "./StatusBadge";
import EvidenceUpload from "./EvidenceUpload";

const nameForSelection = (selection) => {
  if (!selection || (!selection.departments && !selection.people)) return "—";
  const parts = [];
  selection.departments?.forEach((id) => {
    const d = DEPARTMENTS.find((x) => x.id === id);
    if (d) parts.push(d.name);
  });
  selection.people?.forEach((id) => {
    for (const dep of DEPARTMENTS) {
      const p = dep.people.find((x) => x.id === id);
      if (p) parts.push(p.name);
    }
  });
  return parts.length ? parts.join(", ") : "—";
};

const SummaryRow = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 text-sm py-1">
    <Icon size={16} className="text-[#8A8C93] shrink-0 mt-0.5" />
    <span className="text-[#6B7280] w-24">{label}:</span>
    <span className="font-medium text-[#1B1D23]">{value}</span>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="text-center py-12 text-[#8A8C93] italic">{text}</div>
);

function TaskListView({ tasks, currentUser, onCancel }) {
  const [tab, setTab] = useState("mine");
  const [expandedId, setExpandedId] = useState(null);
  const { submitEvidence, approveTask, requestRevision } = useMeetingData();

  const tabs = useMemo(() => {
    if (!tasks) return [];
    const myDeptId = ALL_PEOPLE.find((p) => p.id === currentUser)?.departmentId;
    return [
      { key: "mine", label: "Bana Verilenler", list: tasks.filter((t) => t.assignee?.people.includes(currentUser)) },
      { key: "dept", label: "Departmanım", list: tasks.filter((t) => t.assignee?.departments.includes(myDeptId)) },
      { key: "supervising", label: "Gözetimimdekiler", list: tasks.filter((t) => t.supervisor?.people.includes(currentUser) || t.supervisor?.departments.includes(myDeptId)) },
    ];
  }, [tasks, currentUser]);

  const currentTabData = tabs.find((t) => t.key === tab);
  const activeList = currentTabData ? currentTabData.list : [];

  // "mine" veya "dept" sekmesinde miyiz? (görevi ÜSTLENEN kişi burada kanıt yükler)
  const isAssigneeView = tab === "mine" || tab === "dept";
  // "supervising" sekmesinde miyiz? (gözetmen burada onaylar)
  const isSupervisorView = tab === "supervising";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-1 mb-5 border-b border-[#E5E7EC]">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setExpandedId(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 ${tab === t.key ? "border-[#16233D] text-[#16233D]" : "border-transparent text-[#8A8C93]"}`}
          >
            {t.label} ({t.list.length})
          </button>
        ))}
      </div>

      {activeList.length === 0 ? (
        <EmptyState text="Bu listede henüz görev yok." />
      ) : (
        <div className="rounded-xl border border-[#DADCE3] bg-white divide-y divide-[#EBEBEB] overflow-hidden">
          {activeList.map((t) => {
            const status = t.status || "beklemede";
            return (
              <div key={`${t.id}-${tab}`}>
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <p className="font-medium text-[#1B1D23] truncate">{t.title}</p>
                    <StatusBadge status={status} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    className="text-sm text-[#2E4A7D] flex items-center gap-1 hover:underline shrink-0"
                  >
                    {expandedId === t.id ? (
                      <><EyeOff size={14} /> Gizle</>
                    ) : (
                      <><Eye size={14} /> Detayları Gör</>
                    )}
                  </button>
                </div>

                {expandedId === t.id && (
                  <div className="px-5 pb-5 bg-[#F9FAFB]">
                    <div className="bg-white p-3 rounded-lg border border-[#EBEBEB] space-y-1">
                      <SummaryRow icon={ClipboardList} label="Açıklama" value={t.description || "-"} />
                      <SummaryRow icon={Users} label="Atanan" value={nameForSelection(t.assignee)} />
                      <SummaryRow icon={UserCheck} label="Gözetmen" value={nameForSelection(t.supervisor)} />
                      <SummaryRow icon={CalendarClock} label="Süre" value={`${t.durationValue} ${t.durationUnit}`} />
                      <SummaryRow icon={Paperclip} label="Kanıt" value={t.evidenceNote || "Henüz eklenmedi"} />
                    </div>

                    {/* GÖREVİ ÜSTLENEN kişi için: kanıt yükleme alanı (sadece "beklemede" iken) */}
                    {isAssigneeView && status === "beklemede" && (
                      <div className="mt-3">
                        <EvidenceUpload onSubmit={(file) => submitEvidence(t.id, file)} />
                      </div>
                    )}

                    {/* GÖREVİ ÜSTLENEN kişi için: onay bekleniyor mesajı */}
                    {isAssigneeView && status === "onay_bekliyor" && (
                      <p className="mt-3 text-sm text-[#8A6A34] bg-[#F5EEE2] rounded-md px-3 py-2">
                        Kanıt yüklendi, gözetmenin onayı bekleniyor.
                      </p>
                    )}

                    {/* GÖZETMEN için: onay bekleyen görevde kanıt önizleme + onay/red */}
                    {isSupervisorView && status === "onay_bekliyor" && (
                      <div className="mt-3 space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-[#EBEBEB]">
                          {t.evidence?.type?.startsWith("image/") ? (
                            <img
                              src={t.evidence.dataUrl}
                              alt="Yüklenen kanıt"
                              className="max-h-48 rounded-md border"
                            />
                          ) : (
                            <p className="text-sm text-[#1B1D23]">
                              Yüklenen dosya: <span className="font-medium">{t.evidence?.name}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => approveTask(t.id)}
                            className="flex items-center gap-1.5 rounded-md bg-[#1F8A3B] text-white px-4 py-2 text-sm font-medium hover:opacity-90"
                          >
                            <Check size={15} /> Görevi Onayla ve Tamamla
                          </button>
                          <button
                            type="button"
                            onClick={() => requestRevision(t.id)}
                            className="flex items-center gap-1.5 rounded-md border border-[#CBCED6] text-[#6B7280] px-4 py-2 text-sm font-medium hover:text-[#B4463A] hover:border-[#B4463A]"
                          >
                            <RotateCcw size={15} /> Düzeltme İste
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Herkes için: görev tamamlandıysa bilgi mesajı */}
                    {status === "tamamlandi" && (
                      <p className="mt-3 text-sm text-[#1F8A3B] bg-[#E6F4EA] rounded-md px-3 py-2">
                        Bu görev onaylanarak tamamlandı.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TaskListView;