import { jest } from '@jest/globals';
import { Voucher } from '@prisma/client';

import voucherRepository from 'repositories/voucherRepository';
import voucherService from 'services/voucherService';

describe("createVoucher test suite", () => {
  it("should throw conflict error if there is already a voucher with this code", async () => {
    expect(async () => {
      const mockVoucher: Voucher = {
        id: 1,
        code: '12345678',
        discount: 70,
        used: false,
      }
  
      jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => { return mockVoucher; });

      await voucherService.createVoucher(mockVoucher.code, mockVoucher.discount);
    }).rejects.toMatchObject({ type: 'conflict', message: 'Voucher already exist.' });
  });

  it("should resolve the async function if there is no conflict", async () => {
    expect(async () => {
      jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => { return undefined; });

      jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((): any => { return true; });
  
      await voucherService.createVoucher('12345678', 70);
    }).resolves;
  });  
});