import { useState, useEffect } from 'react';
import {
  Product,
  cloneProductCatalog,
  productCatalog,
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
} from 'lucide-react';
import * as productAPI from '../lib/api/products';
import { CreateProductDto, UpdateProductDto } from '../lib/api/products';
import * as orderAPI from '../lib/api/orders';
import { Order } from '../lib/api/orders';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'products' | 'orders' | 'categories';

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

  // Admin mode states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductDto | UpdateProductDto>({
    name: '',
    barcode: '',
    price: 0,
    stock: 0,
    imageUrl: '',
  });

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  useEffect(() => {
    loadProducts();
    loadOrders();
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
      setOrdersError('Không thể tải danh sách đơn hàng.');
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

  const handleCreateProduct = () => {
    setFormData({
      name: '',
      barcode: '',
      price: 0,
      stock: 0,
      imageUrl: '',
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
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        const productId = parseInt(editingProduct.id.replace('prod-', ''));
        await productAPI.updateProduct(productId, formData);
      } else {
        await productAPI.createProduct(formData as CreateProductDto);
      }
      await loadProducts();
      setIsEditModalOpen(false);
      setIsCreateModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        price: 0,
        stock: 0,
        imageUrl: '',
      });
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

  const categories = [...new Set(products.map((p) => p.category))];
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

          {activeTab === 'categories' && <CategoriesView categories={categories} products={products} />}
        </main>
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <ProductModal
          isOpen={isCreateModalOpen || isEditModalOpen}
          isEdit={!!editingProduct}
          product={editingProduct}
          formData={formData}
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
            });
          }}
          onSave={handleSaveProduct}
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
  const [stockInput, setStockInput] = useState(product.stock.toString());

  useEffect(() => {
    setStockInput(product.stock.toString());
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
      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">{product.name}</h3>
      <p className="text-lg font-bold text-blue-600 mb-2">
        {product.price.toLocaleString('vi-VN')}đ
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
                setStockInput(product.stock.toString());
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
  categories: string[];
  products: Product[];
}

function CategoriesView({ categories, products }: CategoriesViewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Danh sách danh mục</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const categoryProducts = products.filter((p) => p.category === category);
          return (
            <div
              key={category}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-gray-800 mb-2">{category}</h4>
              <p className="text-sm text-gray-600">
                {categoryProducts.length} sản phẩm
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Product Modal
interface ProductModalProps {
  isOpen: boolean;
  isEdit: boolean;
  product: Product | null;
  formData: CreateProductDto | UpdateProductDto;
  onFormDataChange: (data: CreateProductDto | UpdateProductDto) => void;
  onClose: () => void;
  onSave: () => void;
}

function ProductModal({
  isOpen,
  isEdit,
  formData,
  onFormDataChange,
  onClose,
  onSave,
}: ProductModalProps) {
  if (!isOpen) return null;

  const handleChange = (field: keyof CreateProductDto, value: any) => {
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
