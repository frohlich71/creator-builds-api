import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

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
}
