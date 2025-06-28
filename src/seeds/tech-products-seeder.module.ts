import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { Product, ProductSchema, ProductDocument } from '../products/schemas/products.schema';

const FILTER_CATEGORIES = [56, 57, 66, 81, 71, 79, 83, 72, 69, 65, 255, 263]; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
})
export class TechProductsSeederModule implements OnModuleInit {
  private readonly logger = new Logger(TechProductsSeederModule.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async onModuleInit() {
    // Busca o arquivo a partir da raiz do projeto, não do dist
    const filePath = path.resolve(process.cwd(), 'src/data/amazon_products.csv');
    const productsToInsert: Record<string, any>[] = [];
    console.log('Iniciando o seed de produtos...');
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const categoryId = Number(row['category_id']);
          if (FILTER_CATEGORIES.includes(categoryId)) {
            productsToInsert.push({
              asin: row['asin'],
              title: row['title'],
              imgUrl: row['imgUrl'],
              productURL: row['productURL'],
              stars: Number(row['stars']),
              reviews: Number(row['reviews']),
              price: Number(row['price']),
              listPrice: Number(row['listPrice']),
              category_id: categoryId,
              isBestSeller: row['isBestSeller'] === 'True' || row['isBestSeller'] === 'true',
            });
          }
        })
        .on('end', () => {
          (async () => {
            if (productsToInsert.length) {
              // Remove itens duplicados pelo campo 'asin' antes de inserir
              const uniqueProductsMap = new Map();
              for (const product of productsToInsert) {
                if (!uniqueProductsMap.has(product.asin)) {
                  uniqueProductsMap.set(product.asin, product);
                }
              }
              const uniqueProducts = Array.from(uniqueProductsMap.values());
              try {
                await this.productModel.insertMany(uniqueProducts, { ordered: false });
                this.logger.log('Produtos inseridos com sucesso!');
              } catch {
                this.logger.warn('Alguns produtos não foram inseridos (possíveis duplicatas no banco).');
              }
            }
            resolve();
          })();
        })
        .on('error', (err) => {
          this.logger.error('Erro ao ler o CSV:', err);
          reject(err);
        });
    });
  }
}
