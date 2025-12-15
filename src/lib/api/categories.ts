import { API_BASE_URL } from '../config';

// DTOs matching backend (PascalCase) + camelCase fallback
export interface CategoryDto {
  CategoryID?: number;
  categoryID?: number;
  ParentCategoryID?: number;
  parentCategoryID?: number;
  CategoryName?: string;
  categoryName?: string;
  Description?: string;
  description?: string;
  IsActive?: boolean;
  isActive?: boolean;
}

export interface CreateCategoryDto {
  ParentCategoryID?: number;
  CategoryName: string;
  Description?: string;
}

export interface UpdateCategoryDto {
  CategoryName?: string;
  Description?: string;
}

// Frontend Category type
export interface Category {
  id: number;
  categoryID: number;
  name: string;
  description?: string;
  parentCategoryID?: number;
  parentCategoryName?: string;
  imageUrl?: string;
  isActive: boolean;
  subcategories?: Category[];
}

/**
 * Convert CategoryDto to Category (frontend format)
 */
export function categoryDtoToCategory(dto: CategoryDto): Category {
  const categoryID = dto.CategoryID ?? dto.categoryID ?? 0;
  const name = dto.CategoryName ?? dto.categoryName ?? 'Chưa đặt tên';
  const description = dto.Description ?? dto.description;
  const parentCategoryID = dto.ParentCategoryID ?? dto.parentCategoryID;
  const isActive = dto.IsActive ?? dto.isActive ?? true;

  return {
    id: categoryID,
    categoryID,
    name,
    description,
    parentCategoryID,
    parentCategoryName: undefined,
    imageUrl: undefined,
    isActive,
  };
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch categories'}`);
    }

    const dtos: CategoryDto[] = await response.json();
    return dtos.map(categoryDtoToCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến backend. Vui lòng kiểm tra API_BASE_URL và đảm bảo backend đang chạy.');
    }
    throw error;
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }

    const dto: CategoryDto = await response.json();
    return categoryDtoToCategory(dto);
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

/**
 * Get subcategories by parent category ID
 */
export async function getSubCategories(parentId: number): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Categories/${parentId}/subcategories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subcategories');
    }

    const dtos: CategoryDto[] = await response.json();
    return dtos.map(categoryDtoToCategory);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
}

/**
 * Create category
 */
export async function createCategory(dto: Partial<Category> | CreateCategoryDto): Promise<Category> {
  try {
    const payload: CreateCategoryDto = 'CategoryName' in dto
      ? dto as CreateCategoryDto
      : {
          CategoryName: (dto as Category).name || '',
          Description: (dto as Category).description,
          ParentCategoryID: (dto as Category).parentCategoryID,
        };

    const response = await fetch(`${API_BASE_URL}/api/Categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    const createdDto: CategoryDto = await response.json();
    return categoryDtoToCategory(createdDto);
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

/**
 * Update category
 */
export async function updateCategory(id: number, dto: Partial<Category> | UpdateCategoryDto): Promise<Category> {
  try {
    const payload: UpdateCategoryDto = 'CategoryName' in dto
      ? dto as UpdateCategoryDto
      : {
          CategoryName: (dto as Category).name,
          Description: (dto as Category).description,
        };

    const response = await fetch(`${API_BASE_URL}/api/Categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    const updatedDto: CategoryDto = await response.json();
    return categoryDtoToCategory(updatedDto);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

/**
 * Delete category
 */
export async function deleteCategory(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

