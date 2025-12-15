import { API_BASE_URL } from '../config';

// DTOs matching backend (PascalCase)
export interface UserDto {
  UserID: number;
  FullName: string;
  Email: string;
  PhoneNumber?: string;
  CreatedAt: string;
  IsActive: boolean;
}

export interface CreateUserDto {
  FullName: string;
  Email: string;
  Password: string;
  PhoneNumber?: string;
}

export interface UpdateUserDto {
  FullName?: string;
  PhoneNumber?: string;
  IsActive?: boolean;
}

export interface LoginDto {
  Email: string;
  Password: string;
}

// Frontend form data (camelCase) for convenience
export interface UserFormData {
  fullName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

// Frontend User type
export interface User {
  id: number;
  userID: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
  avatarUrl?: string;
}

/**
 * Convert UserDto to User (frontend format)
 */
export function userDtoToUser(dto: UserDto): User {
  return {
    id: dto.UserID,
    userID: dto.UserID,
    fullName: dto.FullName,
    email: dto.Email,
    phoneNumber: dto.PhoneNumber,
    createdAt: dto.CreatedAt,
    isActive: dto.IsActive ?? true,
    avatarUrl: undefined,
  };
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch users'}`);
    }

    const dtos: UserDto[] = await response.json();
    return dtos.map(userDtoToUser);
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến backend. Vui lòng kiểm tra API_BASE_URL và đảm bảo backend đang chạy.');
    }
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const dto: UserDto = await response.json();
    return userDtoToUser(dto);
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Create user
 */
export async function createUser(dto: CreateUserDto | UserFormData): Promise<User> {
  try {
    const payload: CreateUserDto =
      'FullName' in dto
        ? dto as CreateUserDto
        : {
            FullName: (dto as UserFormData).fullName || '',
            Email: (dto as UserFormData).email || '',
            Password: (dto as UserFormData).password || '',
            PhoneNumber: (dto as UserFormData).phoneNumber,
          };

    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error || 'Failed to create user');
    }

    const createdDto: UserDto = await response.json();
    return userDtoToUser(createdDto);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user
 */
export async function updateUser(id: number, dto: UpdateUserDto | UserFormData): Promise<User> {
  try {
    const payload: UpdateUserDto =
      'FullName' in dto || 'IsActive' in dto
        ? dto as UpdateUserDto
        : {
            FullName: (dto as UserFormData).fullName,
            PhoneNumber: (dto as UserFormData).phoneNumber,
            IsActive: (dto as UserFormData).isActive,
          };

    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error || 'Failed to update user');
    }

    const updatedDto: UserDto = await response.json();
    return userDtoToUser(updatedDto);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Login user (for testing purposes)
 */
export async function loginUser(dto: LoginDto): Promise<User> {
  try {
    const payload: LoginDto =
      'Email' in dto
        ? dto
        : {
            Email: (dto as any).email || '',
            Password: (dto as any).password || '',
          };

    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error || 'Failed to login');
    }

    const dto_result: UserDto = await response.json();
    return userDtoToUser(dto_result);
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}


