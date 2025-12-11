import { useState, useEffect, useMemo, useRef } from 'react';
import {
  UserAccount,
  Product,
  cloneProductCatalog,
  productCatalog,
  getPurchaseHistoryByUser,
  PurchaseHistoryEntry,
} from '../lib/data';
import {
  ShoppingCart,
  LogOut,
  Search,
  MapPin,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Package,
  UserRound,
  History,
} from 'lucide-react';

interface POSSystemProps {
  user: UserAccount;
  onLogout: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type FulfillmentMethod = 'pickup' | 'delivery';

interface DeliveryInfo {
  fullName: string;
  phone: string;
  address: string;
  email: string;
}

export default function POSSystem({ user, onLogout }: POSSystemProps) {
  const [products, setProducts] = useState<Product[]>(() => cloneProductCatalog());
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories] = useState<string[]>(() => [...new Set(productCatalog.map((p) => p.category))]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFulfillmentVisible, setIsFulfillmentVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('pickup');
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    fullName: '',
    phone: '',
    address: '',
    email: '',
  });
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [lastOrderItems, setLastOrderItems] = useState(0);
  const userHistory = useMemo(() => getPurchaseHistoryByUser(user.userID), [user.userID]);
  const userInitials = useMemo(
    () =>
      user.fullName
        .split(' ')
        .slice(-2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    [user.fullName],
  );
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAvatarMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAvatarMenuOpen]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setSelectedProduct(product);
    setTimeout(() => setSelectedProduct(null), 2000);
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.product.stock) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const checkout = async (paymentMethod: string) => {
    if (cart.length === 0 || isProcessing) return;

    const totalAmount = getTotalAmount();
    const totalItems = getTotalItems();

    setIsProcessing(true);
    setTimeout(() => {
      setProducts((prev) =>
        prev.map((product) => {
          const cartItem = cart.find((item) => item.product.id === product.id);
          if (!cartItem) return product;
          return { ...product, stock: Math.max(product.stock - cartItem.quantity, 0) };
        }),
      );
      setCart([]);
      setIsProcessing(false);
      setLastOrderTotal(totalAmount);
      setLastOrderItems(totalItems);
      setFulfillmentMethod('pickup');
      setDeliveryInfo({ fullName: '', phone: '', address: '', email: '' });
      setIsFulfillmentVisible(true);
    }, 500);
  };

  const handleConfirmFulfillment = () => {
    if (fulfillmentMethod === 'delivery') {
      if (!deliveryInfo.fullName || !deliveryInfo.phone || !deliveryInfo.address) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng.');
        return;
      }
    }
    setIsFulfillmentVisible(false);
    alert('Đơn hàng đã sẵn sàng để xử lý giao nhận.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Hệ Thống POS</h1>
                <p className="text-sm text-gray-600">Khách hàng: {user.fullName}</p>
              </div>
            </div>
            <div className="relative flex items-center" ref={menuRef}>
              <button
                type="button"
                className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-semibold text-lg flex items-center justify-center hover:opacity-80 transition"
                onClick={() => setIsAvatarMenuOpen((prev) => !prev)}
                aria-label="Mở menu người dùng"
              >
                {userInitials}
              </button>
              {isAvatarMenuOpen && (
                <div className="absolute right-0 top-16 bg-white rounded-xl shadow-2xl border border-gray-200 w-64 z-20">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      setIsProfileVisible(true);
                    }}
                  >
                    <UserRound className="w-4 h-4 text-blue-600" />
                    Thông tin khách hàng
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      setIsHistoryVisible(true);
                    }}
                  >
                    <History className="w-4 h-4 text-blue-600" />
                    Lịch sử mua hàng
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 overflow-y-auto">
          <div className="mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên hoặc mã vạch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Tất cả
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
                isSelected={selectedProduct?.id === product.id}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
          </div>

          <div className="lg:w-[400px] w-full bg-white border border-gray-200 rounded-xl flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Giỏ hàng
              </h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                {getTotalItems()} món
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Giỏ hàng trống</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItemCard
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Tạm tính:</span>
                <span>{getTotalAmount().toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{getTotalAmount().toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => checkout('cash')}
                disabled={cart.length === 0 || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Banknote className="w-5 h-5" />
                Thanh toán tiền mặt
              </button>
              <button
                onClick={() => checkout('card')}
                disabled={cart.length === 0 || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Thanh toán thẻ
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
      {isFulfillmentVisible && (
        <FulfillmentModal
          method={fulfillmentMethod}
          onMethodChange={setFulfillmentMethod}
          info={deliveryInfo}
          onInfoChange={(field, value) => setDeliveryInfo((prev) => ({ ...prev, [field]: value }))}
          onClose={() => setIsFulfillmentVisible(false)}
          onConfirm={handleConfirmFulfillment}
          total={lastOrderTotal}
          items={lastOrderItems}
        />
      )}
      {isProfileVisible && <ProfileModal user={user} onClose={() => setIsProfileVisible(false)} />}
      {isHistoryVisible && (
        <HistoryModal entries={userHistory} onClose={() => setIsHistoryVisible(false)} />
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  isSelected: boolean;
}

function ProductCard({ product, onAdd, isSelected }: ProductCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${
        isSelected ? 'border-green-500 shadow-lg' : 'border-gray-200'
      }`}
      onClick={() => onAdd(product)}
    >
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-blue-600 mb-2">
          {product.price.toLocaleString('vi-VN')}đ
        </p>

        {product.location && (
          <div className="flex items-start gap-1 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200 mb-2">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-600" />
            <div className="leading-tight">
              <div className="font-semibold text-yellow-800">
                Khu {product.location.zone} · Kệ {product.location.aisle_number} · Ngăn{' '}
                {product.location.shelf_number}
              </div>
              <div>Gợi ý: {product.location.position}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded ${
            product.stock > 10
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            Còn: {product.stock}
          </span>
          <span className="text-gray-500">{product.category}</span>
        </div>
      </div>
    </div>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemove: (productId: string) => void;
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=400';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
            {item.product.name}
          </h4>
          <p className="text-blue-600 font-bold text-sm mb-2">
            {item.product.price.toLocaleString('vi-VN')}đ
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.product.id, -1)}
                className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-gray-800 w-8 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.product.id, 1)}
                className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                disabled={item.quantity >= item.product.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onRemove(item.product.id)}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-600">Thành tiền:</span>
        <span className="font-bold text-gray-800">
          {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
        </span>
      </div>
    </div>
  );
}

function ProfileCard({ user }: { user: UserAccount }) {
  const infoRows = [
    { label: 'Email', value: user.email },
    { label: 'Số điện thoại', value: user.phoneNumber ?? 'Chưa cập nhật' },
    {
      label: 'Ngày tham gia',
      value: new Date(user.createdAt).toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    },
    { label: 'Trạng thái', value: user.isActive ? 'Hoạt động' : 'Tạm khoá' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-2xl uppercase">
          {user.fullName
            .split(' ')
            .slice(-2)
            .map((part) => part[0])
            .join('')}
        </div>
        <div>
          <p className="text-sm text-gray-500">Hồ sơ người dùng</p>
          <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
          <p className="text-sm text-gray-500">Mã người dùng: #{user.userID.toString().padStart(4, '0')}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoRows.map((row) => (
          <div
            key={row.label}
            className="border border-gray-100 rounded-lg p-3 bg-gray-50 text-sm text-gray-600"
          >
            <p className="font-medium text-gray-500">{row.label}</p>
            <p className="text-gray-900">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileModal({ user, onClose }: { user: UserAccount; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Hồ sơ khách hàng</p>
            <h3 className="text-xl font-semibold text-gray-800">{user.fullName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl leading-none px-2 py-1"
            aria-label="Đóng hồ sơ"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <ProfileCard user={user} />
        </div>
      </div>
    </div>
  );
}

function PurchaseHistoryList({ entries }: { entries: PurchaseHistoryEntry[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Lịch sử mua hàng</p>
          <h3 className="text-xl font-semibold text-gray-800">Đơn gần đây</h3>
        </div>
        <span className="text-sm text-gray-500">Tổng {entries.length} đơn</span>
      </div>
      {entries.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2">Mã đơn</th>
                <th className="py-2">Thời gian</th>
                <th className="py-2">Số món</th>
                <th className="py-2">Tổng tiền</th>
                <th className="py-2">Hình thức</th>
                <th className="py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0">
                  <td className="py-3 font-semibold text-gray-800">{entry.orderNumber}</td>
                  <td className="py-3 text-gray-600">
                    {new Date(entry.createdAt).toLocaleString('vi-VN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="py-3">{entry.items} món</td>
                  <td className="py-3 font-semibold text-blue-600">
                    {entry.totalAmount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-3 capitalize">{entry.method === 'pickup' ? 'Tại quầy' : 'Giao tận nơi'}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entry.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : entry.status === 'shipping'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {entry.status === 'completed'
                        ? 'Hoàn tất'
                        : entry.status === 'shipping'
                          ? 'Đang giao'
                          : 'Đang chuẩn bị'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HistoryModal({
  entries,
  onClose,
}: {
  entries: PurchaseHistoryEntry[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Khách hàng</p>
            <h3 className="text-xl font-semibold text-gray-800">Lịch sử mua hàng</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl leading-none px-2 py-1"
            aria-label="Đóng lịch sử"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <PurchaseHistoryList entries={entries} />
        </div>
      </div>
    </div>
  );
}

interface FulfillmentModalProps {
  method: FulfillmentMethod;
  onMethodChange: (method: FulfillmentMethod) => void;
  info: DeliveryInfo;
  onInfoChange: (field: keyof DeliveryInfo, value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  items: number;
}

function FulfillmentModal({
  method,
  onMethodChange,
  info,
  onInfoChange,
  onClose,
  onConfirm,
  total,
  items,
}: FulfillmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Đơn hàng đã thanh toán</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {items} món · {total.toLocaleString('vi-VN')}đ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-2 hover:bg-gray-100"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Chọn hình thức nhận hàng</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onMethodChange('pickup')}
                className={`border rounded-xl p-4 text-left transition-all ${
                  method === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <p className="font-semibold text-lg text-gray-800">Nhận tại quầy</p>
                <p className="text-sm text-gray-500 mt-1">
                  Khách nhận ngay tại quầy, chuẩn bị hàng trong 2-3 phút.
                </p>
              </button>
              <button
                onClick={() => onMethodChange('delivery')}
                className={`border rounded-xl p-4 text-left transition-all ${
                  method === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <p className="font-semibold text-lg text-gray-800">Shipper giao tận nhà</p>
                <p className="text-sm text-gray-500 mt-1">
                  Điền thông tin khách để điều phối shipper.
                </p>
              </button>
            </div>
          </div>

          {method === 'delivery' && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={info.fullName}
                  onChange={(e) => onInfoChange('fullName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={info.phone}
                    onChange={(e) => onInfoChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0987 123 456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (tuỳ chọn)</label>
                  <input
                    type="email"
                    value={info.email}
                    onChange={(e) => onInfoChange('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="khachhang@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                <textarea
                  value={info.address}
                  onChange={(e) => onInfoChange('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">
            Hình thức: {method === 'pickup' ? 'Nhận tại quầy' : 'Shipper giao tận nhà'}
          </p>
          <div className="flex flex-col gap-2 md:flex-row">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Để sau
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Xác nhận xử lý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
