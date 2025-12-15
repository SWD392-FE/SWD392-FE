import { API_BASE_URL } from '../config';
import { Product } from '../data';

// Backend DTOs (PascalCase)
export interface ProductDto {
  // Support both PascalCase (BE default) and camelCase (observed response)
  ProductID?: number;
  productID?: number;
  CategoryID?: number;
  categoryID?: number;
  CategoryName?: string;
  categoryName?: string;
  ProductName?: string;
  productName?: string;
  SKU?: string;
  sku?: string;
  Price?: number;
  price?: number;
  StockQuantity?: number;
  stockQuantity?: number;
  IsActive?: boolean;
  isActive?: boolean;
  CreatedAt?: string;
  createdAt?: string;
  ProductDetail?: {
    ShortDescription?: string;
    FullDescription?: string;
    ImageUrl?: string;
    imageUrl?: string;
    Weight?: number;
    Width?: number;
    Height?: number;
    Depth?: number;
  };
}

// Frontend form data (camelCase for UI)
export interface ProductFormData {
  name?: string;
  barcode?: string;
  price?: number;
  stock?: number;
  categoryID?: number;
  imageUrl?: string;
  shortDescription?: string;
  fullDescription?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
}

// Backend DTOs (PascalCase) for requests
export interface CreateProductDto {
  CategoryID: number;
  ProductName: string;
  SKU: string;
  Price: number;
  StockQuantity: number;
  ShortDescription?: string;
  FullDescription?: string;
  ImageUrl?: string;
  Weight?: number;
  Width?: number;
  Height?: number;
  Depth?: number;
}

export interface UpdateProductDto {
  ProductName?: string;
  Price?: number;
  StockQuantity?: number;
  IsActive?: boolean;
}

// Convert form data (camelCase) to backend DTO (PascalCase)
function formDataToCreateDto(formData: ProductFormData): CreateProductDto {
  return {
    CategoryID: formData.categoryID || 1, // default category if missing
    ProductName: formData.name || '',
    SKU: formData.barcode || '',
    Price: formData.price || 0,
    StockQuantity: formData.stock || 0,
    ShortDescription: formData.shortDescription,
    FullDescription: formData.fullDescription,
    ImageUrl: formData.imageUrl,
    Weight: formData.weight,
    Width: formData.width,
    Height: formData.height,
    Depth: formData.depth,
  };
}

function formDataToUpdateDto(formData: ProductFormData): UpdateProductDto {
  const dto: UpdateProductDto = {};
  if (formData.name !== undefined) dto.ProductName = formData.name;
  if (formData.price !== undefined) dto.Price = formData.price;
  if (formData.stock !== undefined) dto.StockQuantity = formData.stock;
  return dto;
}

/**
 * Convert ProductDto to Product (frontend format)
 */
export function productDtoToProduct(dto: ProductDto): Product {
  const productID = dto.ProductID ?? dto.productID ?? 0;
  const categoryID = dto.CategoryID ?? dto.categoryID;
  const categoryName = dto.CategoryName ?? dto.categoryName ?? 'Chưa phân loại';
  const productName = dto.ProductName ?? dto.productName ?? 'Chưa có tên';
  const sku = dto.SKU ?? dto.sku ?? '';
  const price = dto.Price ?? dto.price ?? 0;
  const stock = dto.StockQuantity ?? dto.stockQuantity ?? 0;
  const imageFromDetail = dto.ProductDetail?.ImageUrl ?? dto.ProductDetail?.imageUrl;
  // createdAt / isActive not used in UI yet but can be added if needed

  return {
    id: `prod-${productID.toString().padStart(3, '0')}`,
    categoryID: categoryID,
    name: productName,
    barcode: sku,
    price,
    stock,
    location_id: '', // Backend có thể không có location
    image_url:
      (dto as unknown as { imageUrl?: string }).imageUrl ||
      imageFromDetail ||
      'https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: categoryName,
    isActive: dto.IsActive ?? dto.isActive ?? true,
  };
}

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Products`, {
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
export async function createProduct(dto: CreateProductDto | ProductFormData): Promise<Product> {
  try {
    const backendDto = 'ProductName' in dto ? (dto as CreateProductDto) : formDataToCreateDto(dto as ProductFormData);

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendDto),
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
export async function updateProduct(id: number, dto: UpdateProductDto | ProductFormData): Promise<Product> {
  try {
    const backendDto =
      'ProductName' in dto || 'Price' in dto
        ? (dto as UpdateProductDto)
        : formDataToUpdateDto(dto as ProductFormData);

    const response = await fetch(`${API_BASE_URL}/api/Products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendDto),
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






