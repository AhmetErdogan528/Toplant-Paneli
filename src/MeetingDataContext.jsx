import React, { createContext, useContext, useState } from "react";

const MeetingDataContext = createContext(null);

export function MeetingDataProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const addTask = (task) =>
    setTasks((prev) => [{ ...task, status: "beklemede", evidence: null }, ...prev]);

  const addDecision = (decision) => setDecisions((prev) => [decision, ...prev]);
  const addNote = (note) => setNotes((prev) => [note, ...prev]);
  const addMeeting = (meeting) => setMeetings((prev) => [meeting, ...prev]);

  const updateMeeting = (id, updates) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const submitEvidence = (taskId, evidence) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, evidence, status: "onay_bekliyor" } : t))
    );

  const approveTask = (taskId) =>
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "tamamlandi" } : t)));

  const requestRevision = (taskId) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "beklemede", evidence: null } : t))
    );

  return (
    <MeetingDataContext.Provider
      value={{
        tasks,
        decisions,
        notes,
        meetings,
        updateMeeting,
        addTask,
        addDecision,
        addNote,
        addMeeting,
        submitEvidence,
        approveTask,
        requestRevision,
      }}
    >
      {children}
    </MeetingDataContext.Provider>
  );
}

export const useMeetingData = () => useContext(MeetingDataContext);