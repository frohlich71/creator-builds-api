// user.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  telephone: string;

  @Prop({ type: [Types.ObjectId], ref: 'Setup' })
  setups: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
