import { API_BASE_URL } from '../config';
import { Product } from '../data';

// DTOs matching backend
export interface ProductDto {
  productID: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  categoryID?: number;
  categoryName?: string;
  imageUrl?: string;
  shortDescription?: string;
  fullDescription?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
}

export interface CreateProductDto {
  name: string;
  barcode: string;
  price: number;
  stock: number;
  categoryID?: number;
  shortDescription?: string;
  fullDescription?: string;
  imageUrl?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
}

export interface UpdateProductDto {
  name?: string;
  barcode?: string;
  price?: number;
  stock?: number;
  categoryID?: number;
  shortDescription?: string;
  fullDescription?: string;
  imageUrl?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
}

/**
 * Convert ProductDto to Product (frontend format)
 */
export function productDtoToProduct(dto: ProductDto): Product {
  return {
    id: `prod-${dto.productID.toString().padStart(3, '0')}`,
    name: dto.name,
    barcode: dto.barcode,
    price: dto.price,
    stock: dto.stock,
    location_id: '', // Backend có thể không có location
    image_url: dto.imageUrl || 'https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: dto.categoryName || 'Chưa phân loại',
  };
}

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const dtos: ProductDto[] = await response.json();
    return dtos.map(productDtoToProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: number): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const dto: ProductDto = await response.json();
    return productDtoToProduct(dto);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Create new product
 */
export async function createProduct(dto: CreateProductDto): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }

    const createdDto: ProductDto = await response.json();
    return productDtoToProduct(createdDto);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * Update product
 */
export async function updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }

    const updatedDto: ProductDto = await response.json();
    return productDtoToProduct(updatedDto);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Update product stock
 */
export async function updateProductStock(id: number, quantity: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quantity),
    });

    if (!response.ok) {
      throw new Error('Failed to update stock');
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/category/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products by category');
    }

    const dtos: ProductDto[] = await response.json();
    return dtos.map(productDtoToProduct);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}



