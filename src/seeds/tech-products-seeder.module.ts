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
    // Verifica se o seeding está habilitado
    const shouldSeed = process.env.SEED_PRODUCTS === 'true';
    if (!shouldSeed) {
      this.logger.log('Seeding de produtos desabilitado via SEED_PRODUCTS=false');
      return;
    }

    try {
      await this.seedProducts();
    } catch (error) {
      this.logger.error('Erro durante o seeding de produtos:', error);
    }
  }

  private async seedProducts(): Promise<void> {
    // Verifica se já existem produtos na base (a menos que seja forçado)
    const forceSeeding = process.env.FORCE_SEED === 'true';
    const existingProductsCount = await this.productModel.countDocuments();
    
    if (existingProductsCount > 0 && !forceSeeding) {
      this.logger.log(`Base já possui ${existingProductsCount} produtos. Pulando seed. (Use FORCE_SEED=true para forçar)`);
      return;
    }

    if (forceSeeding && existingProductsCount > 0) {
      this.logger.log(`FORCE_SEED=true: Limpando ${existingProductsCount} produtos existentes...`);
      await this.productModel.deleteMany({});
    }

    this.logger.log('Iniciando o seed de produtos...');

    // Tenta múltiplos caminhos possíveis para o arquivo CSV
    const possiblePaths = [
      path.resolve(process.cwd(), 'src/data/amazon_products.csv'),
      path.resolve(process.cwd(), 'data/amazon_products.csv'),
      path.resolve(__dirname, '../data/amazon_products.csv'),
      path.resolve(__dirname, '../../data/amazon_products.csv'),
    ];

    let filePath: string | null = null;
    for (const possiblePath of possiblePaths) {
      this.logger.log(`Verificando caminho: ${possiblePath}`);
      if (fs.existsSync(possiblePath)) {
        filePath = possiblePath;
        this.logger.log(`✅ Arquivo CSV encontrado em: ${filePath}`);
        break;
      }
    }

    if (!filePath) {
      this.logger.error('❌ Arquivo CSV não encontrado em nenhum dos caminhos esperados:', possiblePaths);
      return;
    }

    const productsToInsert: Record<string, any>[] = [];
    
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
              stars: Number(row['stars']) || 0,
              reviews: Number(row['reviews']) || 0,
              price: Number(row['price']) || 0,
              listPrice: Number(row['listPrice']) || 0,
              category_id: categoryId,
              isBestSeller: row['isBestSeller'] === 'True' || row['isBestSeller'] === 'true',
            });
          }
        })
        .on('end', () => {
          void (async () => {
            try {
              if (productsToInsert.length === 0) {
                this.logger.warn('Nenhum produto encontrado para inserir.');
                resolve();
                return;
              }

              // Remove itens duplicados pelo campo 'asin' antes de inserir
              const uniqueProductsMap = new Map();
              for (const product of productsToInsert) {
                if (product.asin && !uniqueProductsMap.has(product.asin)) {
                  uniqueProductsMap.set(product.asin, product);
                }
              }
              
              const uniqueProducts = Array.from(uniqueProductsMap.values());
              this.logger.log(`Produtos processados: ${productsToInsert.length}, únicos: ${uniqueProducts.length}`);

              if (uniqueProducts.length > 0) {
                await this.productModel.insertMany(uniqueProducts, { ordered: false });
                this.logger.log(`${uniqueProducts.length} produtos inseridos com sucesso!`);
              }
              
              resolve();
            } catch (error) {
              if (error instanceof Error && 'code' in error && error.code === 11000) {
                this.logger.warn('Alguns produtos não foram inseridos devido a duplicatas no banco.');
                resolve();
              } else {
                this.logger.error('Erro ao inserir produtos:', error);
                reject(error instanceof Error ? error : new Error(String(error)));
              }
            }
          })();
        })
        .on('error', (err) => {
          this.logger.error('Erro ao ler o CSV:', err);
          reject(err);
        });
    });
  }
}
