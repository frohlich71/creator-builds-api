import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/products.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(productData: Partial<Product>): Promise<Product> {
    const createdProduct = new this.productModel(productData);
    return createdProduct.save();
  }

  async findByTitleLike(title: string, limit = 10): Promise<Pick<Product, 'asin' | 'title' | 'productURL' | 'imgUrl'>[]> {
    return this.productModel.find(
      { title: { $regex: title, $options: 'i' } },
      { asin: 1, title: 1, productURL: 1, imgUrl: 1, _id: 0 }
    )
      .limit(limit)
      .exec();
  }
}
