export type UserAccount = {
  userID: number;
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
  avatarUrl?: string;
};

export type Location = {
  id: string;
  zone: string;
  aisle_number: number;
  shelf_number: number;
  position: string;
};

export type Product = {
  id: string;
  categoryID?: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  location_id: string;
  image_url: string;
  isActive?: boolean;
  category: string;
  location?: Location;
};

export type PurchaseHistoryEntry = {
  id: string;
  userID: number;
  orderNumber: string;
  items: number;
  totalAmount: number;
  method: 'pickup' | 'delivery';
  status: 'completed' | 'preparing' | 'shipping';
  createdAt: string;
};

export const users: UserAccount[] = [
  {
    userID: 1,
    fullName: 'Chương Nguyễn',
    email: 'chuongnn12.work@gmail.com',
    passwordHash: 'hash-demo',
    phoneNumber: '0915539311',
    createdAt: '2023-05-12T08:12:00Z',
    isActive: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
  },
  {
    userID: 2,
    fullName: 'Lan Nguyễn',
    email: 'lan.nguyen@pos.local',
    passwordHash: 'hash-demo',
    phoneNumber: '0978 111 222',
    createdAt: '2022-11-02T10:30:00Z',
    isActive: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
  },
];

const locationCatalog: Location[] = [
  { id: 'loc-101', zone: 'A', aisle_number: 1, shelf_number: 2, position: 'Gần cửa ra vào' },
  { id: 'loc-102', zone: 'B', aisle_number: 2, shelf_number: 3, position: 'Giữa cửa hàng' },
  { id: 'loc-103', zone: 'C', aisle_number: 4, shelf_number: 1, position: 'Khu đồ uống' },
  { id: 'loc-104', zone: 'D', aisle_number: 3, shelf_number: 2, position: 'Khu đồ ăn nhanh' },
];

export const productCatalog: Product[] = [
  {
    id: 'prod-001',
    name: 'Cà phê latte',
    barcode: 'CF001',
    price: 45000,
    stock: 25,
    location_id: 'loc-103',
    image_url: 'https://images.pexels.com/photos/296888/pexels-photo-296888.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Cafe',
    location: locationCatalog[2],
  },
  {
    id: 'prod-002',
    name: 'Trà sữa trân châu',
    barcode: 'TS001',
    price: 55000,
    stock: 30,
    location_id: 'loc-103',
    image_url: 'https://images.pexels.com/photos/3737694/pexels-photo-3737694.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Trà sữa',
    location: locationCatalog[2],
  },
  {
    id: 'prod-003',
    name: 'Sandwich gà nướng',
    barcode: 'SW001',
    price: 60000,
    stock: 12,
    location_id: 'loc-104',
    image_url: 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Đồ ăn nhanh',
    location: locationCatalog[3],
  },
  {
    id: 'prod-004',
    name: 'Bánh croissant bơ',
    barcode: 'BK001',
    price: 35000,
    stock: 18,
    location_id: 'loc-101',
    image_url: 'https://images.pexels.com/photos/2135/food-salad-healthy-vegetables.jpg?auto=compress&cs=tinysrgb&w=400',
    category: 'Bánh',
    location: locationCatalog[0],
  },
  {
    id: 'prod-005',
    name: 'Sinh tố xoài',
    barcode: 'SM001',
    price: 49000,
    stock: 20,
    location_id: 'loc-102',
    image_url: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Sinh tố',
    location: locationCatalog[1],
  },
];

export const cloneProductCatalog = () =>
  productCatalog.map((product) => ({
    ...product,
    location: product.location ? { ...product.location } : undefined,
  }));

export const purchaseHistory: PurchaseHistoryEntry[] = [
  {
    id: 'hist-001',
    userID: 1,
    orderNumber: 'POS23091201',
    items: 4,
    totalAmount: 182000,
    method: 'pickup',
    status: 'completed',
    createdAt: '2024-02-12T09:45:00Z',
  },
  {
    id: 'hist-002',
    userID: 1,
    orderNumber: 'POS23082102',
    items: 2,
    totalAmount: 92000,
    method: 'delivery',
    status: 'shipping',
    createdAt: '2024-01-03T14:10:00Z',
  },
  {
    id: 'hist-003',
    userID: 2,
    orderNumber: 'POS23070105',
    items: 5,
    totalAmount: 250000,
    method: 'pickup',
    status: 'completed',
    createdAt: '2023-12-21T08:30:00Z',
  },
];

export const getUserById = (userID: number) => users.find((user) => user.userID === userID);
export const getPurchaseHistoryByUser = (userID: number) =>
  userID === 0 ? [] : purchaseHistory.filter((entry) => entry.userID === userID);
