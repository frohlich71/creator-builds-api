import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Equipment, EquipmentDocument } from './schemas/equipment.schema';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectModel(Equipment.name)
    private equipmentModel: Model<EquipmentDocument>,
  ) {}

  async createForSetup(data: {
    nickname: string;
    name: string;
    brand?: string;
    type?: string;
    url?: string;
    setupId: string;
  }): Promise<Equipment> {
    const equipment = new this.equipmentModel({
      ...data,
      setup: new Types.ObjectId(data.setupId),
    });
    return equipment.save();
  }

  async deleteById(equipmentId: string): Promise<Equipment | null> {
    return this.equipmentModel
      .findByIdAndDelete(new Types.ObjectId(equipmentId))
      .exec();
  }
}
