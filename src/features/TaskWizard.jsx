import React, { useState, useMemo } from "react";
import { Clock, Upload, FileText, ClipboardList, Users, UserCheck, CalendarClock, Paperclip, X } from "lucide-react";
import { ALL_PEOPLE, DEPARTMENTS } from "../data/mockData";
import { WizardShell } from "../components/WizardComponents"; 
import EntitySelector from "../components/EntitySelector";

// WizardHeader bileşenini buraya gömdük
const WizardHeader = ({ eyebrow, title, onCancel }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <p className="text-xs font-semibold text-[#8A8C93] uppercase tracking-wider">{eyebrow}</p>
      <h2 className="text-xl font-bold text-[#1B1D23]">{title}</h2>
    </div>
    <button onClick={onCancel} className="p-2 hover:bg-[#F4F5F8] rounded-full text-[#6B7280]">
      <X size={20} />
    </button>
  </div>
);

// SummaryRow bileşenini buraya gömdük
const SummaryRow = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 text-sm py-1">
    <Icon size={16} className="text-[#8A8C93] shrink-0 mt-0.5" />
    <span className="text-[#6B7280] w-24">{label}:</span>
    <span className="font-medium text-[#1B1D23]">{value}</span>
  </div>
);

const nameForSelection = (selection) => {
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

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

function TaskWizard({ onCancel, onComplete }) {
  const steps = [
    { title: "Görev Bilgisi" }, { title: "Atanan" }, { title: "Gözetmen" },
    { title: "Süre" }, { title: "Kanıt Alanı" }, { title: "Özet" },
  ];

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState({ departments: [], people: [] });
  const [supervisor, setSupervisor] = useState({ departments: [], people: [] });
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("gün");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [saved, setSaved] = useState(false);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return title.trim().length > 0;
      case 1: return assignee.departments.length > 0 || assignee.people.length > 0;
      case 2: return supervisor.departments.length > 0 || supervisor.people.length > 0;
      case 3: return durationValue !== "" && Number(durationValue) > 0;
      default: return true;
    }
  }, [step, title, assignee, supervisor, durationValue]);

  const goNext = () => canProceed && setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

 const handleSave = () => {
  const task = {
    id: uid(),
    title,
    description,
    assignee,
    supervisor,
    durationValue,
    durationUnit,
    evidenceNote,
    createdAt: new Date(),
    evidenceUploaded: false,
  };

  onComplete(task);
};
  return (
    <div className="max-w-3xl mx-auto">
      <WizardHeader eyebrow="Yeni Kayıt" title="Görev Ekle" onCancel={onCancel} />

      <WizardShell
        key={`wizard-step-${step}`} // Hata engelleyici anahtar
        steps={steps}
        step={step}
        canProceed={canProceed}
        onBack={goBack}
        onNext={goNext}
        onSave={handleSave}
        isLastStep={step === steps.length - 1}
        saved={saved}
        saveLabel="Görevi Kaydet"
      >
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1B1D23] mb-1.5">Görevin adı</label>
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Bahar dönemi kayıt raporunun hazırlanması" className="w-full rounded-md border border-[#CBCED6] px-3.5 py-2.5 text-[#1B1D23]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1B1D23] mb-1.5">Açıklama</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full rounded-md border border-[#CBCED6] px-3.5 py-2.5 text-[#1B1D23] resize-none" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm text-[#6B7280] mb-4">Bir departmanı doğrudan seçebilir, ya da departmanı açıp içinden bir veya birden çok kişi işaretleyebilirsin.</p>
            <EntitySelector selection={assignee} setSelection={setAssignee} />
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-[#6B7280] mb-4">Bu görevi kim denetleyecek? Aynı şekilde bir departman ya da bir/birden çok kişi seçebilirsin.</p>
            <EntitySelector selection={supervisor} setSelection={setSupervisor} />
          </div>
        )}

        {step === 3 && (
          <div className="max-w-sm">
            <label className="block text-sm font-medium text-[#1B1D23] mb-1.5">Görev süresi</label>
            <div className="flex gap-2">
              <input type="number" min="1" value={durationValue} onChange={(e) => setDurationValue(e.target.value)} placeholder="10" className="w-28 rounded-md border border-[#CBCED6] px-3.5 py-2.5" />
              <div className="flex rounded-md border border-[#CBCED6] overflow-hidden">
                {["saat", "gün", "hafta"].map((unit) => (
                  <button key={unit} type="button" onClick={() => setDurationUnit(unit)} className={`px-4 py-2.5 text-sm font-medium ${durationUnit === unit ? "bg-[#16233D] text-white" : "bg-white text-[#6B7280]"}`}>{unit}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-[#CBCED6] bg-[#F4F5F8] px-6 py-10 text-center">
              <Upload size={26} className="mx-auto text-[#2E4A7D] mb-3" />
              <p className="text-sm font-medium text-[#1B1D23]">Kanıt dosyası alanı</p>
            </div>
            <input value={evidenceNote} onChange={(e) => setEvidenceNote(e.target.value)} placeholder="Not ekle..." className="w-full rounded-md border border-[#CBCED6] px-3.5 py-2.5" />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-1">
            <SummaryRow icon={FileText} label="Görev" value={title || "—"} />
            <SummaryRow icon={Users} label="Atanan" value={nameForSelection(assignee)} />
            <SummaryRow icon={UserCheck} label="Gözetmen" value={nameForSelection(supervisor)} />
            <SummaryRow icon={CalendarClock} label="Süre" value={durationValue ? `${durationValue} ${durationUnit}` : "—"} />
            <SummaryRow icon={Paperclip} label="Kanıt" value={evidenceNote || "Tamamlandığında eklenecek"} />
          </div>
        )}
      </WizardShell>
    </div>
  );
}

export default TaskWizard;