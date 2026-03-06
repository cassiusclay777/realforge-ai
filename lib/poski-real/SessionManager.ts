/**
 * Session Manager for PoskiREAL API
 * Handles dynamic session_id updates according to PoskiREAL protocol
 */

import { XmlRpcClient } from './XmlRpcClient';
import { PoskiCredentials, PoskiSession, PoskiResponse, PoskiHashResponse, PoskiLoginResponse } from './types';

export class SessionManager {
  private client: XmlRpcClient;
  private credentials: PoskiCredentials;
  private currentSession: PoskiSession | null = null;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor(endpoint: string, credentials: PoskiCredentials) {
    this.client = new XmlRpcClient(endpoint);
    this.credentials = credentials;
  }

  /**
   * Get or create a valid session
   */
  async getSession(): Promise<string> {
    // Check if we have a valid session
    if (this.currentSession && this.isSessionValid()) {
      return this.currentSession.sessionId;
    }

    // Create new session
    await this.createSession();
    
    if (!this.currentSession) {
      throw new Error('Failed to create session');
    }
    
    return this.currentSession.sessionId;
  }

  /**
   * Create a new session with PoskiREAL API
   */
  private async createSession(): Promise<void> {
    try {
      console.log('🔐 Creating new PoskiREAL session...');
      
      // Step 1: Get initial session ID via getHash
      const hashResponse = await this.client.call('getHash', [this.credentials.clientId]);
      
      if (!hashResponse.success || !hashResponse.data) {
        throw new Error(`getHash failed: ${hashResponse.faultString || 'Unknown error'}`);
      }

      const hashData = hashResponse.data as PoskiHashResponse;
      let sessionId = hashData.session_id;
      
      if (!sessionId) {
        throw new Error('No session_id returned from getHash');
      }

      console.log(`✅ Initial session_id: ${sessionId.substring(0, 20)}...`);

      // Step 2: Update session_id with MD5 hash
      sessionId = this.updateSessionId(sessionId);
      console.log(`✅ Updated session_id: ${sessionId.substring(0, 20)}...`);

      // Step 3: Login with updated session_id
      const loginResponse = await this.client.call('login', [sessionId]);
      
      if (!loginResponse.success || !loginResponse.data) {
        throw new Error(`Login failed: ${loginResponse.faultString || 'Unknown error'}`);
      }

      const loginData = loginResponse.data as PoskiLoginResponse;
      
      if (!loginData.success) {
        throw new Error('Login returned success=false');
      }

      console.log(`✅ Login successful for user: ${loginData.user_name || 'Unknown'}`);

      // Store the session
      this.currentSession = {
        sessionId,
        lastUpdated: new Date()
      };

    } catch (error: any) {
      console.error('❌ Failed to create PoskiREAL session:', error);
      this.currentSession = null;
      throw error;
    }
  }

  /**
   * Update session_id according to PoskiREAL protocol
   * var_part = md5(session_id + password + software_key)
   * session_id = session_id[0:48] + var_part
   */
  private updateSessionId(sessionId: string): string {
    const varPart = XmlRpcClient.md5(sessionId + this.credentials.passwordMd5 + this.credentials.softwareKey);
    
    if (sessionId.length >= 48) {
      return sessionId.substring(0, 48) + varPart;
    } else {
      // If session_id is shorter than 48 chars, pad it
      const paddedSessionId = sessionId.padEnd(48, '0');
      return paddedSessionId.substring(0, 48) + varPart;
    }
  }

  /**
   * Update session_id before each API call
   */
  async updateSessionForCall(): Promise<string> {
    if (!this.currentSession) {
      return await this.getSession();
    }

    // Update session_id according to protocol
    const newSessionId = this.updateSessionId(this.currentSession.sessionId);
    
    this.currentSession = {
      sessionId: newSessionId,
      lastUpdated: new Date()
    };

    return newSessionId;
  }

  /**
   * Check if current session is still valid
   */
  private isSessionValid(): boolean {
    if (!this.currentSession) return false;
    
    const now = new Date();
    const age = now.getTime() - this.currentSession.lastUpdated.getTime();
    
    return age < this.sessionTimeout;
  }

  /**
   * Logout from current session
   */
  async logout(): Promise<boolean> {
    if (!this.currentSession) return true;

    try {
      const sessionId = await this.updateSessionForCall();
      const response = await this.client.call('logout', [sessionId]);
      
      if (response.success) {
        console.log('✅ Logged out from PoskiREAL');
      } else {
        console.warn('⚠️ Logout failed, but continuing:', response.faultString);
      }
      
      this.currentSession = null;
      return true;
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      this.currentSession = null;
      return false;
    }
  }

  /**
   * Force refresh session
   */
  async refreshSession(): Promise<void> {
    console.log('🔄 Refreshing PoskiREAL session...');
    this.currentSession = null;
    await this.getSession();
  }

  /**
   * Get current session info (for debugging)
   */
  getSessionInfo(): { hasSession: boolean; age: number | null } {
    if (!this.currentSession) {
      return { hasSession: false, age: null };
    }
    
    const now = new Date();
    const age = now.getTime() - this.currentSession.lastUpdated.getTime();
    
    return {
      hasSession: true,
      age
    };
  }
}