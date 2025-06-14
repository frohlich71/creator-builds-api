import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Setup, SetupDocument } from './schemas/setup.schema';
import {
  Equipment,
  EquipmentDocument,
} from '../equipment/schemas/equipment.schema';

@Injectable()
export class SetupService {
  constructor(
    @InjectModel(Setup.name) private setupModel: Model<SetupDocument>,
    @InjectModel(Equipment.name)
    private equipmentModel: Model<EquipmentDocument>,
  ) {}

  async createForUser(
    name: string,
    ownerId: string,
    equipments: string[],
  ): Promise<Setup> {
    const setup = new this.setupModel({
      name,
      owner: new Types.ObjectId(ownerId),
      equipments: equipments.map((id) => new Types.ObjectId(id)),
    });

    return setup.save();
  }

  async findByUserId(userId: string): Promise<any[]> {
    const setups = await this.setupModel
      .find({ owner: new Types.ObjectId(userId) })
      .exec();

    const result = await Promise.all(
      setups.map(async (setup) => {
        const equipments = await this.equipmentModel
          .find({ setup: setup._id })
          .exec();

        return {
          ...setup.toObject(),
          equipments,
        };
      }),
    );

    return result;
  }

  async deleteById(setupId: string): Promise<Setup | null> {
    const objectId = new Types.ObjectId(setupId);

    await this.equipmentModel.deleteMany({ setup: objectId }).exec();
    return this.setupModel.findByIdAndDelete(objectId).exec();
  }
}
