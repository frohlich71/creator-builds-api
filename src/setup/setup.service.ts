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
      let productId: Types.ObjectId | undefined;
      
      // Se foi fornecido um ASIN, tenta encontrar o produto
      if (equipment.asin) {
        const product = await this.productModel.findOne({ asin: equipment.asin }).exec();
        if (!product) {
          console.warn(`Product with ASIN ${equipment.asin} not found, creating equipment without product reference`);
        } else {
          productId = product._id;
        }
      }
      
      const newEquipment = new this.equipmentModel({
        name: equipment.name,
        nickname: equipment.nickname,
        model: equipment.model,
        brand: equipment.brand,
        link: equipment.link,
        icon: equipment.icon,
        setup: savedSetup._id,
        ...(productId && { product: productId })
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

  async updateById(
    setupId: string,
    name: string,
    ownerName: string,
    equipments: CreateEquipmentDTO[],
  ): Promise<Setup> {
    const objectId = new Types.ObjectId(setupId);

    // Verifica se o setup existe
    const existingSetup = await this.setupModel.findById(objectId).exec();
    if (!existingSetup) {
      throw new Error(`Setup with ID ${setupId} not found`);
    }

    // Verifica se o usuário existe
    const user = await this.userModel.findOne({ name: ownerName }).exec();
    if (!user) {
      throw new Error(`User with name ${ownerName} not found`);
    }

    // Remove todos os equipamentos existentes do setup
    await this.equipmentModel.deleteMany({ setup: objectId }).exec();

    // Atualiza o setup
    existingSetup.name = name;
    existingSetup.owner = user._id;
    existingSetup.equipments = [];
    await existingSetup.save();

    // Cria os novos equipamentos
    const equipmentPromises = equipments.map(async (equipment) => {
      let productId: Types.ObjectId | undefined;
      
      // Se foi fornecido um ASIN, tenta encontrar o produto
      if (equipment.asin) {
        const product = await this.productModel.findOne({ asin: equipment.asin }).exec();
        if (!product) {
          console.warn(`Product with ASIN ${equipment.asin} not found, creating equipment without product reference`);
        } else {
          productId = product._id;
        }
      }
      
      const newEquipment = new this.equipmentModel({
        name: equipment.name,
        nickname: equipment.nickname,
        model: equipment.model,
        brand: equipment.brand,
        link: equipment.link,
        icon: equipment.icon,
        setup: existingSetup._id,
        ...(productId && { product: productId })
      });
      
      return newEquipment.save();
    });

    const savedEquipments = await Promise.all(equipmentPromises);

    // Atualiza as referências dos equipamentos no setup
    existingSetup.equipments = savedEquipments.map(eq => eq._id);
    await existingSetup.save();

    return existingSetup;
  }

  async findById(setupId: string) {
    const objectId = new Types.ObjectId(setupId);
    
    const setup = await this.setupModel
      .findById(objectId)
      .populate('owner', 'name email')
      .exec();

    if (!setup) {
      throw new Error(`Setup with ID ${setupId} not found`);
    }

    // Busca os equipamentos do setup
    const equipments = await this.equipmentModel
      .find({ setup: setup._id })
      .populate('product')
      .exec();

    return {
      ...setup.toObject(),
      equipments,
    };
  }
}
