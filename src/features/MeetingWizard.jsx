import React, { useState, useMemo, useRef } from "react";
import { FileText } from "lucide-react";
import { WizardShell } from "../components/WizardComponents";
import EntitySelector from "../components/EntitySelector";
import { DEPARTMENTS, ALL_PEOPLE } from "../data/mockData";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function FileUploader({ docs, setDocs }) {
  const fileInputRef = useRef(null);

  const onFiles = (files) => {
    const arr = Array.from(files).map((f) => ({ id: uid(), name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) }));
    setDocs((prev) => [...prev, ...arr]);
  };

  const remove = (id) => {
    const doc = docs.find((d) => d.id === id);
    if (doc && doc.url) URL.revokeObjectURL(doc.url);
    setDocs((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input ref={fileInputRef} type="file" multiple onChange={(e) => onFiles(e.target.files)} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-md bg-[#2E4A7D] text-white px-3 py-2">Dosya Seç</button>
        <p className="text-sm text-[#6B7280]">Birden fazla dosya seçebilirsiniz. Dosyalar sayfayı yenilediğinizde kaybolur.</p>
      </div>

      <div className="space-y-1">
        {!docs || docs.length === 0 ? <p className="text-sm text-[#6B7280]">Henüz belge yok.</p> : (
          docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between bg-white border rounded p-2">
              <div>
                <p className="font-medium text-sm">{d.name}</p>
                <p className="text-xs text-[#6B7280]">{d.size ? `${(d.size/1024).toFixed(1)} KB` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-[#4664D9]">Göster</a>}
                <button onClick={() => remove(d.id)} className="text-sm text-[#B4463A]">Sil</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MeetingWizard({ onCancel, onSave, currentUser }) {
  const steps = [{ title: "Bilgi" }, { title: "Katılımcılar" }, { title: "Zaman & Bildirim" }, { title: "Belgeler" }, { title: "Özet" }];

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attendees, setAttendees] = useState({ departments: [], people: [] });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [mode, setMode] = useState(null); // instant | scheduled
  const [scheduledAt, setScheduledAt] = useState("");
  const [notification, setNotification] = useState("none");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [documents, setDocuments] = useState([]);
  const [saved, setSaved] = useState(false);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return title.trim().length > 0;
      case 1: return attendees.departments.length > 0 || attendees.people.length > 0;
      case 2: return mode === "instant" ? true : scheduledAt !== "";
      case 3: return true; // documents optional
      default: return true;
    }
  }, [step, title, attendees, mode, scheduledAt]);

  const goNext = () => canProceed && setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const startMode = (selectedMode) => {
    setMode(selectedMode);
    setStep(0);
  };

  const handleSave = () => {
    // Expand departments into individual people ids so department selection invites all members
    const peopleFromDepartments = (attendees.departments || []).flatMap((depId) => {
      const dep = DEPARTMENTS.find((d) => d.id === depId);
      return dep ? dep.people.map((p) => p.id) : [];
    });
    const mergedPeopleSet = new Set([...(attendees.people || []), ...peopleFromDepartments]);

    // Resolve selected roles to current holders (prefer within selected departments)
    const roleHolders = [];
    (selectedRoles || []).forEach((role) => {
      let holder = null;
      // prefer holder within selected departments
      for (const depId of (attendees.departments || [])) {
        const dep = DEPARTMENTS.find((d) => d.id === depId);
        if (!dep) continue;
        const p = dep.people.find((pp) => pp.title === role);
        if (p) {
          holder = p;
          break;
        }
      }
      // fallback to any person with the title
      if (!holder) holder = ALL_PEOPLE.find((p) => p.title === role) || null;
      if (holder) {
        roleHolders.push({ role, personId: holder.id, personName: holder.name });
        mergedPeopleSet.add(holder.id);
      } else {
        roleHolders.push({ role, personId: null, personName: null });
      }
    });

    const meeting = {
      id: uid(),
      title: title.trim(),
      description: description.trim(),
      attendees: {
        departments: attendees.departments || [],
        people: Array.from(mergedPeopleSet),
        roles: selectedRoles || [],
        roleHolders,
      },
      durationMinutes,
      documents,
      organizer: currentUser,
      scheduledAt: mode === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
      notification: notification === "none" ? null : { type: notification },
      createdAt: new Date().toISOString(),
    };
    setSaved(true);
    onSave(meeting);
    setTimeout(() => setSaved(false), 1000);
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold text-[#8A8C93] uppercase">Toplantı Oluştur</p>
        <h2 className="text-xl font-bold text-[#1B1D23]">Anlık veya İleri Zamanlı Toplantı</h2>
      </div>

      {mode === null ? (
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => startMode("instant")}
            className="rounded-3xl bg-[#4B6BE0] border border-[#3D5ECD] p-6 text-left text-white shadow-sm transition duration-200 hover:bg-[#3D5ECD]"
          >
            <p className="text-sm font-semibold">Anlık Toplantı Oluştur</p>
            <p className="mt-3 text-sm text-[#E7ECFF]">Hemen başlayacak toplantıyı seçin ve formu doldurun.</p>
          </button>
          <button
            type="button"
            onClick={() => startMode("scheduled")}
            className="rounded-3xl bg-[#4B6BE0] border border-[#3D5ECD] p-6 text-left text-white shadow-sm transition duration-200 hover:bg-[#3D5ECD]"
          >
            <p className="text-sm font-semibold">İleri Zamanlı Toplantı Oluştur</p>
            <p className="mt-3 text-sm text-[#E7ECFF]">Belirli bir tarih seçerek planlı toplantı oluşturun.</p>
          </button>
        </div>
      ) : (
        <WizardShell
          key={`meeting-wizard-step-${step}`}
          steps={steps}
          step={step}
          canProceed={canProceed}
          onBack={goBack}
          onNext={goNext}
          onSave={handleSave}
          isLastStep={step === steps.length - 1}
          saved={saved}
          saveLabel="Toplantıyı Kaydet"
        >
          <div className="mb-6 rounded-3xl bg-[#EEF3FF] p-4 text-sm text-[#1D3B8F]">
            Seçilen mod: <span className="font-semibold">{mode === 'instant' ? 'Anlık' : 'İleri Zamanlı'}</span>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B1D23] mb-1">Başlık</label>
                <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Toplantı başlığı" className="w-full rounded-md border border-[#CBCED6] px-3.5 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B1D23] mb-1">Açıklama</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-md border border-[#CBCED6] px-3.5 py-2.5" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-sm text-[#6B7280] mb-3">Toplantıya dahil olacak departman veya kişileri seçin.</p>
              <EntitySelector selection={attendees} setSelection={setAttendees} />
              <div className="mt-4">
                <p className="text-sm font-medium">Yetki ile davet et (opsiyonel)</p>
                <p className="text-xs text-[#6B7280] mb-2">Bir yetki seçerseniz, o yetkiyi taşıyan güncel kişi toplantıya eklenir.</p>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(new Set(ALL_PEOPLE.map((p) => p.title))).map((title) => (
                    <label key={title} className={`flex items-center gap-2 text-sm p-2 rounded ${selectedRoles.includes(title) ? 'bg-[#EEF3FF]' : 'hover:bg-[#F7F9FC]'}`}>
                      <input type="checkbox" checked={selectedRoles.includes(title)} onChange={(e) => {
                        if (e.target.checked) setSelectedRoles((s) => [...s, title]); else setSelectedRoles((s) => s.filter((r) => r !== title));
                      }} />
                      <span>{title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {mode === "scheduled" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Zaman</label>
                  <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="rounded-md border px-3 py-2" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Süre (dakika)</label>
                <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="rounded-md border px-3 py-2 w-32" />
              </div>

              <div>
                <p className="text-sm text-[#6B7280]">Belgeler için sonraki adımı kullanın.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bildirim Planı</label>
                <select value={notification} onChange={(e) => setNotification(e.target.value)} className="rounded-md border px-3 py-2">
                  <option value="none">Bildirim yok</option>
                  <option value="daily">Günlük</option>
                  <option value="every2">2 günde 1</option>
                  <option value="weekly">Haftalık</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium mb-2">Toplantıya eklenecek belgeler</label>
              <FileUploader docs={documents} setDocs={setDocuments} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText />
                <div>
                  <p className="font-medium">{title || '—'}</p>
                  <p className="text-sm text-[#6B7280]">{description || '—'}</p>
                </div>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-sm font-medium">Katılımcılar</p>
                <p className="text-sm text-[#6B7280] mt-1">{(attendees.departments.length + (attendees.people?.length||0)) > 0 ? `${attendees.departments.length} departman, ${attendees.people?.length||0} kişi` : '—'}</p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-sm font-medium">Zaman</p>
                <p className="text-sm text-[#6B7280] mt-1">{mode === 'instant' ? 'Anlık' : (scheduledAt ? new Date(scheduledAt).toLocaleString() : '—')}</p>
                <p className="text-sm text-[#6B7280] mt-1">Süre: {durationMinutes} dakika</p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-sm font-medium">Bildirim</p>
                <p className="text-sm text-[#6B7280] mt-1">{notification === 'none' ? 'Yok' : notification === 'every2' ? '2 günde 1' : notification}</p>
              </div>
            </div>
          )}
        </WizardShell>
      )}
    </div>
  );
}
