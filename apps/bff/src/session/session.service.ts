import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { ChatMessage } from '@hr-agent/shared-types';

interface Session {
  id: string;
  employeeId: string;
  messages: ChatMessage[];
  createdAt: number;
}

@Injectable()
export class SessionService {
  private sessions = new Map<string, Session>();

  create(employeeId: string): Session {
    const session: Session = {
      id: uuid(),
      employeeId,
      messages: [],
      createdAt: Date.now(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  addMessage(sessionId: string, message: ChatMessage): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(message);
    }
  }

  getHistory(sessionId: string, limit: number = 20): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.messages.slice(-limit);
  }
}
