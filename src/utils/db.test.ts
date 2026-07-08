import { describe, it, expect } from 'vitest';
import { calculateHours } from './db';

describe('数据库工具函数测试', () => {
  describe('calculateHours - 计算工时', () => {
    it('应该正确计算正常工时', () => {
      const hours = calculateHours('09:00', '18:00');
      expect(hours).toBe(9);
    });

    it('应该正确计算半天工时', () => {
      const hours = calculateHours('09:00', '13:00');
      expect(hours).toBe(4);
    });

    it('应该正确计算跨午夜工时', () => {
      const hours = calculateHours('22:00', '06:00');
      expect(hours).toBe(8);
    });

    it('应该处理分钟', () => {
      const hours = calculateHours('09:30', '17:45');
      expect(hours).toBe(8.25);
    });

    it('应该处理相同时间（0小时）', () => {
      const hours = calculateHours('09:00', '09:00');
      expect(hours).toBe(0);
    });

    it('应该处理凌晨时间', () => {
      const hours = calculateHours('00:00', '08:00');
      expect(hours).toBe(8);
    });
  });
});
