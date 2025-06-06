// Authentication debugging utilities
export class AuthDebugger {
  private static instance: AuthDebugger;
  private loginStartTime: number | null = null;
  private events: Array<{ timestamp: number; event: string; data?: unknown }> = [];

  static getInstance(): AuthDebugger {
    if (!AuthDebugger.instance) {
      AuthDebugger.instance = new AuthDebugger();
    }
    return AuthDebugger.instance;
  }

  startLoginFlow(): void {
    this.loginStartTime = Date.now();
    this.logEvent('LOGIN_FLOW_STARTED');
    console.log('🚀 [AUTH_DEBUG] Login flow timing started');
  }

  endLoginFlow(): void {
    if (this.loginStartTime) {
      const duration = Date.now() - this.loginStartTime;
      this.logEvent('LOGIN_FLOW_COMPLETED', { duration });
      console.log(`🏁 [AUTH_DEBUG] Login flow completed in ${duration}ms`);
      this.loginStartTime = null;
    }
  }

  logEvent(event: string, data?: unknown): void {
    const timestamp = Date.now();
    this.events.push({ timestamp, event, data });
    console.log(`📝 [AUTH_DEBUG] ${event}`, data || '');
  }

  getEvents(): Array<{ timestamp: number; event: string; data?: unknown }> {
    return [...this.events];
  }

  getLoginDuration(): number | null {
    if (!this.loginStartTime) return null;
    return Date.now() - this.loginStartTime;
  }

  dumpDebugInfo(): void {
    console.group('🔍 [AUTH_DEBUG] Debug Information');
    console.log('Events:', this.events);
    console.log('Current login duration:', this.getLoginDuration());
    console.groupEnd();
  }

  reset(): void {
    this.loginStartTime = null;
    this.events = [];
    console.log('🧹 [AUTH_DEBUG] Debug state reset');
  }
}

// Export singleton instance
export const authDebugger = AuthDebugger.getInstance(); 