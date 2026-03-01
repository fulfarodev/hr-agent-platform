import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const [employeeId, setEmployeeId] = useState('EMP001');

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ChatWindow employeeId={employeeId} onEmployeeChange={setEmployeeId} />
    </div>
  );
}
