import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    mockUserService = {
      create: jest.fn().mockResolvedValue({ name: 'João' }),
      findAll: jest
        .fn()
        .mockResolvedValue([{ name: 'Alice' }, { name: 'Bob' }]),
      findByName: jest.fn().mockResolvedValue({ name: 'Carlos' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new user', async () => {
    const result = await controller.createUser({ name: 'João', email: 'joao@example.com', password: '123456', telephone: '99999-9999' });
    expect(result).toEqual({ name: 'João' });
    expect(mockUserService.create).toHaveBeenCalledWith({ name: 'João' });
  });

  it('should return a list of users', async () => {
    const result = await controller.getUsers();
    expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });

  it('should return a user by name', async () => {
    const result = await controller.getUserByName('Carlos');
    expect(result).toEqual({ name: 'Carlos' });
    expect(mockUserService.findByName).toHaveBeenCalledWith('Carlos');
  });
});
