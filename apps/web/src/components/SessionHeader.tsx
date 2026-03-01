import React from 'react';
import { ChevronDown } from 'lucide-react';
import { EMPLOYEES } from '../lib/constants';

interface SessionHeaderProps {
  employeeId: string;
  onEmployeeChange: (employeeId: string) => void;
}

export default function SessionHeader({ employeeId, onEmployeeChange }: SessionHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-100">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white text-xs font-semibold tracking-wide">
          HR
        </div>
        <div>
          <h1 className="text-sm font-semibold text-zinc-900 tracking-tight">HR Assistant</h1>
          <p className="text-[11px] text-zinc-400 tracking-wide uppercase">Time Off Module</p>
        </div>
      </div>

      <div className="relative">
        <label htmlFor="employee-select" className="sr-only">
          Select employee
        </label>
        <select
          id="employee-select"
          value={employeeId}
          onChange={(e) => onEmployeeChange(e.target.value)}
          className="appearance-none cursor-pointer rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-3 pr-9 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 focus:border-zinc-400 focus:outline-none"
        >
          {EMPLOYEES.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} — {emp.department}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />
      </div>
    </header>
  );
}
