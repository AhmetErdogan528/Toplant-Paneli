import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Users, Building2, ChevronDown, ChevronRight, Clock,
  Paperclip, ArrowLeft, ArrowRight, Check, X, FileText, Gavel,
  LayoutList, ClipboardList, UserCheck, CalendarClock, Upload,
  AlertCircle, ListChecks, Trash2, Eye, EyeOff, Building
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock kurum verisi — gerçek sistemde API'den gelecek
// ---------------------------------------------------------------------------
import { DEPARTMENTS, ALL_PEOPLE } from "./data/mockData";
import SelectionChips from "./components/SelectionChips";
import TaskListView from "./components/TaskListView";
import EntitySelector from "./components/EntitySelector";
import { ProgressSteps, WizardShell } from "./components/WizardComponents";
import TaskWizard from "./features/TaskWizard"; // Import yolunu kontrol et, dosyanın doğru yerinde olduğundan emin ol
import { useMeetingData } from "./MeetingDataContext";
import StatusBadge from "./components/StatusBadge";

const uid = () => Math.random().toString(36).slice(2, 10);

const nameForSelection = (selection) => {
  const parts = [];
  selection.departments.forEach((id) => {
    const d = DEPARTMENTS.find((x) => x.id === id);
    if (d) parts.push(d.name);
  });
  selection.people.forEach((id) => {
    for (const dep of DEPARTMENTS) {
      const p = dep.people.find((x) => x.id === id);
      if (p) parts.push(p.name);
    }
  });
  return parts.length ? parts.join(", ") : "—";
};

const DURATION_MS = { saat: 3600 * 1000, gün: 24 * 3600 * 1000, hafta: 7 * 24 * 3600 * 1000 };

function remainingLabel(task) {
  const totalMs = Number(task.durationValue) * (DURATION_MS[task.durationUnit] || DURATION_MS["gün"]);
  const deadline = new Date(task.createdAt).getTime() + totalMs;
  const diff = deadline - Date.now();
  if (diff <= 0) return { text: "Süresi doldu", tone: "expired" };

  const hours = diff / (3600 * 1000);
  if (hours < 24) return { text: `${Math.max(1, Math.round(hours))} saat kaldı`, tone: hours < 6 ? "urgent" : "normal" };
  const days = Math.round(hours / 24);
  return { text: `${days} gün kaldı`, tone: days <= 1 ? "urgent" : "normal" };
}


// ---------------------------------------------------------------------------
// Görev Ekle Sihirbazı
// ---------------------------------------------------------------------------


