import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CreateBulkProductsDto, CreateProductDto } from './dtos/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search')
  async searchByTitle(
    @Query('q') q: string,
    @Query('limit') limit?: string
  ) {
    if (!q || q.length < 2) return [];
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.productsService.findByTitleLike(q, lim);
  }

  @Post('bulk')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create multiple products from JSON' })
  @ApiBody({ type: CreateBulkProductsDto })
  async createBulkProducts(@Body() createBulkProductsDto: CreateBulkProductsDto) {
    const { products } = createBulkProductsDto;
    
    // Remove duplicatas pelo ASIN
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => p.asin === product.asin)
    );

    if (uniqueProducts.length !== products.length) {
      console.log(`Removidas ${products.length - uniqueProducts.length} duplicatas`);
    }

    // Insere produtos em lote
    const results = await Promise.allSettled(
      uniqueProducts.map(product => this.productsService.create(product))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      message: `Processamento concluído: ${successful} produtos inseridos, ${failed} falharam`,
      successful,
      failed,
      total: uniqueProducts.length,
      errors: results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => {
          const error = result.reason;
          return error instanceof Error ? error.message : String(error) || 'Erro desconhecido';
        })
    };
  }

  @Post('bulk/file')
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create products from uploaded JSON file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JSON file containing products array'
        }
      }
    }
  })
  async createProductsFromFile(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }

    if (!file.originalname.endsWith('.json')) {
      throw new Error('O arquivo deve ser um JSON válido');
    }

    let products: CreateProductDto[];
    
    try {
      const fileContent: string = file.buffer.toString('utf8');
      const jsonData: unknown = JSON.parse(fileContent);
      
      // Verifica se é um array direto ou se tem a propriedade 'products'
      if (Array.isArray(jsonData)) {
        products = jsonData;
      } else if (jsonData && typeof jsonData === 'object' && 'products' in jsonData && Array.isArray((jsonData as any).products)) {
        products = (jsonData as any).products;
      } else {
        throw new Error('Formato JSON inválido. Esperado um array de produtos ou objeto com propriedade "products"');
      }
      
      // Limpa os produtos removendo campos MongoDB específicos e convertendo formatos
      products = products.map((product: any): CreateProductDto => {
        const cleanProduct: any = { ...product };
        
        // Remove campos específicos do MongoDB
        delete cleanProduct._id;
        delete cleanProduct.__v;
        delete cleanProduct.$__;
        delete cleanProduct.$isNew;
        delete cleanProduct._doc;
        
        // Se o produto veio de um export MongoDB, pode ter estrutura _doc
        if (product._doc) {
          Object.assign(cleanProduct, product._doc);
          delete cleanProduct._id;
          delete cleanProduct.__v;
        }
        
        // Converte ObjectId do MongoDB se necessário
        if (cleanProduct._id && typeof cleanProduct._id === 'object' && cleanProduct._id.$oid) {
          delete cleanProduct._id;
        }
        
        // Garantir que campos numéricos sejam numbers
        if (cleanProduct.stars) cleanProduct.stars = Number(cleanProduct.stars);
        if (cleanProduct.reviews) cleanProduct.reviews = Number(cleanProduct.reviews);
        if (cleanProduct.price) cleanProduct.price = Number(cleanProduct.price);
        if (cleanProduct.listPrice) cleanProduct.listPrice = Number(cleanProduct.listPrice);
        if (cleanProduct.category_id) cleanProduct.category_id = Number(cleanProduct.category_id);
        
        // Garantir que boolean seja boolean
        if (typeof cleanProduct.isBestSeller === 'string') {
          cleanProduct.isBestSeller = cleanProduct.isBestSeller === 'true' || cleanProduct.isBestSeller === 'True';
        }
        
        return cleanProduct as CreateProductDto;
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao processar arquivo JSON: ${errorMessage}`);
    }

    // Remove duplicatas pelo ASIN
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => p.asin === product.asin)
    );

    if (uniqueProducts.length !== products.length) {
      console.log(`Removidas ${products.length - uniqueProducts.length} duplicatas`);
    }

    // Insere produtos em lote
    const results = await Promise.allSettled(
      uniqueProducts.map(product => this.productsService.create(product))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      message: `Arquivo processado: ${successful} produtos inseridos, ${failed} falharam`,
      successful,
      failed,
      total: uniqueProducts.length,
      fileName: file.originalname,
      fileSize: file.size,
      errors: results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => {
          const error = result.reason;
          return error instanceof Error ? error.message : String(error) || 'Erro desconhecido';
        })
    };
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a single product' })
  @ApiBody({ type: CreateProductDto })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

}
