import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type SetupDocument = HydratedDocument<Setup>;

@Schema()
export class Setup {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Equipment' })
  equipments: Types.ObjectId[];
}

export const SetupSchema = SchemaFactory.createForClass(Setup);
