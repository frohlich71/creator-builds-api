import { Test, TestingModule } from '@nestjs/testing';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

describe('SetupController', () => {
  let controller: SetupController;
  let mockSetupService: Partial<Record<keyof SetupService, jest.Mock>>;

  const mockSetup = {
    _id: '1',
    name: 'My Setup',
    owner: 'user123',
    equipments: ['eq1', 'eq2'],
  };

  beforeEach(async () => {
    mockSetupService = {
      createForUser: jest.fn().mockResolvedValue(mockSetup),
      findByUserId: jest.fn().mockResolvedValue([mockSetup]),
      deleteById: jest.fn().mockResolvedValue(mockSetup),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SetupController],
      providers: [{ provide: SetupService, useValue: mockSetupService }],
    }).compile();

    controller = module.get<SetupController>(SetupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a setup for user', async () => {
    const result = await controller.createSetupForUser({
      name: 'My Setup',
      ownerId: 'user123',
      equipments: ['eq1', 'eq2'],
    });

    expect(result).toEqual(mockSetup);
    expect(mockSetupService.createForUser).toHaveBeenCalledWith(
      'My Setup',
      'user123',
      ['eq1', 'eq2'],
    );
  });

  it('should return setups for a user', async () => {
    const result = await controller.getSetupsByUser('user123');
    expect(result).toEqual([mockSetup]);
    expect(mockSetupService.findByUserId).toHaveBeenCalledWith('user123');
  });

  it('should delete setup by id', async () => {
    const result = await controller.deleteSetupById('1');
    expect(result).toEqual(mockSetup);
    expect(mockSetupService.deleteById).toHaveBeenCalledWith('1');
  });
});
