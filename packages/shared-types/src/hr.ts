export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  teamId: string;
  managerId: string;
  vacationBalance: VacationBalance;
}

export interface VacationBalance {
  total: number;
  used: number;
  remaining: number;
  pending: number;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
}

export interface CompanyPolicy {
  topic: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface TeamCalendarEntry {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending';
}
