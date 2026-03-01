import ky from 'ky';
import type { SessionInfo } from '@hr-agent/shared-types';

export class HRAgentClient {
  private http: typeof ky;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.http = ky.create({ prefixUrl: baseUrl });
  }

  async healthCheck(): Promise<{ status: string; ollama: boolean; mcp: boolean }> {
    return this.http.get('health').json();
  }

  async getSessions(): Promise<SessionInfo[]> {
    return this.http.get('sessions').json();
  }
}
