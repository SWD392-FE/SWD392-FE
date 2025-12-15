import { useState, useEffect } from 'react';
import {
  Product,
  cloneProductCatalog,
} from '../lib/data';
import {
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  ShoppingBag,
  FolderTree,
  LayoutDashboard,
  Menu,
  X as XIcon,
  RefreshCw,
  Users,
} from 'lucide-react';
import * as productAPI from '../lib/api/products';
import { ProductFormData } from '../lib/api/products';
import * as orderAPI from '../lib/api/orders';
import { Order } from '../lib/api/orders';
import * as categoryAPI from '../lib/api/categories';
import { Category } from '../lib/api/categories';
import * as userAPI from '../lib/api/users';
import { User as ApiUser, UserFormData } from '../lib/api/users';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'products' | 'orders' | 'categories' | 'users';
type CategoryFormData = {
  name: string;
  description?: string;
  parentCategoryID?: number;
  imageUrl?: string;
  isActive?: boolean;
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>(() => cloneProductCatalog());
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Admin mode states - Products
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    barcode: '',
    price: 0,
    stock: 0,
    imageUrl: '',
  });

  // Admin mode states - Categories
  const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
  const [isCategoryCreateModalOpen, setIsCategoryCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
  });

  // Admin mode states - Users
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [isUserCreateModalOpen, setIsUserCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    avatarUrl: '',
    isActive: true,
  });

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchTerm]);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadCategories();
    loadUsers();
  }, []);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setError(null);
    try {
      const apiProducts = await productAPI.getAllProducts();
      setProducts(apiProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Không thể tải danh sách sản phẩm. Sử dụng dữ liệu mẫu.');
      setProducts(cloneProductCatalog());
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
      );
    }
    setFilteredProducts(filtered);
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError(null);
    try {
      const apiOrders = await orderAPI.getAllOrders();
      setOrders(apiOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng.';
      setOrdersError(`Lỗi: ${errorMessage}. Vui lòng kiểm tra backend có đang chạy không.`);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Reload orders after update
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
    }
  };

  // Categories functions
  const loadCategories = async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);
    try {
      const apiCategories = await categoryAPI.getAllCategories();
      setCategories(apiCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách danh mục.';
      setCategoriesError(`Lỗi: ${errorMessage}. Vui lòng kiểm tra backend có đang chạy không.`);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleCreateCategory = () => {
    setCategoryFormData({
      name: '',
      description: '',
      imageUrl: '',
      isActive: true,
    });
    setEditingCategory(null);
    setIsCategoryCreateModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      parentCategoryID: category.parentCategoryID,
    });
    setIsCategoryEditModalOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.categoryID, categoryFormData);
      } else {
        await categoryAPI.createCategory(categoryFormData);
      }
      await loadCategories();
      setIsCategoryEditModalOpen(false);
      setIsCategoryCreateModalOpen(false);
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        imageUrl: '',
        isActive: true,
      });
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Không thể lưu danh mục. Vui lòng thử lại.');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }
    try {
      await categoryAPI.deleteCategory(category.categoryID);
      await loadCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Không thể xóa danh mục. Vui lòng thử lại.');
    }
  };

  // Users functions
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const apiUsers = await userAPI.getAllUsers();
      setUsers(apiUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.';
      setUsersError(`Lỗi: ${errorMessage}. Vui lòng kiểm tra backend có đang chạy không.`);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCreateUser = () => {
    setUserFormData({
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      avatarUrl: '',
      isActive: true,
    });
    setEditingUser(null);
    setIsUserCreateModalOpen(true);
  };

  const handleEditUser = (user: ApiUser) => {
    setEditingUser(user);
    setUserFormData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      avatarUrl: user.avatarUrl || '',
      isActive: user.isActive,
    });
    setIsUserEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.userID, userFormData);
      } else {
        await userAPI.createUser(userFormData);
      }
      await loadUsers();
      setIsUserEditModalOpen(false);
      setIsUserCreateModalOpen(false);
      setEditingUser(null);
      setUserFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        avatarUrl: '',
        isActive: true,
      });
    } catch (err) {
      console.error('Failed to save user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể lưu người dùng.';
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async (user: ApiUser) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.fullName}"?`)) {
      return;
    }
    try {
      await userAPI.deleteUser(user.userID);
      await loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Không thể xóa người dùng. Vui lòng thử lại.');
    }
  };

  const handleCreateProduct = () => {
    setFormData({
      name: '',
      barcode: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      categoryID: undefined,
    });
    setEditingProduct(null);
    setIsCreateModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      stock: product.stock,
      imageUrl: product.image_url,
      categoryID: product.categoryID,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        const productId = parseInt(editingProduct.id.replace('prod-', ''));
        await productAPI.updateProduct(productId, formData);
      } else {
        await productAPI.createProduct(formData);
      }
      await loadProducts();
      setIsEditModalOpen(false);
      setIsCreateModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Không thể lưu sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }
    try {
      const productId = parseInt(product.id.replace('prod-', ''));
      await productAPI.deleteProduct(productId);
      await loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleUpdateStock = async (product: Product, newStock: number) => {
    try {
      const productId = parseInt(product.id.replace('prod-', ''));
      await productAPI.updateProductStock(productId, newStock);
      await loadProducts();
    } catch (err) {
      console.error('Failed to update stock:', err);
      alert('Không thể cập nhật tồn kho. Vui lòng thử lại.');
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">MegaPOS</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem
            icon={Package}
            label="Sản phẩm"
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
          />
          <SidebarItem
            icon={ShoppingBag}
            label="Đơn hàng"
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          />
          <SidebarItem
            icon={FolderTree}
            label="Danh mục"
            active={activeTab === 'categories'}
            onClick={() => setActiveTab('categories')}
          />
          <SidebarItem
            icon={Users}
            label="Người dùng"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'products' && 'Quản lý sản phẩm'}
              {activeTab === 'orders' && 'Quản lý đơn hàng'}
              {activeTab === 'categories' && 'Quản lý danh mục'}
              {activeTab === 'users' && 'Quản lý người dùng'}
            </h2>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center">
              AD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3 mb-6">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              totalRevenue={totalRevenue}
              totalOrders={totalOrders}
              totalProducts={totalProducts}
              lowStockProducts={lowStockProducts}
              recentOrders={orders.slice(0, 5)}
              isLoading={isLoadingOrders}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={filteredProducts}
              isLoading={isLoadingProducts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onCreate={handleCreateProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              isLoading={isLoadingOrders}
              error={ordersError}
              onUpdateStatus={handleUpdateOrderStatus}
              onRefresh={loadOrders}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              products={products}
              isLoading={isLoadingCategories}
              error={categoriesError}
              onCreate={handleCreateCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onRefresh={loadCategories}
            />
          )}

          {activeTab === 'users' && (
            <UsersView
              users={users}
              isLoading={isLoadingUsers}
              error={usersError}
              onCreate={handleCreateUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onRefresh={loadUsers}
            />
          )}
        </main>
      </div>

      {/* Create/Edit Product Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <ProductModal
          isOpen={isCreateModalOpen || isEditModalOpen}
          isEdit={!!editingProduct}
          product={editingProduct}
          formData={formData}
          categories={categories}
          onFormDataChange={setFormData}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setEditingProduct(null);
            setFormData({
              name: '',
              barcode: '',
              price: 0,
              stock: 0,
              imageUrl: '',
              categoryID: undefined,
            });
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Create/Edit Category Modal */}
      {(isCategoryCreateModalOpen || isCategoryEditModalOpen) && (
        <CategoryModal
          isOpen={isCategoryCreateModalOpen || isCategoryEditModalOpen}
          isEdit={!!editingCategory}
          category={editingCategory}
          formData={categoryFormData}
          categories={categories}
          onFormDataChange={setCategoryFormData}
          onClose={() => {
            setIsCategoryCreateModalOpen(false);
            setIsCategoryEditModalOpen(false);
            setEditingCategory(null);
            setCategoryFormData({
              name: '',
              description: '',
              imageUrl: '',
              isActive: true,
            });
          }}
          onSave={handleSaveCategory}
        />
      )}

      {/* Create/Edit User Modal */}
      {(isUserCreateModalOpen || isUserEditModalOpen) && (
        <UserModal
          isOpen={isUserCreateModalOpen || isUserEditModalOpen}
          isEdit={!!editingUser}
          user={editingUser}
          formData={userFormData}
          onFormDataChange={setUserFormData}
          onClose={() => {
            setIsUserCreateModalOpen(false);
            setIsUserEditModalOpen(false);
            setEditingUser(null);
            setUserFormData({
              fullName: '',
              email: '',
              password: '',
              phoneNumber: '',
              avatarUrl: '',
            });
          }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}

// Sidebar Item Component
interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({ icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600 font-semibold'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

// Dashboard View
interface DashboardViewProps {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: Order[];
  isLoading: boolean;
}

function DashboardView({
  totalRevenue,
  totalOrders,
  totalProducts,
  lowStockProducts,
  recentOrders,
  isLoading,
}: DashboardViewProps) {
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      completed: 'Hoàn tất',
      cancelled: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-yellow-100 text-yellow-700',
      shipping: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={`${totalRevenue.toLocaleString('vi-VN')}đ`}
          icon={Package}
          color="blue"
        />
        <StatCard title="Tổng đơn hàng" value={totalOrders.toString()} icon={ShoppingBag} color="green" />
        <StatCard title="Tổng sản phẩm" value={totalProducts.toString()} icon={Package} color="purple" />
        <StatCard
          title="Sản phẩm sắp hết"
          value={lowStockProducts.toString()}
          icon={Package}
          color="red"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đơn hàng gần đây</h3>
        {isLoading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : recentOrders.length === 0 ? (
          <p className="text-gray-500">Chưa có đơn hàng nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 text-left">Mã đơn</th>
                  <th className="py-2 text-left">Thời gian</th>
                  <th className="py-2 text-left">Số món</th>
                  <th className="py-2 text-left">Tổng tiền</th>
                  <th className="py-2 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 font-semibold">{order.orderNumber}</td>
                    <td className="py-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3">{order.itemsCount || 0} món</td>
                    <td className="py-3 font-semibold text-blue-600">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'red';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

// Products View
interface ProductsViewProps {
  products: Product[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdateStock: (product: Product, stock: number) => void;
}

function ProductsView({
  products,
  isLoading,
  searchTerm,
  onSearchChange,
  onCreate,
  onEdit,
  onDelete,
  onUpdateStock,
}: ProductsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Đang tải sản phẩm...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdateStock={onUpdateStock}
            />
          ))}
        </div>
      )}

      {products.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không có sản phẩm nào</p>
        </div>
      )}
    </div>
  );
}

// Admin Product Card
interface AdminProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdateStock: (product: Product, stock: number) => void;
}

function AdminProductCard({ product, onEdit, onDelete, onUpdateStock }: AdminProductCardProps) {
  const [stockInput, setStockInput] = useState((product.stock ?? 0).toString());

  useEffect(() => {
    setStockInput((product.stock ?? 0).toString());
  }, [product.stock]);

  const handleStockChange = (newStock: number) => {
    if (newStock >= 0) {
      onUpdateStock(product, newStock);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
      </div>
      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">{product.name || 'Chưa có tên'}</h3>
      <p className="text-lg font-bold text-blue-600 mb-2">
        {(product.price ?? 0).toLocaleString('vi-VN')}đ
      </p>
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Mã vạch:</span>
          <span className="font-medium">{product.barcode}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Danh mục:</span>
          <span className="font-medium">{product.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Tồn kho:</span>
          <input
            type="number"
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            onBlur={() => {
              const num = parseInt(stockInput);
              if (!isNaN(num) && num >= 0) {
                handleStockChange(num);
              } else {
                setStockInput((product.stock ?? 0).toString());
              }
            }}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Sửa
        </button>
        <button
          onClick={() => onDelete(product)}
          className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Orders View
interface OrdersViewProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  onUpdateStatus: (orderId: number, status: string) => Promise<void>;
  onRefresh: () => void;
}

function OrdersView({ orders, isLoading, error, onUpdateStatus, onRefresh }: OrdersViewProps) {
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const statusOptions = [
    { value: 'Pending', label: 'Chờ xử lý', color: 'bg-gray-100 text-gray-700' },
    { value: 'Processing', label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'Shipping', label: 'Đang giao', color: 'bg-blue-100 text-blue-700' },
    { value: 'Completed', label: 'Hoàn tất', color: 'bg-green-100 text-green-700' },
    { value: 'Cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  ];

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-100 text-gray-700';
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách đơn hàng</h3>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">Chưa có đơn hàng nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 text-left">Mã đơn</th>
                  <th className="py-2 text-left">User ID</th>
                  <th className="py-2 text-left">Thời gian</th>
                  <th className="py-2 text-left">Số món</th>
                  <th className="py-2 text-left">Tổng tiền</th>
                  <th className="py-2 text-left">Địa chỉ giao hàng</th>
                  <th className="py-2 text-left">Trạng thái</th>
                  <th className="py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-semibold">{order.orderNumber}</td>
                    <td className="py-3 text-gray-600">#{order.userID}</td>
                    <td className="py-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3">{order.itemsCount || 0} món</td>
                    <td className="py-3 font-semibold text-blue-600">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 text-gray-600 text-xs max-w-xs truncate">
                      {order.shippingAddress || 'Không có'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderID, e.target.value)}
                        disabled={updatingOrderId === order.orderID}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Categories View
interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onRefresh: () => void;
}

function CategoriesView({
  categories,
  products,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
}: CategoriesViewProps) {
  const getCategoryProductCount = (categoryId: number) => {
    return products.filter((p) => p.categoryID === categoryId || false).length;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách danh mục</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm danh mục
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải danh mục...</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">Chưa có danh mục nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const productCount = getCategoryProductCount(category.categoryID);
              return (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{category.name}</h4>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          ID: {category.categoryID}
                        </span>
                        {category.parentCategoryID && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            Parent: {category.parentCategoryID}
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        category.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.isActive ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{productCount} sản phẩm</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(category)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Modal
interface ProductModalProps {
  isOpen: boolean;
  isEdit: boolean;
  product: Product | null;
  formData: ProductFormData;
  categories: Category[];
  onFormDataChange: (data: ProductFormData) => void;
  onClose: () => void;
  onSave: () => void;
}

function ProductModal({
  isOpen,
  isEdit,
  formData,
  categories,
  onFormDataChange,
  onClose,
  onSave,
}: ProductModalProps) {
  if (!isOpen) return null;

  const handleChange = (field: keyof ProductFormData, value: string | number | boolean | undefined) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Quản lý sản phẩm</p>
            <h3 className="text-xl font-semibold text-gray-800">
              {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl leading-none px-2 py-1"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã vạch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.barcode || ''}
                onChange={(e) => handleChange('barcode', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mã vạch"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryID ?? ''}
                onChange={(e) =>
                  handleChange('categoryID', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.categoryID} value={cat.categoryID}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock || 0}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL hình ảnh
              </label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả ngắn
              </label>
              <textarea
                value={formData.shortDescription || ''}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả ngắn về sản phẩm"
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả đầy đủ
              </label>
              <textarea
                value={formData.fullDescription || ''}
                onChange={(e) => handleChange('fullDescription', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về sản phẩm"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Category Modal
interface CategoryModalProps {
  isOpen: boolean;
  isEdit: boolean;
  category: Category | null;
  formData: CategoryFormData;
  categories: Category[];
  onFormDataChange: (data: CategoryFormData) => void;
  onClose: () => void;
  onSave: () => void;
}

function CategoryModal({
  isOpen,
  isEdit,
  category,
  formData,
  categories,
  onFormDataChange,
  onClose,
  onSave,
}: CategoryModalProps) {
  if (!isOpen) return null;

  const handleChange = (field: keyof CategoryFormData, value: string | number | boolean | undefined) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  // Filter out current category from parent options (to avoid circular reference)
  const availableParentCategories = isEdit && category
    ? categories.filter((c) => c.categoryID !== category.categoryID)
    : categories;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Quản lý danh mục</p>
            <h3 className="text-xl font-semibold text-gray-800">
              {isEdit ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl leading-none px-2 py-1"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên danh mục"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mô tả danh mục"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục cha (tùy chọn)
              </label>
              <select
                value={formData.parentCategoryID || ''}
                onChange={(e) =>
                  handleChange('parentCategoryID', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Không có (danh mục gốc)</option>
                {availableParentCategories.map((cat) => (
                  <option key={cat.categoryID} value={cat.categoryID}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL hình ảnh
              </label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Danh mục đang hoạt động</span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
}


// Users View
interface UsersViewProps {
  users: ApiUser[];
  isLoading: boolean;
  error: string | null;
  onCreate: () => void;
  onEdit: (user: ApiUser) => void;
  onDelete: (user: ApiUser) => void;
  onRefresh: () => void;
}

function UsersView({
  users,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
}: UsersViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách người dùng</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm người dùng
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải người dùng...</p>
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500">Chưa có người dùng nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 text-left">ID</th>
                  <th className="py-2 text-left">Họ tên</th>
                  <th className="py-2 text-left">Email</th>
                  <th className="py-2 text-left">Số điện thoại</th>
                  <th className="py-2 text-left">Ngày tạo</th>
                  <th className="py-2 text-left">Trạng thái</th>
                  <th className="py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-semibold">#{user.userID}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-xs">
                            {user.fullName
                              .split(' ')
                              .slice(-2)
                              .map((part) => part[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-800">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{user.email}</td>
                    <td className="py-3 text-gray-600">{user.phoneNumber || '-'}</td>
                    <td className="py-3 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(user)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => onDelete(user)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// User Modal
interface UserModalProps {
  isOpen: boolean;
  isEdit: boolean;
  user: ApiUser | null;
  formData: UserFormData;
  onFormDataChange: (data: UserFormData) => void;
  onClose: () => void;
  onSave: () => void;
}

function UserModal({
  isOpen,
  isEdit,
  formData,
  onFormDataChange,
  onClose,
  onSave,
}: UserModalProps) {
  if (!isOpen) return null;

  const handleChange = (field: keyof UserFormData, value: string | number | boolean | undefined) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Quản lý người dùng</p>
            <h3 className="text-xl font-semibold text-gray-800">
              {isEdit ? 'Sửa người dùng' : 'Thêm người dùng mới'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl leading-none px-2 py-1"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="email@example.com"
                required
                disabled={isEdit}
              />
              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              )}
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                  required={!isEdit}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0987 654 321"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL hình đại diện
              </label>
              <input
                type="url"
                value={formData.avatarUrl || ''}
                onChange={(e) => handleChange('avatarUrl', e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {isEdit && (
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tài khoản đang hoạt động</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
