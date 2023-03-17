import { jest } from '@jest/globals';
import { Voucher } from '@prisma/client';

import voucherRepository from 'repositories/voucherRepository';
import voucherService from 'services/voucherService';

describe("changeVoucherToUsed test suite", () => {
  it("should resolve async function and return Voucher if code exists", () => {
    expect(async () => {
      const mockVoucher = {
        id: 1,
        code: '12345678',
        discount: 70,
        used: true
      };
      jest.spyOn(voucherRepository, "useVoucher").mockResolvedValueOnce(mockVoucher);
  
      const result = await voucherService.changeVoucherToUsed('12345678');
      expect(result).toMatchObject(mockVoucher);
    }).resolves;
  });

  it("should reject async function code does not exist", () => {
    expect(async () => {
      jest.spyOn(voucherRepository, "useVoucher").mockRejectedValueOnce(undefined);
  
      await voucherService.changeVoucherToUsed('12345678');
    }).rejects;
  });
});

describe("isAmountValidForDiscount test suite", () => {
  it("should return false if amount is lower than minimum", () => {
    const min = voucherService.MIN_VALUE_FOR_DISCOUNT;

    const result = voucherService.isAmountValidForDiscount(min-1);
    expect(result).toBe(false);
  });

  it("should return true if amount equals minimum", () => {
    const min = voucherService.MIN_VALUE_FOR_DISCOUNT;

    const result = voucherService.isAmountValidForDiscount(min);
    expect(result).toBe(true);
  });

  it("should return true if amount is greater than minimum", () => {
    const min = voucherService.MIN_VALUE_FOR_DISCOUNT;

    const result = voucherService.isAmountValidForDiscount(min+1);
    expect(result).toBe(true);
  });
});

describe("applyDiscount test suite", () => {
  it("should return 30% of value in case of 70% discount", () => {
    const result = voucherService.applyDiscount(200, 70);
    expect(result).toBe(60);
  });

  it("should return 100% of value in case of 0% discount", () => {
    const result = voucherService.applyDiscount(200, 0);
    expect(result).toBe(200);
  });

  it("should return 0 value in case of 100% discount", () => {
    const result = voucherService.applyDiscount(200, 100);
    expect(result).toBe(0);
  });
});








describe("applyVoucher test suite", () => {
  it("should throw conflict error if there is not a voucher with this code", async () => {
    expect(async () => {
      jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValue(undefined);

      await voucherService.applyVoucher('12345678', 200);
    }).rejects.toMatchObject({ type: 'conflict', message: 'Voucher does not exist.' });
  });





    it("should", async () => {
      expect(async () => {
        const mockVoucher: Voucher = {
          id: 1,
          code: '12345678',
          discount: 70,
          used: false,
        }
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValue(mockVoucher);
  
        await voucherService.applyVoucher('12345678', 200);
      }).rejects.toMatchObject({ type: 'conflict', message: 'Voucher does not exist.' });
    });
















  it("should resolve the async function if there is no conflict", async () => {
    expect(async () => {
      jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => { return undefined; });

      jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((): any => { return true; });
  
      await voucherService.createVoucher('12345678', 70);
    }).resolves;
  });  
});