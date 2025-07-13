import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type EquipmentDocument = HydratedDocument<Equipment>;

@Schema()
export class Equipment {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  nickname?: string;

  @Prop({ required: false })
  model?: string;

  @Prop({ required: false })
  brand?: string;

  @Prop({ required: false })
  link?: string;

  @Prop({ required: false })
  icon?: string;

  @Prop({ type: Types.ObjectId, ref: 'Setup', required: true })
  setup: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: false })
  product?: Types.ObjectId;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);
