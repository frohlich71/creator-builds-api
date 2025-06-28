import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ required: true, unique: true })
  asin: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  imgUrl: string;

  @Prop()
  productURL: string;

  @Prop()
  stars: number;

  @Prop()
  reviews: number;

  @Prop()
  price: number;

  @Prop()
  listPrice: number;

  @Prop({ required: true })
  category_id: number;

  @Prop({ default: false })
  isBestSeller: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
