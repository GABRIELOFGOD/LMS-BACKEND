import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
    // this.createDefaultCategories();
  }

  async createDefaultCategories() {
    const defaultCategories = [
      { name: 'Web Development' },
      { name: 'Data Science' },
      { name: 'Machine Learning' },
      { name: 'Mobile Development' },
      { name: 'Game Development' },
      { name: 'Cloud Computing' },
      { name: 'Cyber Security' },
      { name: 'DevOps' },
    ];
    const existingCategories = await this.categoryRepository.find();
    if (existingCategories.length > 0) {
      console.log('Default categories already exist');
      return { message: 'Default categories already exist' };
    }
    try {
      const categories = this.categoryRepository.create(defaultCategories);
      await this.categoryRepository.save(categories);
      console.log('Default categories created successfully');
      return { message: 'Default categories created successfully' };
    } catch (error) {
      throw new ConflictException('Error creating default categories');
    }
  }
  
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const categoryExists = await this.categoryRepository.findOne({
        where: { name: createCategoryDto.name },
      });

      if (categoryExists) throw new ConflictException('Category name exists, please pick another name.');

      const category = this.categoryRepository.create(createCategoryDto);
      await this.categoryRepository.save(category);

      return { message: "Category created successfully" }
      
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find();
      if (!categories) throw new ConflictException('No categories found');
      return categories;
    } catch (error) {
      throw error;      
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['courses'],
      });
      if (!category) throw new ConflictException('Category not found');
      return category;
    } catch (error) {
      throw error;      
    }
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
