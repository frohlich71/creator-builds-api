// user.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({required: true, unique: false})
  nickname: string

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({required: false})
  website: string

  @Prop({required: false})
  instagram: string

  @Prop({required: false})
  x: string

  @Prop({required: false})
  youtube: string

  @Prop({ required: true })
  password: string;

  @Prop()
  telephone: string;

  @Prop({required: false})
  refreshToken: string

  @Prop({required: false})
  profileImage: string

  @Prop({ type: [Types.ObjectId], ref: 'Setup' })
  setups: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
