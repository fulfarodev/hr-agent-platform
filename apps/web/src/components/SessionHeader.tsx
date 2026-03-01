import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { EMPLOYEES } from '../lib/constants';

interface SessionHeaderProps {
  employeeId: string;
  onEmployeeChange: (employeeId: string) => void;
}

export default function SessionHeader({ employeeId, onEmployeeChange }: SessionHeaderProps) {
  const selected = EMPLOYEES.find((e) => e.id === employeeId) ?? EMPLOYEES[0];

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white">
          <Building2 size={18} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">HR Assistant</h1>
          <p className="text-xs text-slate-500">Powered by AI</p>
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
          className="appearance-none cursor-pointer rounded-lg border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm font-medium text-slate-700 transition hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {EMPLOYEES.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} -- {emp.department}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </header>
  );
}
