import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type EquipmentDocument = HydratedDocument<Equipment>;

@Schema()
export class Equipment {
  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  brand: string;

  @Prop()
  type: string;

  @Prop()
  url: string;

 @Prop({ type: Types.ObjectId, ref: 'Setup', required: true })
  setup: Types.ObjectId;  
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);
