import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (classNames utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      );
      expect(result).toBe('base-class active-class');
    });

    it('should handle object syntax', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      });
      expect(result).toBe('class1 class3');
    });

    it('should handle mixed syntax', () => {
      const result = cn(
        'base-class',
        { 'conditional-class': true },
        'another-class'
      );
      expect(result).toBe('base-class conditional-class another-class');
    });

    it('should filter out falsy values', () => {
      const result = cn(
        'class1',
        null,
        undefined,
        false,
        0,
        '',
        'class2'
      );
      expect(result).toBe('class1 class2');
    });
  });

  describe('Formatting utilities', () => {
    it('should format currency correctly', () => {
      // This is a placeholder for actual currency formatting
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('cs-CZ', {
          style: 'currency',
          currency: 'CZK',
        }).format(amount);
      };

      expect(formatCurrency(1000)).toBe('1 000,00 Kč');
      expect(formatCurrency(2500000)).toBe('2 500 000,00 Kč');
    });

    it('should format date correctly', () => {
      const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('cs-CZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(date);
      };

      const date = new Date('2024-01-15');
      // Czech date format includes spaces: "15. 01. 2024"
      expect(formatDate(date)).toBe('15. 01. 2024');
    });
  });
});