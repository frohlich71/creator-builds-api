import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Amazon Standard Identification Number' })
  @IsString()
  asin: string;

  @ApiProperty({ description: 'Product title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Product image URL', required: false })
  @IsOptional()
  @IsString()
  imgUrl?: string;

  @ApiProperty({ description: 'Product page URL', required: false })
  @IsOptional()
  @IsString()
  productURL?: string;

  @ApiProperty({ description: 'Product rating (stars)', required: false })
  @IsOptional()
  @IsNumber()
  stars?: number;

  @ApiProperty({ description: 'Number of reviews', required: false })
  @IsOptional()
  @IsNumber()
  reviews?: number;

  @ApiProperty({ description: 'Current price', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'List price', required: false })
  @IsOptional()
  @IsNumber()
  listPrice?: number;

  @ApiProperty({ description: 'Category ID' })
  @IsNumber()
  category_id: number;

  @ApiProperty({ description: 'Is best seller', required: false })
  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;
}

export class CreateBulkProductsDto {
  @ApiProperty({ description: 'Array of products to create', type: [CreateProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  products: CreateProductDto[];
}