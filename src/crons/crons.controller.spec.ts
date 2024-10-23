import { Test, TestingModule } from '@nestjs/testing';
import { CronsController } from './crons.controller';
import { CronsService } from './crons.service';

describe('CronsController', () => {
  let controller: CronsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronsController],
      providers: [CronsService],
    }).compile();

    controller = module.get<CronsController>(CronsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
