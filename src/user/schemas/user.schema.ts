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

  @Prop({required: false})
  tiktok: string

  @Prop({required: false})
  facebook: string

  @Prop({required: false})
  pinterest: string

  @Prop({required: false})
  twitch: string

  @Prop({required: false})
  linkedin: string

  @Prop({required: false})
  snapchat: string

  @Prop({ required: true })
  password: string;

  @Prop()
  telephone: string;

  @Prop({required: false})
  refreshToken: string

  @Prop({required: false})
  profileImage: string

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ required: false })
  emailVerificationToken: string;

  @Prop({ required: false })
  emailVerificationExpiry: Date;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Setup' })
  setups: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
