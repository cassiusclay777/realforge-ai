import {
  RealForgeListing,
  PoskiAdvertData,
  PoskiPhotoData,
  PoskiAdvertFunction,
  PoskiAdvertType,
  PoskiCurrency,
  PoskiPriceUnit,
  PoskiAccuracyLevel,
  PoskiInaccuracyLevel,
  PoskiAdvertLifetime
} from './types';

/**
 * DataMapper pro transformaci REALFORGE listing dat na PoskiREAL formát
 */
export class PoskiDataMapper {
  
  /**
   * Mapuje REALFORGE listing na PoskiREAL AdvertData
   */
  static mapListingToAdvert(listing: RealForgeListing, sellerId: number): PoskiAdvertData {
    // Parse address components
    const addressParts = this.parseAddress(listing.address);
    
    // Map property type
    const advertType = this.mapPropertyType(listing.type);
    
    // Map advert function (default to SALE)
    const advertFunction = PoskiAdvertFunction.SALE;
    
    // Map currency (default to CZK)
    const currency = PoskiCurrency.CZK;
    
    // Map price unit (default to per property)
    const priceUnit = PoskiPriceUnit.PER_PROPERTY;
    
    // Use AI result if available, otherwise use description
    const description = listing.aiResult?.longDesc || 
                       listing.aiResult?.shortDesc || 
                       listing.description || 
                       'Nemovitost k prodeji';
    
    const title = listing.aiResult?.headline || listing.title;
    
    return {
      // Povinná pole
      advert_function: advertFunction,
      advert_lifetime: PoskiAdvertLifetime.DAYS_30, // 30 dní default
      advert_price: listing.price,
      advert_price_currency: currency,
      advert_price_unit: priceUnit,
      advert_type: advertType,
      advert_subtype: this.getSubtype(advertType, listing),
      title: title,
      description: description,
      locality_region: addressParts.region || 'Jihočeský kraj',
      locality_city: addressParts.city || 'Praha',
      locality_street: addressParts.street || '',
      locality_accuracy_level: this.getAccuracyLevel(addressParts),
      locality_inaccuracy_level: PoskiInaccuracyLevel.EXACT,
      seller_id: sellerId,
      
      // Volitelná pole
      usable_area: listing.area,
      floor: listing.floor,
      floors: listing.floor ? (listing.floor + 2) : undefined, // odhad celkových pater
      rooms: listing.rooms,
      construction_year: listing.yearBuilt,
      contact_email: 'info@realforge.ai',
      contact_phone: '+420 123 456 789',
      contact_name: 'RealForge AI',
      
      // Interní ID pro tracking
      advert_rkid: `RF_${listing.id}`
    };
  }
  
  /**
   * Mapuje REALFORGE media na PoskiREAL PhotoData
   */
  static mapMediaToPhotos(media: RealForgeListing['media'] = []): PoskiPhotoData[] {
    return media.map((item, index) => ({
      main: item.isFeatured ? 1 : 0,
      order: item.sortOrder || index + 1,
      photo_rkid: `RF_PHOTO_${item.url.split('/').pop()?.split('.')[0] || index}`,
      data: this.getBase64FromUrl(item.url), // Note: v reálné implementaci bychom potřebovali fetchovat a konvertovat
      alt: item.originalName || `Foto ${index + 1}`
    }));
  }
  
  /**
   * Parse address string into components
   */
  private static parseAddress(address: string): {
    region?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
  } {
    const result: any = {};
    
    // Simple parsing logic - in production would use more sophisticated parsing
    const parts = address.split(',');
    
    if (parts.length >= 1) {
      const firstPart = parts[0].trim();
      
      // Check if contains street
      if (firstPart.includes('ul.') || firstPart.includes('ulice')) {
        result.street = firstPart.replace('ul.', '').replace('ulice', '').trim();
      } else if (firstPart.match(/\d+/)) {
        // Contains number - likely street with house number
        result.street = firstPart;
      } else {
        // Assume city
        result.city = firstPart;
      }
    }
    
    if (parts.length >= 2) {
      result.city = parts[1].trim();
    }
    
    // Default region based on city
    if (result.city) {
      result.region = this.getRegionFromCity(result.city);
    }
    
    return result;
  }
  
