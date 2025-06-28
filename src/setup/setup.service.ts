import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Setup, SetupDocument } from './schemas/setup.schema';
import {
  Equipment,
  EquipmentDocument,
} from '../equipment/schemas/equipment.schema';
import { CreateEquipmentDTO } from './DTOs/create-setup.dto';
import { Product, ProductDocument } from 'src/products/schemas/products.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class SetupService {
  constructor(
    @InjectModel(Setup.name) private setupModel: Model<SetupDocument>,
    @InjectModel(Equipment.name)
    private equipmentModel: Model<EquipmentDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>, 
  ) {}

  async createForUser(
    name: string,
    ownerName: string,
    equipments: CreateEquipmentDTO[],
  ): Promise<Setup> {

    const user = await this.userModel.findOne({name: ownerName}).exec();

    if (!user) {
      throw new Error(`User with name ${ownerName} not found`);
    }

    const setup = new this.setupModel({
      name,
      owner: user._id
    });
    
    const savedSetup = await setup.save();

    const equipmentPromises = equipments.map(async (equipment) => {
      const product = await this.productModel.findOne({ asin: equipment.asin }).exec();
      if (!product) {
        throw new Error(`Product with ASIN ${equipment.asin} not found`);
      }
      
      const newEquipment = new this.equipmentModel({
        name: equipment.name,
        setup: savedSetup._id,
        product: product._id
      });
      
      return newEquipment.save();
    });

    const savedEquipments = await Promise.all(equipmentPromises);

    savedSetup.equipments = savedEquipments.map(eq => eq._id);
    await savedSetup.save();

    return savedSetup;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const setups = await this.setupModel
      .find({ owner: new Types.ObjectId(userId) })
      .populate({
        path: 'equipments',
        populate: {
          path: 'product',
          model: 'Product'
        }
      })
      .exec();

    // Se não tiver a relação direta, fazer populate manual
    const result = await Promise.all(
      setups.map(async (setup) => {
        const equipments = await this.equipmentModel
          .find({ setup: setup._id })
          .populate('product')
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
