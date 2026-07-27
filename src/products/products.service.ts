import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma:PrismaService
  ){}
  create(createProductDto: CreateProductDto, authorId:number ) {


    return this.prisma.product.create({
      data:{
        ...createProductDto,
        authorId
      }
    });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({where:{id}})
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, userId:number) {
    const product = await this.prisma.product.findUnique({where:{id}}) 
    if(!product) throw new NotFoundException('Product not Found!')

    if(product.authorId !== userId) throw new ForbiddenException('You are not the author of this product')
    
    return this.prisma.product.update({
      where:{id},
      data:{
        ...updateProductDto,
      }
    })
  }

  async remove(productId: number, userId:number) {
  const product = await this.prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new NotFoundException(`Product #${productId} not found`);
  }

  if (product.authorId !== userId) {
    throw new ForbiddenException('You are not the author of this product');
  }

  await this.prisma.product.delete({
    where: { id: productId }
  });
  return product;
  }
}