  /**
   * Map REALFORGE property type to PoskiREAL type
   */
  private static mapPropertyType(type: RealForgeListing['type']): number {
    switch (type) {
      case 'APARTMENT':
        return PoskiAdvertType.APARTMENT;
      case 'HOUSE':
        return PoskiAdvertType.HOUSE;
      case 'LAND':
        return PoskiAdvertType.LAND;
      case 'COMMERCIAL':
        return PoskiAdvertType.COMMERCIAL;
      default:
        return PoskiAdvertType.OTHER;
    }
  }
  
  /**
   * Get subtype based on property type and listing details
   */
  private static getSubtype(advertType: number, listing: RealForgeListing): number {
    // Default subtypes based on PoskiREAL documentation
    switch (advertType) {
      case PoskiAdvertType.APARTMENT:
        return 101; // Byt
      case PoskiAdvertType.HOUSE:
        return 201; // Rodinný dům
      case PoskiAdvertType.LAND:
        return 301; // Stavební pozemek
      case PoskiAdvertType.COMMERCIAL:
        return 401; // Kanceláře
      default:
        return 501; // Ostatní
    }
  }
  
  /**
   * Determine accuracy level based on address parts
   */
  private static getAccuracyLevel(addressParts: any): typeof PoskiAccuracyLevel[keyof typeof PoskiAccuracyLevel] {
    if (addressParts.street && addressParts.houseNumber) {
      return PoskiAccuracyLevel.AD; // Adresa
    } else if (addressParts.street) {
      return PoskiAccuracyLevel.UL; // Ulice
    } else if (addressParts.city) {
      return PoskiAccuracyLevel.MC; // Městská část
    } else {
      return PoskiAccuracyLevel.OK; // Obec
    }
  }
  
  /**
   * Get region from city name (simplified)
   */
  private static getRegionFromCity(city: string): string {
    const cityLower = city.toLowerCase();
    
    if (cityLower.includes('praha')) return 'Hlavní město Praha';
    if (cityLower.includes('brno')) return 'Jihomoravský kraj';
    if (cityLower.includes('ostrava')) return 'Moravskoslezský kraj';
    if (cityLower.includes('plzeň') || cityLower.includes('plzen')) return 'Plzeňský kraj';
    if (cityLower.includes('liberec')) return 'Liberecký kraj';
    if (cityLower.includes('hradec')) return 'Královéhradecký kraj';
    if (cityLower.includes('pardubice')) return 'Pardubický kraj';
    if (cityLower.includes('olomouc')) return 'Olomoucký kraj';
    if (cityLower.includes('zlín') || cityLower.includes('zlin')) return 'Zlínský kraj';
    if (cityLower.includes('české') || cityLower.includes('ceske')) return 'Jihočeský kraj';
    if (cityLower.includes('ústí') || cityLower.includes('usti')) return 'Ústecký kraj';
    if (cityLower.includes('karlovy')) return 'Karlovarský kraj';
    
    return 'Středočeský kraj'; // default
  }
  
  /**
   * Convert image URL to base64 (placeholder - in production would fetch and convert)
   */
  private static getBase64FromUrl(url: string): string {
    // This is a placeholder - in real implementation we would:
    // 1. Fetch the image from the URL
    // 2. Convert to base64
    // 3. Return base64 string
    
    // For now, return a placeholder
    console.warn('Base64 conversion not implemented for URL:', url);
    return 'BASE64_PLACEHOLDER';
  }
  
  /**
   * Helper to create seller data
   */
  static createSellerData(name: string, email?: string, phone?: string) {
    return {
      name,
      email: email || 'info@realforge.ai',
      phone: phone || '+420 123 456 789',
      address: 'RealForge AI, Praha',
      note: 'Automaticky generováno RealForge AI systémem'
    };
  }
}