function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 py-3 border-b border-[#EBEBEB] last:border-0">
      <Icon size={16} className="text-[#2E4A7D] shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8C93]">{label}</p>
        <p className="text-sm text-[#1B1D23] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function WizardHeader({ eyebrow, title, onCancel }) {
  return (
    <div className="flex items-center justify-between mb-6 max-w-3xl mx-auto">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#2E4A7D]">{eyebrow}</p>
        <h2 className="text-2xl font-serif text-[#16233D]">{title}</h2>
      </div>
      <button onClick={onCancel} className="text-sm text-[#6B7280] hover:text-[#16233D] flex items-center gap-1.5 transition-colors">
        <X size={16} /> Vazgeç
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Önemli Karar Ekle
// ---------------------------------------------------------------------------
function DecisionForm({ onCancel, onComplete }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [related, setRelated] = useState({ departments: [], people: [] });

  const canSave = title.trim().length > 0;

  const handleSave = () => onComplete({ id: uid(), title, description, related, createdAt: new Date() });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#2E4A7D]">Yeni Kayıt</p>
          <h2 className="text-2xl font-serif text-[#16233D]">Önemli Karar Ekle</h2>
        </div>
        <button onClick={onCancel} className="text-sm text-[#6B7280] hover:text-[#16233D] flex items-center gap-1.5">
          <X size={16} /> Vazgeç
        </button>
      </div>

      <div className="rounded-xl border border-[#DADCE3] bg-white p-6 md:p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1B1D23] mb-1.5">Karar</label>
          <input
            autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn. Yaz okulu kontenjanının %20 artırılması"
            className="w-full rounded-md border border-[#CBCED6] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2E4A7D]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B1D23] mb-1.5">Gerekçe / not</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder="Kararın arka planı, toplantıda öne sürülen gerekçe."
            className="w-full rounded-md border border-[#CBCED6] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2E4A7D] resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B1D23] mb-2">İlgili departman / kişi</label>
          <EntitySelector selection={related} setSelection={setRelated} />
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave} disabled={!canSave}
            className="flex items-center gap-1.5 rounded-md bg-[#2E4A7D] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#25406B] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Check size={16} /> Kararı Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toplantı Notu Ekle — madde madde not, sonda kimlerin göreceği seçilir
// ---------------------------------------------------------------------------
function NoteWizard({ onCancel, onComplete }) {
  const steps = [{ title: "Notlar" }, { title: "Kimler Görecek" }];
  const [step, setStep] = useState(0);
  const [noteTitle, setNoteTitle] = useState("");
  const [bullets, setBullets] = useState([{ id: uid(), text: "" }]);
  const [visibility, setVisibility] = useState({ departments: [], people: [] });
  const [saved, setSaved] = useState(false);
  const inputRefs = useRef({});

  const updateBullet = (id, text) => setBullets((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)));

  const addBulletAfter = (id) => {
    const newItem = { id: uid(), text: "" };
    setBullets((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, newItem);
      return next;
    });
    setTimeout(() => inputRefs.current[newItem.id]?.focus(), 0);
  };

  const removeBullet = (id) => {
    setBullets((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));
  };

  const filledBullets = bullets.filter((b) => b.text.trim().length > 0);
  const canProceedStep0 = noteTitle.trim().length > 0 && filledBullets.length > 0;
  const canProceedStep1 = visibility.departments.length > 0 || visibility.people.length > 0;
  const canProceed = step === 0 ? canProceedStep0 : canProceedStep1;

  const handleSave = () => {
    const note = {
      id: uid(), title: noteTitle,
      bullets: filledBullets.map((b) => b.text),
      visibility, createdAt: new Date(),
    };
    setSaved(true);
    setTimeout(() => onComplete(note), 500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <WizardHeader eyebrow="Yeni Kayıt" title="Toplantı Notu Ekle" onCancel={onCancel} />

      <WizardShell
        steps={steps}
        step={step}
        canProceed={canProceed}
        onBack={() => setStep(0)}
        onNext={() => canProceedStep0 && setStep(1)}
        onSave={handleSave}
        isLastStep={step === 1}
        saved={saved}
        saveLabel="Notu Kaydet"
      >
        {step === 0 && (
          <div>
            <label className="block text-sm font-medium text-[#1B1D23] mb-1.5">Not başlığı</label>
            <input
              autoFocus value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Örn. 9 Temmuz Yönetim Kurulu Toplantısı"
              className="w-full rounded-md border border-[#CBCED6] px-3.5 py-2.5 mb-5 focus:outline-none focus:ring-2 focus:ring-[#2E4A7D]"
            />

            <label className="block text-sm font-medium text-[#1B1D23] mb-2">Maddeler</label>
            <div className="rounded-lg border border-[#CBCED6] bg-white p-4 space-y-2">
              {bullets.map((b, i) => (
                <div key={b.id} className="flex items-start gap-2 group">
                  <span className="text-[#2E4A7D] mt-2.5 select-none">•</span>
                  <input
                    ref={(el) => (inputRefs.current[b.id] = el)}
                    value={b.text}
                    onChange={(e) => updateBullet(b.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addBulletAfter(b.id); }
                      if (e.key === "Backspace" && b.text === "" && bullets.length > 1) { e.preventDefault(); removeBullet(b.id); }
                    }}
                    placeholder={i === 0 ? "Toplantıda konuşulan bir noktayı yaz, Enter ile yeni madde ekle…" : "Yeni madde…"}
                    className="flex-1 py-2 text-sm text-[#1B1D23] focus:outline-none border-b border-transparent focus:border-[#2E4A7D]"
                  />
                  {bullets.length > 1 && (
                    <button
                      type="button" onClick={() => removeBullet(b.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#B0B3BB] hover:text-[#B4463A] transition-opacity mt-1.5"
                      aria-label="Maddeyi sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addBulletAfter(bullets[bullets.length - 1].id)}
                className="flex items-center gap-1.5 text-sm text-[#2E4A7D] hover:text-[#16233D] font-medium pt-2"
              >
                <Plus size={14} /> Yeni madde ekle
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm text-[#6B7280] mb-4">
              Bu notu hangi departman veya kişiler görebilecek? Departman seçersen o departmandaki herkes erişebilir.
            </p>
            <EntitySelector selection={visibility} setSelection={setVisibility} />
          </div>
        )}
      </WizardShell>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Görevleri Görüntüle
// ---------------------------------------------------------------------------


function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-[#CBCED6] bg-[#F9FAFB] px-6 py-8 text-center">
      <p className="text-sm text-[#8A8C93]">{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ana Ekran
// ---------------------------------------------------------------------------
export default function MeetingPanel() {
  const [view, setView] = useState("home");
const [flash, setFlash] = useState(null);
const [currentUser, setCurrentUser] = useState(ALL_PEOPLE[0].id);

const {
  tasks,
  decisions,
  notes,
  addTask: addTaskToStore,
  addDecision: addDecisionToStore,
  addNote: addNoteToStore,
} = useMeetingData();

 const addTask = (task) => {
  addTaskToStore(task);
  setFlash(`"${task.title}" görevi eklendi.`);
  setTimeout(() => {
    setView("home");
  }, 100);
  setTimeout(() => setFlash(null), 3500);
};
const addDecision = (decision) => {
  addDecisionToStore(decision);
  setFlash(`"${decision.title}" kararı eklendi.`);
  setView("home");
  setTimeout(() => setFlash(null), 3500);
};
const addNote = (note) => {
  addNoteToStore(note);
  setFlash(`"${note.title}" notu eklendi.`);
  setView("home");
  setTimeout(() => setFlash(null), 3500);
};

  return (
    <div className="min-h-screen bg-[#EEF0F4]">
      <style>{`
        .font-serif { font-family: Georgia, 'Times New Roman', serif; }
        * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
      `}</style>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {flash && (
          <div className="mb-6 rounded-md border border-[#B9CBEA] bg-[#EAF0FB] text-[#1F3153] px-4 py-3 text-sm flex items-center gap-2">
            <Check size={16} /> {flash}
          </div>
        )}

        {view === "home" && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionButton icon={ClipboardList} title="Görev Ekle" subtitle="Kişi, departman ve süre atayarak yeni görev kaydet" onClick={() => setView("task")} primary />
              <ActionButton icon={Gavel} title="Önemli Karar Ekle" subtitle="Toplantıda alınan kararı kayıt altına al" onClick={() => setView("decision")} />
              <ActionButton icon={LayoutList} title="Görevleri Görüntüle" subtitle={`${tasks.length} kayıtlı görev`} onClick={() => setView("tasklist")} />
              <ActionButton icon={ListChecks} title="Toplantı Notu Ekle" subtitle="Madde madde not tut, paylaş" onClick={() => setView("note")} />
            </div>

            <section>
              <h3 className="font-serif text-lg text-[#16233D] mb-3">Son eklenen görevler</h3>
              {tasks.length === 0 ? (
                <EmptyState text="Henüz görev eklenmedi. Toplantı sırasında “Görev Ekle” ile başla." />
              ) : (
                <div className="rounded-xl border border-[#DADCE3] bg-white divide-y divide-[#EBEBEB] overflow-hidden">
                  {tasks.slice(0, 5).map((t) => {
                    const remaining = remainingLabel(t);
                    return (
                      <div key={t.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1B1D23]">{t.title}</p>
                          <p className="text-xs text-[#8A8C93] mt-0.5">
                            Atanan: {nameForSelection(t.assignee)} · Gözetmen: {nameForSelection(t.supervisor)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={t.status || "beklemede"} />
                          <span className={`text-xs rounded-full px-3 py-1 font-medium
                            ${remaining.tone === "expired" ? "bg-[#FBEAE8] text-[#B4463A]" : remaining.tone === "urgent" ? "bg-[#FCF3E3] text-[#A9761C]" : "bg-[#EEF1F5] text-[#4B5A73]"}
                          `}>
                            {remaining.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h3 className="font-serif text-lg text-[#16233D] mb-3">Son eklenen kararlar</h3>
              {decisions.length === 0 ? (
                <EmptyState text="Henüz karar eklenmedi." />
              ) : (
                <div className="rounded-xl border border-[#DADCE3] bg-white divide-y divide-[#EBEBEB] overflow-hidden">
                  {decisions.map((d) => (
                    <div key={d.id} className="px-5 py-4">
                      <p className="font-medium text-[#1B1D23]">{d.title}</p>
                      <p className="text-xs text-[#8A8C93] mt-0.5">İlgili: {nameForSelection(d.related)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="font-serif text-lg text-[#16233D] mb-3">Son eklenen notlar</h3>
              {notes.length === 0 ? (
                <EmptyState text="Henüz not eklenmedi." />
              ) : (
                <div className="rounded-xl border border-[#DADCE3] bg-white divide-y divide-[#EBEBEB] overflow-hidden">
                  {notes.map((n) => (
                    <div key={n.id} className="px-5 py-4">
                      <p className="font-medium text-[#1B1D23]">{n.title}</p>
                      <ul className="mt-1.5 space-y-0.5">
                        {n.bullets.map((b, i) => (
                          <li key={i} className="text-xs text-[#6B7280] flex gap-1.5">
                            <span className="text-[#2E4A7D]">•</span>{b}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-[#8A8C93] mt-1.5">Görecekler: {nameForSelection(n.visibility)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {view === "task" && <TaskWizard onCancel={() => setView("home")} onComplete={addTask} />}
        {view === "decision" && <DecisionForm onCancel={() => setView("home")} onComplete={addDecision} />}
        {view === "note" && <NoteWizard onCancel={() => setView("home")} onComplete={addNote} />}
        
        {view === "tasklist" && (
  <TaskListView 
    key="task-list-view" 
    tasks={tasks} 
    currentUser={currentUser} 
    onCancel={() => setView("home")} 
  />
)}
      </main>
    </div>
  );
}

function ActionButton({ icon: Icon, title, subtitle, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border p-5 transition-all cursor-pointer hover:shadow-md
        ${primary ? "bg-[#16233D] border-[#16233D] hover:bg-[#1F3153]" : "bg-white border-[#DADCE3] hover:border-[#2E4A7D]"}
      `}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${primary ? "bg-white/10" : "bg-[#EAF0FB]"}`}>
        <Icon size={19} className={primary ? "text-[#9FC0F2]" : "text-[#2E4A7D]"} />
      </div>
      <p className={`font-serif text-lg ${primary ? "text-white" : "text-[#16233D]"}`}>{title}</p>
      <p className={`text-xs mt-1 ${primary ? "text-[#B7C3DC]" : "text-[#8A8C93]"}`}>{subtitle}</p>
      {primary && (
        <span className="inline-flex items-center gap-1 text-xs text-[#9FC0F2] mt-3 font-medium">
          <Plus size={13} /> Yeni kayıt başlat
        </span>
      )}
    </button>
  );
}
