import { jest } from '@jest/globals';
import { Voucher } from '@prisma/client';

import voucherRepository from 'repositories/voucherRepository';
import voucherService from 'services/voucherService';

describe('changeVoucherToUsed test suite', () => {
  it('should resolve async function and return Voucher if code exists', () => {
    expect(async () => {
      const mockVoucher = {
        id: 1,
        code: '12345678',
        discount: 70,
        used: true
      };
      jest.spyOn(voucherRepository, 'useVoucher').mockResolvedValueOnce(mockVoucher);
  
      const result = await voucherService.changeVoucherToUsed('12345678');
      expect(result).toMatchObject(mockVoucher);
    }).resolves;
  });

  it('should reject async function code does not exist', () => {
    expect(async () => {
      jest.spyOn(voucherRepository, 'useVoucher').mockRejectedValueOnce(undefined);
  
      await voucherService.changeVoucherToUsed('12345678');
    }).rejects;
  });
});

describe('isAmountValidForDiscount test suite', () => {
  it('should return false if amount is lower than minimum', () => {
    const min = voucherService.MIN_VALUE_FOR_DISCOUNT;

    const result = voucherService.isAmountValidForDiscount(min-1);
    expect(result).toBe(false);
  });

  it('should return true if amount equals minimum', () => {
    const min = voucherService.MIN_VALUE_FOR_DISCOUNT;

    const result = voucherService.isAmountValidForDiscount(min);
    expect(result).toBe(true);
  });

  it('should return true if amount is greater than minimum', () => {
    const min = voucherService.MIN_VALUE_FOR_DISCOUNT;

    const result = voucherService.isAmountValidForDiscount(min+1);
    expect(result).toBe(true);
  });
});

describe('applyDiscount test suite', () => {
  it('should return 30% of value in case of 70% discount', () => {
    const result = voucherService.applyDiscount(200, 70);
    expect(result).toBe(60);
  });

  it('should return 100% of value in case of 0% discount', () => {
    const result = voucherService.applyDiscount(200, 0);
    expect(result).toBe(200);
  });

  it('should return 0 value in case of 100% discount', () => {
    const result = voucherService.applyDiscount(200, 100);
    expect(result).toBe(0);
  });
});

describe('applyVoucher test suite', () => {
  it('should throw conflict error if there is not a voucher with this code', async () => {
    expect(async () => {
      jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValue(undefined);

      await voucherService.applyVoucher('12345678', 200);
    }).rejects.toMatchObject({ type: 'conflict', message: 'Voucher does not exist.' });
  });

  it('should not apply voucher if it is used and amount is not valid', async () => {
      const mockVoucher: Voucher = {
        id: 1,
        code: '12345678',
        discount: 70,
        used: true,
      };
      jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValue(mockVoucher);
      jest.spyOn(voucherService, 'isAmountValidForDiscount').mockImplementationOnce((amount) => { return false; })

      const result = await voucherService.applyVoucher('12345678', 200);
      expect(result).toMatchObject({
        amount: 200,
        discount: mockVoucher.discount,
        finalAmount: 200,
        applied: false
      });
    });

  it('should not apply voucher if it is used', async () => {
    const mockVoucher: Voucher = {
      id: 1,
      code: '12345678',
      discount: 70,
      used: true,
    };
    jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValue(mockVoucher);
    jest.spyOn(voucherService, 'isAmountValidForDiscount').mockImplementationOnce((amount) => { return true; })

    const result = await voucherService.applyVoucher('12345678', 200);
    expect(result).toMatchObject({
      amount: 200,
      discount: mockVoucher.discount,
      finalAmount: 200,
      applied: false
    });
  });

  it('should apply voucher and return discounts', async () => {
    const mockVoucher: Voucher = {
      id: 1,
      code: '12345678',
      discount: 70,
      used: false,
    };
    jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValue(mockVoucher);
    jest.spyOn(voucherService, 'isAmountValidForDiscount').mockImplementationOnce((amount) => { return true; });
    jest.spyOn(voucherRepository, 'useVoucher').mockResolvedValueOnce(undefined);
    jest.spyOn(voucherService, 'changeVoucherToUsed').mockResolvedValue({ used: true, ...mockVoucher });
    jest.spyOn(voucherService, 'applyDiscount').mockReturnValueOnce(60);

    const result = await voucherService.applyVoucher('12345678', 200);
    expect(result).toMatchObject({
      amount: 200,
      discount: mockVoucher.discount,
      finalAmount: 60,
      applied: true
    });
  });
});
