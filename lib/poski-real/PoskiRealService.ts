import { XmlRpcClient } from './XmlRpcClient';
import { SessionManager } from './SessionManager';
import { PoskiDataMapper } from './DataMapper';
import {
  PoskiCredentials,
  PoskiAdvertData,
  PoskiPhotoData,
  PoskiSellerData,
  PoskiResponse,
  PoskiAdvertListResponse,
  RealForgeListing,
  PoskiErrorCode
} from './types';

/**
 * PoskiREAL Service - hlavní service vrstva pro komunikaci s PoskiREAL API
 */
export class PoskiRealService {
  private xmlRpcClient: XmlRpcClient;
  private sessionManager: SessionManager;
  private credentials: PoskiCredentials;
  private baseUrl: string;
  
  constructor(credentials: PoskiCredentials, baseUrl: string = 'https://export-test.poskireal.cz/import/v1/') {
    this.credentials = credentials;
    this.baseUrl = baseUrl;
    this.xmlRpcClient = new XmlRpcClient(baseUrl);
    this.sessionManager = new SessionManager(baseUrl, credentials);
  }
  
  /**
   * Autentizace uživatele a získání session
   */
  async authenticate(): Promise<PoskiResponse<{ session_id: string }>> {
    try {
      const sessionId = await this.sessionManager.getSession();
      
      const response = await this.xmlRpcClient.call('login', [
        this.credentials.clientId,
        this.credentials.passwordMd5,
        this.credentials.softwareKey,
        sessionId
      ]);
      
      if (response.success && response.data?.user_id) {
        // Update session with new session_id from response if provided
        // Note: SessionManager doesn't have updateSession method, we'll just use the current session
        
        return {
          success: true,
          code: PoskiErrorCode.OK,
          message: 'Authentication successful',
          data: { session_id: sessionId }
        };
      }
      
      return {
        success: false,
        code: PoskiErrorCode.BAD_LOGIN,
        message: response.faultString || 'Authentication failed',
        errors: [response.faultString || 'Unknown error']
      };
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `Authentication error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Synchronizace inzerátu (vytvoření nebo aktualizace)
   */
  async syncAdvert(advertData: PoskiAdvertData, photos: PoskiPhotoData[] = []): Promise<PoskiResponse<{ advert_id: number; advert_rkid: string }>> {
    try {
      const sessionId = await this.sessionManager.getSession();
      
      // Prepare advert data with session
      const advertWithSession = {
        ...advertData,
        session_id: sessionId
      };
      
      // Call advert.sync method
      const response = await this.xmlRpcClient.call('advert.sync', [advertWithSession]);
      
      if (response.success && response.data?.advert_id) {
        const advertId = response.data.advert_id;
        const advertRkid = response.data.advert_rkid || advertData.advert_rkid;
        
        // Upload photos if provided
        if (photos.length > 0) {
          await this.uploadPhotos(advertId, photos);
        }
        
        return {
          success: true,
          code: PoskiErrorCode.OK,
          message: 'Advert synchronized successfully',
          data: {
            advert_id: advertId,
            advert_rkid: advertRkid
          }
        };
      }
      
      return {
        success: false,
        code: PoskiErrorCode.INVALID_PARAMS,
        message: response.faultString || 'Advert synchronization failed',
        errors: [response.faultString || 'Unknown error']
      };
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `Advert sync error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Nahrání fotek k inzerátu
   */
  async uploadPhotos(advertId: number, photos: PoskiPhotoData[]): Promise<PoskiResponse> {
    try {
      const sessionId = await this.sessionManager.getSession();
      
      const response = await this.xmlRpcClient.call('photo.upload', [
        advertId,
        photos,
        sessionId
      ]);
      
      return {
        success: response.success,
        code: response.success ? PoskiErrorCode.OK : PoskiErrorCode.INVALID_PARAMS,
        message: response.faultString || (response.success ? 'Photos uploaded successfully' : 'Photo upload failed'),
        data: response.data,
        errors: response.faultString ? [response.faultString] : []
      };
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `Photo upload error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Smazání inzerátu
   */
  async deleteAdvert(advertId: number): Promise<PoskiResponse> {
    try {
      const sessionId = await this.sessionManager.getSession();
      
      const response = await this.xmlRpcClient.call('advert.delete', [
        advertId,
        sessionId
      ]);
      
      return {
        success: response.success,
        code: response.success ? PoskiErrorCode.OK : PoskiErrorCode.INVALID_PARAMS,
        message: response.faultString || (response.success ? 'Advert deleted successfully' : 'Advert deletion failed'),
        data: response.data,
        errors: response.faultString ? [response.faultString] : []
      };
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `Advert deletion error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Získání seznamu inzerátů
   */
  async listAdverts(limit: number = 100, offset: number = 0): Promise<PoskiResponse<PoskiAdvertListResponse>> {
    try {
      const sessionId = await this.sessionManager.getSession();
      
      const response = await this.xmlRpcClient.call('advert.list', [
        sessionId,
        limit,
        offset
      ]);
      
      return {
        success: response.success,
        code: response.success ? PoskiErrorCode.OK : PoskiErrorCode.INVALID_PARAMS,
        message: response.faultString || (response.success ? 'Adverts retrieved successfully' : 'Failed to retrieve adverts'),
        data: response.data,
        errors: response.faultString ? [response.faultString] : []
      };
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `List adverts error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Vytvoření nebo aktualizace prodejce
   */
  async syncSeller(sellerData: PoskiSellerData): Promise<PoskiResponse<{ seller_id: number }>> {
    try {
      const sessionId = await this.sessionManager.getSession();
      
      const response = await this.xmlRpcClient.call('seller.sync', [
        sellerData,
        sessionId
      ]);
      
      return {
        success: response.success,
        code: response.success ? PoskiErrorCode.OK : PoskiErrorCode.INVALID_PARAMS,
        message: response.faultString || (response.success ? 'Seller synchronized successfully' : 'Seller synchronization failed'),
        data: response.data,
        errors: response.faultString ? [response.faultString] : []
      };
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `Seller sync error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Helper metoda pro synchronizaci REALFORGE listingu (s reálným načtením fotek)
   */
  async syncRealForgeListing(listing: RealForgeListing, sellerId: number): Promise<PoskiResponse<{ advert_id: number; advert_rkid: string }>> {
    try {
      const advertData = PoskiDataMapper.mapListingToAdvert(listing, sellerId);
      let baseUrl = '';
      if (process.env?.NEXTAUTH_URL) {
        baseUrl = process.env.NEXTAUTH_URL;
      } else if (process.env?.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env?.NEXT_PUBLIC_APP_URL) {
        baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      } else {
        console.warn('[PoskiRealService] NEXTAUTH_URL not set - using localhost fallback for image URLs. Set NEXTAUTH_URL in production!');
        baseUrl = 'http://localhost:3050';
      }
      const photos = await PoskiDataMapper.mapMediaToPhotosAsync(listing.media, baseUrl);

      return await this.syncAdvert(advertData, photos);
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `RealForge listing sync error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Test připojení k API
   */
  async testConnection(): Promise<PoskiResponse> {
    try {
      const authResult = await this.authenticate();
      
      if (authResult.success) {
        return {
          success: true,
          code: PoskiErrorCode.OK,
          message: 'Connection test successful - authenticated with PoskiREAL API',
          data: authResult.data
        };
      }
      
      return authResult;
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `Connection test failed: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Získání informací o API
   */
  async getApiInfo(): Promise<PoskiResponse> {
    try {
      const sessionId = await this.sessionManager.getSession();
      
      const response = await this.xmlRpcClient.call('system.info', [sessionId]);
      
      return {
        success: response.success,
        code: response.success ? PoskiErrorCode.OK : PoskiErrorCode.INVALID_PARAMS,
        message: response.faultString || (response.success ? 'API info retrieved' : 'Failed to get API info'),
        data: response.data,
        errors: response.faultString ? [response.faultString] : []
      };
      
    } catch (error) {
      return {
        success: false,
        code: PoskiErrorCode.INTERNAL_ERROR,
        message: `Get API info error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
}