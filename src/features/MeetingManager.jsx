import React, { useState } from "react";
import { Check, Plus, Calendar, Users } from "lucide-react";
import { useMeetingData } from "../MeetingDataContext";
import { DEPARTMENTS, ALL_PEOPLE } from "../data/mockData";
import MeetingPanel from "../MeetingPanel";
import MeetingWizard from "./MeetingWizard";

function MeetingsList({ meetings, currentUser, activeTab = 'upcoming', onAddDocument }) {
  const now = new Date();

  const getAttendeeIds = (m) => {
    const ids = new Set([...(m.attendees?.people || [])]);
    // include department members if departments are present
    (m.attendees?.departments || []).forEach((depId) => {
      const dep = DEPARTMENTS.find((d) => d.id === depId);
      if (dep) dep.people.forEach((p) => ids.add(p.id));
    });
    return Array.from(ids);
  };

  const meetingState = (m) => {
    const start = new Date(m.scheduledAt);
    const duration = (m.durationMinutes || 60) * 60000;
    const end = new Date(start.getTime() + duration);
    if (now >= start && now < end) return 'active';
    if (start > now) return 'upcoming';
    return 'past';
  };

  const myMeetings = meetings.filter((m) => {
    const attendeeIds = getAttendeeIds(m);
    return m.organizer === currentUser || attendeeIds.includes(currentUser);
  });

  const upcoming = myMeetings.filter((m) => meetingState(m) === 'upcoming');
  const active = myMeetings.filter((m) => meetingState(m) === 'active');
  const past = myMeetings.filter((m) => meetingState(m) === 'past');
  const sectionTitle = activeTab === 'past' ? 'Geçmiş Toplantılar' : 'Gelecek Toplantılar';
  const emptyText = activeTab === 'past' ? 'Geçmiş toplantı yok.' : 'Gelecek toplantı yok.';

  const notifLabel = (n) => {
    if (!n || !n.type) return null;
    switch (n.type) {
      case 'daily': return 'Günlük bildirim gönder';
      case 'every2': return '2 günde 1 bildirim gönder';
      case 'weekly': return 'Haftalık bildirim ';
      default: return null;
    }
  };

  const [expandedId, setExpandedId] = React.useState(null);

  const formatAttendees = (meeting) => {
    const departments = (meeting.attendees?.departments || []).map((id) => {
      const dep = DEPARTMENTS.find((x) => x.id === id);
      return dep?.name;
    }).filter(Boolean);

    const people = (meeting.attendees?.people || []).map((id) => {
      for (const dep of DEPARTMENTS) {
        const person = dep.people.find((x) => x.id === id);
        if (person) return person.name;
      }
      return null;
    }).filter(Boolean);

    // if departments are selected but people array was not expanded, include department members' names
    (meeting.attendees?.departments || []).forEach((depId) => {
      const dep = DEPARTMENTS.find((d) => d.id === depId);
      if (dep) dep.people.forEach((p) => {
        if (!people.includes(p.name)) people.push(p.name);
      });
    });
      const roles = [];
      const rolesList = meeting.attendees?.roles || [];
      const roleHolders = meeting.attendees?.roleHolders || [];
      rolesList.forEach((role) => {
        const rh = (roleHolders || []).find((r) => r.role === role);
        let holderName = rh?.personName || null;
        if (!holderName) {
          // fallback to search by title
          const p = ALL_PEOPLE.find((x) => x.title === role);
          holderName = p ? p.name : null;
        }
        roles.push(holderName ? `${role} (${holderName})` : role);
      });

      return { departments, people, roles };
  };

  const canAddDocsTo = (meeting) => {
    if (!meeting) return false;
    const now = new Date();
    return new Date(meeting.scheduledAt) >= now;
  };

  // For upcoming tab show both active + upcoming
  const selectedMeetings = activeTab === 'past' ? past : [...active, ...upcoming];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg mb-2">{sectionTitle}</h3>
        {selectedMeetings.length === 0 ? <p className="text-sm text-[#6B7280]">{emptyText}</p> : (
          <div className="rounded-xl border bg-white p-4">
            {selectedMeetings.map((m) => (
              <div key={m.id} className="py-3 border-b last:border-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-[#6B7280]">{m.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-[#6B7280]">{new Date(m.scheduledAt).toLocaleString()}</div>
                    {notifLabel(m.notification) && (
                      <div className={`mt-1 text-[11px] px-2 py-1 rounded-full ${activeTab === 'past' ? 'bg-[#F3F7FF] text-[#2E4A7D]' : 'bg-[#FFF4E6] text-[#A9761C]'}`}>
                        Bildirim: {notifLabel(m.notification)}
                      </div>
                    )}
                    <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)} className="text-sm text-[#4664D9] hover:underline">Detayları Gör</button>
                  </div>
                </div>

                {expandedId === m.id && (
                  <div className="mt-3 rounded-md bg-[#F7F9FC] p-3">
                    <p className="text-sm text-[#6B7280] mb-2">{m.description}</p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0]">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Saat</p>
                        <p className="mt-2 text-sm text-[#1F3153]">{new Date(m.scheduledAt).toLocaleString()}</p>
                        <p className="mt-1 text-xs text-[#6B7280]">Süre: {m.durationMinutes ? `${m.durationMinutes} dakika` : 'Belirtilmemiş'}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0]">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Katılımcılar</p>
                        <div className="mt-2 text-sm text-[#1F3153]">
                          {(() => {
                            const fa = formatAttendees(m);
                            const people = fa.people || [];
                            const roles = fa.roles || [];
                            return (
                              <div>
                                <div>{people.length > 0 ? people.join(', ') : 'Belirtilmemiş'}</div>
                                {roles.length > 0 && <div className="mt-1 text-xs text-[#6B7280]">Yetkiler: {roles.join(', ')}</div>}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0] md:col-span-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Belgeler</p>
                        <div className="mt-2">
                          {(m.documents || []).length === 0 ? (
                            <p className="text-sm text-[#6B7280]">Henüz belge yok.</p>
                          ) : (
                            <ul className="space-y-2">
                              {(m.documents || []).map((d) => (
                                <li key={d.id} className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{d.name || d.title}</p>
                                    <p className="text-xs text-[#6B7280]">{d.size ? `${(d.size/1024).toFixed(1)} KB` : ''}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-[#4664D9]">Göster</a>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}

                          {canAddDocsTo(m) && (
                            <div className="mt-3 border-t pt-3">
                              <label className="text-xs text-[#6B7280]">Dosya yükle</label>
                              <input type="file" onChange={(e) => { if (e.target.files?.[0]) onAddDocument(m, e.target.files[0]); e.target.value = null; }} className="w-full mt-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MeetingManager() {
  const { meetings, addMeeting, updateMeeting } = useMeetingData();
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const [view, setView] = useState("manager"); // manager | create | list | panel
  const [listTab, setListTab] = useState("upcoming"); // upcoming | past
  const [currentUser, setCurrentUser] = useState(ALL_PEOPLE[0].id);
  const [flash, setFlash] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const showAside = view === "manager";

  const handleSave = (meeting) => {
    addMeeting(meeting);
    setFlash(`"${meeting.title}" toplantısı kaydedildi.`);
    setSelectedMeeting(meeting);
    setView("list");
    setTimeout(() => setFlash(null), 3500);
  };

  const upcomingMeetings = meetings.filter((m) => new Date(m.scheduledAt) >= new Date());
  // compute active meetings (ongoing between start and start+duration)
  const meetingState = (m) => {
    const start = new Date(m.scheduledAt);
    const duration = (m.durationMinutes || 60) * 60000;
    const end = new Date(start.getTime() + duration);
    const now = new Date();
    if (now >= start && now < end) return 'active';
    if (start > now) return 'upcoming';
    return 'past';
  };

  const activeMeetings = meetings.filter((m) => meetingState(m) === 'active');

  const detailMeeting = selectedMeeting || (activeMeetings.length > 0 ? activeMeetings[0] : (upcomingMeetings.length > 0 ? upcomingMeetings[0] : null));
  const selected = detailMeeting || selectedMeeting;

  const getNotificationLabel = (notification) => {
    if (!notification || !notification.type) return "Bildirim yok";
    switch (notification.type) {
      case "daily": return "Günlük";
      case "every2": return "2 günde 1";
      case "weekly": return "Haftalık";
      default: return "Bildirim yok";
    }
  };

  const formatAttendees = (meeting) => {
    const departments = (meeting.attendees?.departments || []).map((id) => {
      const dep = DEPARTMENTS.find((x) => x.id === id);
      return dep?.name;
    }).filter(Boolean);

    const people = (meeting.attendees?.people || []).map((id) => {
      for (const dep of DEPARTMENTS) {
        const person = dep.people.find((x) => x.id === id);
        if (person) return person.name;
      }
      // fallback to ALL_PEOPLE
      const p = ALL_PEOPLE.find((x) => x.id === id);
      return p ? p.name : null;
    }).filter(Boolean);

    // resolve roles dynamically to current holders (prefer selected departments)
    const roles = [];
    const rolesList = meeting.attendees?.roles || [];
    rolesList.forEach((role) => {
      let holder = null;
      for (const depId of (meeting.attendees?.departments || [])) {
        const dep = DEPARTMENTS.find((d) => d.id === depId);
        if (!dep) continue;
        const p = dep.people.find((pp) => pp.title === role);
        if (p) { holder = p; break; }
      }
      if (!holder) holder = ALL_PEOPLE.find((p) => p.title === role) || null;
      roles.push(holder ? `${role} (${holder.name})` : role);
    });

    return { departments, people, roles };
  };

  const canAddDocsTo = (meeting) => {
    if (!meeting) return false;
    const now = new Date();
    return new Date(meeting.scheduledAt) >= now;
  };

  const handleJoinMeeting = (meeting) => {
    if (!meeting) return;
    // mark user as joined (add to meeting.joined)
    const joined = Array.from(new Set([...(meeting.joined || []), currentUser]));
    updateMeeting(meeting.id, { joined });
    setSelectedMeeting({ ...meeting, joined });
    setFlash(`Toplantıya katıldınız: "${meeting.title}"`);
    setView('panel');
    setTimeout(() => setFlash(null), 3000);
  };

  const handleAddDocument = (meeting, fileOrTitle, maybeUrl) => {
    if (!meeting) return;
    let doc = null;
    // File upload
    if (fileOrTitle && typeof fileOrTitle === 'object' && fileOrTitle instanceof File) {
      const f = fileOrTitle;
      doc = { id: uid(), name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) };
    } else if (typeof fileOrTitle === 'string' && fileOrTitle.trim()) {
      doc = { id: uid(), title: fileOrTitle.trim(), url: (maybeUrl || "").trim() };
    }
    if (!doc) return;
    const updated = { ...(meeting || {}), documents: [...(meeting.documents || []), doc] };
    updateMeeting(meeting.id, { documents: updated.documents });
    setSelectedMeeting(updated);
  };

  return (
    <div className="min-h-screen bg-[#EEF0F4]">
      <header className="bg-[#0F1B32]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <button onClick={() => { setView('manager'); setSidebarOpen(true); }} className="text-left p-0 m-0 inline-block text-white focus:outline-none">
              <p className="text-xs tracking-[0.2em] uppercase text-[#7C93C4]">Toplantı Yönetimi</p>
              <h1 className="font-serif text-2xl mt-0.5">Toplantı Oluştur & Yönet</h1>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-[#9FADC7]">
              Ben:
              <select value={currentUser} onChange={(e)=>setCurrentUser(e.target.value)} className="bg-[#16233D] text-white text-xs rounded-md border px-2 py-1.5">
                {ALL_PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name} — {p.departmentName}</option>)}
              </select>
            </label>
            <button onClick={() => { setView('manager'); setSidebarOpen(true); }} className="text-sm text-[#B7C3DC] hover:text-white flex items-center gap-2">
              Menü
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {flash && (
          <div className="mb-6 rounded-md border border-[#B9CBEA] bg-[#EAF0FB] text-[#1F3153] px-4 py-3 text-sm flex items-center gap-2">
            <Check size={16} /> {flash}
          </div>
        )}

        <div className={`grid gap-6 ${showAside ? 'xl:grid-cols-[240px_1fr_320px]' : 'xl:grid-cols-[240px_1fr]'}`}>
          {/* Sidebar (always visible at left) */}
            <aside className={`transition-all duration-200 ${sidebarOpen ? 'w-full' : 'w-16'} bg-white rounded-xl border border-[#E6E9F0] p-4 h-fit`}>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setView('create'); setSidebarOpen(true); }} className={`flex items-center gap-3 w-full text-left p-3 rounded-xl ${view==='create' ? 'bg-[#EEF3FF]' : 'hover:bg-[#F7F9FC]'}`}>
                  <Plus size={18} className="text-[#2E4A7D]" /> {sidebarOpen && <span className="text-sm">Toplantı Oluştur</span>}
                </button>

                <button onClick={() => { setView('list'); setSidebarOpen(true); }} className={`flex items-center gap-3 w-full text-left p-3 rounded-xl ${view==='list' ? 'bg-[#EEF3FF]' : 'hover:bg-[#F7F9FC]'}`}>
                  <Calendar size={18} className="text-[#2E4A7D]" /> {sidebarOpen && <span className="text-sm">Toplantılarım</span>}
                </button>

                <button onClick={() => { setView('panel'); setSidebarOpen(true); }} className={`flex items-center gap-3 w-full text-left p-3 rounded-xl ${view==='panel' ? 'bg-[#EEF3FF]' : 'hover:bg-[#F7F9FC]'}`}>
                  <Users size={18} className="text-[#2E4A7D]" /> {sidebarOpen && <span className="text-sm">Paneli Aç</span>}
                </button>
              </div>
            </aside>

          {/* Main content */}
          <section className="space-y-6">
            {view !== 'panel' && (
              <div className="rounded-xl border border-[#DADCE3] bg-white p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">Merhaba, {ALL_PEOPLE.find((p) => p.id === currentUser)?.name}</p>
                    <h2 className="font-serif text-2xl">Toplantı yönetimi sayfasına hoş geldiniz</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button onClick={() => setView('create')} className="rounded-xl bg-[#EAF0FB] px-4 py-3 text-sm text-[#1F3153] font-medium hover:bg-[#D8E2F5]">Yeni Toplantı Oluştur</button>
                    <button onClick={() => setView('list')} className="rounded-xl border border-[#DADCE3] bg-white px-4 py-3 text-sm text-[#2E4A7D] font-medium hover:bg-[#F7F9FC]">Toplantılarımı Gör</button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#DADCE3] bg-white p-6">
              {view === 'create' && (
                <MeetingWizard onSave={handleSave} currentUser={currentUser} onCancel={() => setView('list')} />
              )}

              {view === 'list' && (
                <div>
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <h3 className="font-serif text-xl">Toplantılarım</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setListTab('upcoming')}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${listTab === 'upcoming' ? 'bg-[#4B6BE0] text-white' : 'bg-[#F7F9FC] text-[#1F3153] hover:bg-[#EEF3FF]'}`}
                      >
                        Gelecek Toplantılar
                      </button>
                      <button
                        onClick={() => setListTab('past')}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${listTab === 'past' ? 'bg-[#4B6BE0] text-white' : 'bg-[#F7F9FC] text-[#1F3153] hover:bg-[#EEF3FF]'}`}
                      >
                        Geçmiş Toplantılar
                      </button>
                    </div>
                  </div>
                  <MeetingsList meetings={meetings} currentUser={currentUser} activeTab={listTab} onAddDocument={handleAddDocument} />
                </div>
              )}

              {view === 'panel' && (
                <div>
                  <MeetingPanel />
                </div>
              )}

              {view === 'manager' && (
                <div className="space-y-4">
                  <div className="rounded-3xl bg-[#F7F9FC] p-6">
                    <h3 className="font-serif text-xl mb-2">Hızlı Başlangıç</h3>
                    <p className="text-sm text-[#6B7280]">Hemen yeni bir toplantı oluşturabilir veya kayıtlı toplantılarınızı yönetebilirsiniz.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl bg-[#EEF3FF] p-5">
                      <p className="text-sm uppercase tracking-[0.18em] text-[#7C93C4]">En son toplantı</p>
                      <p className="mt-3 font-medium text-[#1F3153]">{meetings.length ? meetings[meetings.length-1].title : 'Henüz toplantı yok'}</p>
                      <p className="mt-2 text-sm text-[#6B7280]">{meetings.length ? meetings[meetings.length-1].description : 'Yeni toplantılar eklemek için Oluştur düğmesini kullanın.'}</p>
                    </div>
                        <div className="rounded-3xl bg-[#FFF7ED] p-5">
                          <p className="text-sm uppercase tracking-[0.18em] text-[#A9761C]">Toplantı modu</p>
                          <p className="mt-3 font-medium text-[#5A4A1F]">{view === 'create' ? 'Oluşturma modunda' : 'Liste / Panel modu'}</p>
                          <p className="mt-2 text-sm text-[#6B7280]">{meetings.length ? `${meetings.length} toplantı kaydedildi.` : 'Toplantılarınızı takip edin.'}</p>
                        </div>
                        <div className="rounded-3xl bg-white p-5 border">
                          <p className="text-sm uppercase tracking-[0.18em] text-[#B4463A]">Aktif Toplantılar</p>
                          {activeMeetings.length === 0 ? (
                            <p className="mt-3 text-sm text-[#6B7280]">Şu anda aktif toplantı yok.</p>
                          ) : (
                            <div className="mt-3 space-y-3">
                              {activeMeetings.map((m) => (
                                <div key={m.id} className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                    <div>
                                      <p className="font-medium text-sm">{m.title}</p>
                                      <p className="text-xs text-[#6B7280]">{new Date(m.scheduledAt).toLocaleString()} • {m.durationMinutes || 60} dk</p>
                                    </div>
                                  </div>
                                  <div>
                                    <button onClick={() => handleJoinMeeting(m)} className="rounded-md bg-[#D23A3A] text-white px-3 py-2 text-sm">Toplantıya Katıl</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {showAside && (
            <aside className="rounded-xl border border-[#DADCE3] bg-white p-6 h-fit">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm text-[#6B7280]">Gelecek Toplantılar</p>
                  <h3 className="font-serif text-xl">Detaylı Gösterim</h3>
                </div>
                <span className="rounded-full bg-[#EEF3FF] px-3 py-1 text-xs text-[#2E4A7D]">{upcomingMeetings.length} adet</span>
              </div>

              {upcomingMeetings.length === 0 ? (
                <p className="text-sm text-[#6B7280]">Yakın zamanda planlanmış toplantı yok.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.slice(0, 3).map((meeting) => (
                    <button key={meeting.id} onClick={() => setSelectedMeeting(meeting)} className={`w-full rounded-3xl border ${selectedMeeting?.id === meeting.id ? 'border-[#4664D9] bg-[#EEF3FF]' : 'border-[#E6E9F0] bg-white'} p-4 text-left hover:border-[#4664D9]`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-[#1F3153]">{meeting.title}</p>
                          <p className="mt-1 text-xs text-[#6B7280]">{new Date(meeting.scheduledAt).toLocaleString()}</p>
                        </div>
                        <span className="rounded-full bg-[#F0F4FF] px-2 py-1 text-[11px] text-[#2E4A7D]">{getNotificationLabel(meeting.notification)}</span>
                      </div>
                    </button>
                  ))}

                  {selected && (
                    <div className="rounded-3xl border border-[#E6E9F0] bg-[#F7F9FC] p-4">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-[#6B7280]">Seçili toplantı</p>
                          <p className="font-medium text-[#1F3153]">{selected.title}</p>
                        </div>
                        <button onClick={() => setSelectedMeeting(null)} className="text-xs text-[#4664D9] hover:underline">Kapat</button>
                      </div>
                      <p className="text-sm text-[#6B7280]">{selected.description}</p>
                      <div className="mt-4 grid gap-3">
                        <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0]">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Saat</p>
                          <p className="mt-2 text-sm text-[#1F3153]">{new Date(selected.scheduledAt).toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0]">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Katılımcılar</p>
                          <div className="mt-2 text-sm text-[#1F3153]">
                            {(() => {
                              const fa = formatAttendees(selected);
                              const people = fa.people || [];
                              const roles = fa.roles || [];
                              return (
                                <div>
                                  <div>{people.length > 0 ? people.join(', ') : 'Belirtilmemiş'}</div>
                                  {roles.length > 0 && <div className="mt-1 text-xs text-[#6B7280]">Yetkiler: {roles.join(', ')}</div>}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0]">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Departmanlar</p>
                          <p className="mt-2 text-sm text-[#1F3153]">{formatAttendees(selected).departments.join(', ') || 'Belirtilmemiş'}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0]">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Bildirim</p>
                          <p className="mt-2 text-sm text-[#1F3153]">{getNotificationLabel(selected.notification)}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0]">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Süre</p>
                          <p className="mt-2 text-sm text-[#1F3153]">{selected.durationMinutes ? `${selected.durationMinutes} dakika` : 'Belirtilmemiş'}</p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 border border-[#E6E9F0]">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C93C4]">Belgeler</p>
                          <div className="mt-2">
                            {(selected.documents || []).length === 0 ? (
                              <p className="text-sm text-[#6B7280]">Henüz belge yok.</p>
                            ) : (
                              <ul className="space-y-2">
                                {(selected.documents || []).map((d) => (
                                  <li key={d.id} className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm">{d.name || d.title}</p>
                                      {d.size && <p className="text-xs text-[#6B7280]">{(d.size/1024).toFixed(1)} KB</p>}
                                      {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-[#4664D9]">Göster</a>}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {canAddDocsTo(selected) && (
                              <div className="mt-3 border-t pt-3">
                                <label className="text-xs text-[#6B7280]">Dosya yükle</label>
                                <input type="file" onChange={(e) => { if (e.target.files?.[0]) handleAddDocument(selected, e.target.files[0]); e.target.value = null; }} className="w-full mt-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </aside>          )}        </div>
      </main>
    </div>
  );
}
