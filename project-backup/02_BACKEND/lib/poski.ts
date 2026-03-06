/**
 * PoskiREAL API integration for publishing listings to Poski Real Estate Platform
 * XML-RPC API Documentation: https://export-test.poskireal.cz/import/v1/
 * 
 * This module provides compatibility layer between old REST API and new XML-RPC implementation
 */

import { PoskiRealService } from './poski-real/PoskiRealService';
import { PoskiDataMapper } from './poski-real/DataMapper';
import { PoskiCredentials } from './poski-real/types';

// Re-export types for backward compatibility
export interface PoskiListingData {
  title: string;
  description: string;
  price: number;
  address: string;
  type: string;
  area?: number;
  images: string[];
}

export interface PoskiResponse {
  success: boolean;
  listingId?: string;
  message?: string;
  errors?: string[];
}

/**
 * Initialize PoskiREAL service with credentials from environment variables
 */
function getPoskiRealService(): PoskiRealService | null {
  const clientId = process.env.POSKI_CLIENT_ID;
  const passwordMd5 = process.env.POSKI_PASSWORD_MD5;
  const softwareKey = process.env.POSKI_SOFTWARE_KEY;
  const apiUrl = process.env.POSKI_API_URL || 'https://export-test.poskireal.cz/import/v1/';
  
  if (!clientId || !passwordMd5 || !softwareKey) {
    console.warn('⚠️ PoskiREAL credentials not found in environment variables');
    console.warn('Required: POSKI_CLIENT_ID, POSKI_PASSWORD_MD5, POSKI_SOFTWARE_KEY');
    return null;
  }
  
  const credentials: PoskiCredentials = {
    clientId,
    passwordMd5,
    softwareKey
  };
  
  return new PoskiRealService(credentials, apiUrl);
}

/**
 * Publishes a listing to Poski Import API (XML-RPC version)
 * @param data - Listing data to publish
 * @returns Promise with Poski API response
 */
export const publishToPoski = async (data: PoskiListingData): Promise<PoskiResponse> => {
  try {
    const service = getPoskiRealService();
    
    if (!service) {
      throw new Error('PoskiREAL service not initialized - check environment variables');
    }
    
    console.log(`📤 Publishing to PoskiREAL XML-RPC API`);
    console.log('📊 Listing data:', {
      title: data.title,
      price: data.price,
      address: data.address,
      type: data.type,
      imagesCount: data.images?.length || 0
    });
    
    // Test connection first
    const connectionTest = await service.testConnection();
    
    if (!connectionTest.success) {
      console.error('❌ PoskiREAL connection test failed:', connectionTest.message);
      throw new Error(`PoskiREAL connection failed: ${connectionTest.message}`);
    }
    
    console.log('✅ PoskiREAL connection successful');
    
    // Create RealForgeListing format from PoskiListingData
    const realForgeListing = {
      id: `temp_${Date.now()}`,
      title: data.title,
      address: data.address,
      type: data.type.toUpperCase() as any,
      price: data.price,
      area: data.area,
      description: data.description,
      aiResult: {
        headline: data.title,
        longDesc: data.description,
        shortDesc: data.description.substring(0, 200)
      },
      media: data.images?.map((url, index) => ({
        url,
        isFeatured: index === 0,
        sortOrder: index + 1,
        originalName: `image_${index + 1}.jpg`
      })) || []
    };
    
    // Default seller ID (should be configured)
    const sellerId = parseInt(process.env.POSKI_SELLER_ID || '1');
    
    // Sync listing
    const result = await service.syncRealForgeListing(realForgeListing, sellerId);
    
    if (result.success && result.data) {
      console.log('✅ PoskiREAL API response:', result);
      
      return {
        success: true,
        listingId: result.data.advert_rkid,
        message: result.message || 'Listing published successfully to PoskiREAL'
      };
    } else {
      console.error('❌ PoskiREAL API error:', result);
      
      return {
        success: false,
        message: result.message || 'Failed to publish listing',
        errors: result.errors
      };
    }
    
  } catch (error: any) {
    console.error('❌ Failed to publish to PoskiREAL:', error.message);
    
    return {
      success: false,
      message: error.message,
      errors: [error.message]
    };
  }
};

/**
 * Transforms REALFORGE AI listing data to Poski API format (backward compatibility)
 */
export function transformToPoskiFormat(listing: any, aiResults: any, media: any[] = []): PoskiListingData {
  // Handle both object media (with url property) and string media (URLs)
  const getImageUrl = (item: any): string => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && item.url) return item.url;
    return '';
  };
  
  const getIsFeatured = (item: any): boolean => {
    if (typeof item === 'string') return false;
    if (item && typeof item === 'object') return item.isFeatured === true;
    return false;
  };
  
  // Get featured images or first 5 images
  const featuredImages = media
    .filter((m: any) => getIsFeatured(m))
    .slice(0, 5)
    .map(getImageUrl)
    .filter(url => url);
  
  // Fallback to any available images
  const images = featuredImages.length > 0 
    ? featuredImages 
    : media.slice(0, 5).map(getImageUrl).filter(url => url);
  
  // Determine property type mapping
  const typeMapping: Record<string, string> = {
    'APARTMENT': 'apartment',
    'HOUSE': 'house',
    'LAND': 'land',
    'COMMERCIAL': 'commercial',
    'VILLA': 'villa',
    'COTTAGE': 'cottage'
  };
  
  const poskiType = typeMapping[listing.type] || 'apartment';
  
  return {
    title: aiResults?.headline || listing.title || 'Property Listing',
    description: aiResults?.longDesc || aiResults?.shortDesc || 'AI-generated property description',
    price: listing.price || 0,
    address: listing.address || 'Address not specified',
    type: poskiType,
    area: listing.area || undefined,
    images: images
  };
}

/**
 * Test PoskiREAL API connection
 */
export async function testPoskiConnection(): Promise<PoskiResponse> {
  try {
    const service = getPoskiRealService();
    
    if (!service) {
      return {
        success: false,
        message: 'PoskiREAL service not initialized - check environment variables',
        errors: ['Missing POSKI_CLIENT_ID, POSKI_PASSWORD_MD5, or POSKI_SOFTWARE_KEY']
      };
    }
    
    const result = await service.testConnection();
    
    return {
      success: result.success,
      message: result.message,
      errors: result.errors
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: `Connection test failed: ${error.message}`,
      errors: [error.message]
    };
  }
}

/**
 * Get list of published adverts from PoskiREAL
 */
export async function getPoskiAdverts(limit: number = 50): Promise<PoskiResponse & { adverts?: any[] }> {
  try {
    const service = getPoskiRealService();
    
    if (!service) {
      return {
        success: false,
        message: 'PoskiREAL service not initialized',
        errors: ['Missing credentials']
      };
    }
    
    const result = await service.listAdverts(limit);
    
    return {
      success: result.success,
      message: result.message,
      adverts: result.data?.adverts,
      errors: result.errors
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to get adverts: ${error.message}`,
      errors: [error.message]
    };
  }
}