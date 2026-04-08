import { describe, it, expect } from 'vitest';
import { Product, ProductCategory, ProductProps } from '../../src/domain/entities/product.entity';

describe('Product Entity', () => {
  const defaultProps: ProductProps = {
    id: 'prod-001',
    name: 'X-Burger',
    description: 'Hambúrguer artesanal com queijo',
    price: 29.9,
    category: ProductCategory.MEAL,
    imageUrl: 'https://img.fastmeals.com/x-burger.jpg',
    isAvailable: true,
    preparationTime: 15,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  };

  function createProduct(overrides: Partial<ProductProps> = {}): Product {
    return new Product({ ...defaultProps, ...overrides });
  }

  describe('getters', () => {
    it('should return id', () => {
      const product = createProduct();
      expect(product.id).toBe('prod-001');
    });

    it('should return name', () => {
      const product = createProduct();
      expect(product.name).toBe('X-Burger');
    });

    it('should return description', () => {
      const product = createProduct();
      expect(product.description).toBe('Hambúrguer artesanal com queijo');
    });

    it('should return price', () => {
      const product = createProduct();
      expect(product.price).toBe(29.9);
    });

    it('should return category', () => {
      const product = createProduct();
      expect(product.category).toBe(ProductCategory.MEAL);
    });

    it('should return imageUrl', () => {
      const product = createProduct();
      expect(product.imageUrl).toBe('https://img.fastmeals.com/x-burger.jpg');
    });

    it('should return null imageUrl', () => {
      const product = createProduct({ imageUrl: null });
      expect(product.imageUrl).toBeNull();
    });

    it('should return isAvailable', () => {
      const product = createProduct();
      expect(product.isAvailable).toBe(true);
    });

    it('should return preparationTime', () => {
      const product = createProduct();
      expect(product.preparationTime).toBe(15);
    });

    it('should return createdAt', () => {
      const product = createProduct();
      expect(product.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'));
    });

    it('should return updatedAt', () => {
      const product = createProduct();
      expect(product.updatedAt).toEqual(new Date('2026-01-02T00:00:00Z'));
    });
  });

  describe('toJSON', () => {
    it('should return all properties as plain object', () => {
      const product = createProduct();
      const json = product.toJSON();

      expect(json).toEqual(defaultProps);
    });

    it('should return imageUrl as null when not set', () => {
      const product = createProduct({ imageUrl: null });
      const json = product.toJSON();

      expect(json.imageUrl).toBeNull();
    });
  });

  describe('ProductCategory enum', () => {
    it('should have MEAL value', () => {
      expect(ProductCategory.MEAL).toBe('meal');
    });

    it('should have DRINK value', () => {
      expect(ProductCategory.DRINK).toBe('drink');
    });

    it('should have DESSERT value', () => {
      expect(ProductCategory.DESSERT).toBe('dessert');
    });

    it('should have SIDE value', () => {
      expect(ProductCategory.SIDE).toBe('side');
    });
  });
});