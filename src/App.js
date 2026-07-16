import React from 'react';
import MeetingPanel from './MeetingPanel';
import { MeetingDataProvider } from './MeetingDataContext';
import MeetingManager from './features/MeetingManager';

function App() {
  return (
    <div className="App">
      <MeetingDataProvider>
        <MeetingManager />
      </MeetingDataProvider>
    </div>
  );
}

export default App;