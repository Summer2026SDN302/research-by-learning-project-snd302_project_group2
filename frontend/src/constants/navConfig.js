export const NAV_CONFIG = {
    admin: [
        { label: 'Tổng quan', icon: 'dashboard', path: '/admin/dashboard' },
        { label: 'Quản lý người dùng', icon: 'group', path: '/admin/users' },
        { label: 'Danh mục món ăn', icon: 'category', path: '/admin/categories' },
        { label: 'Món ăn', icon: 'restaurant_menu', path: '/admin/food-items' },
        { label: 'Thực đơn theo lịch', icon: 'calendar_month', path: '/admin/scheduled-menu' },
        { label: 'Thực đơn hôm nay', icon: 'today', path: '/admin/daily-menu' },
        { label: 'Đơn hàng', icon: 'receipt_long', path: '/admin/orders' },
        { label: 'Thanh toán', icon: 'payments', path: '/admin/payments' },
        { label: 'Phân tích & Dự báo', icon: 'auto_awesome', path: '/admin/ai' },
    ],
    manager: [
        { label: 'Tổng quan', icon: 'dashboard', path: '/manager/dashboard' },
        { label: 'POS', icon: 'add_shopping_cart', path: '/manager/create-order' },
        { label: 'Đơn hàng của tôi', icon: 'history', path: '/manager/my-orders' },
        { label: 'Thực đơn hôm nay', icon: 'today', path: '/manager/daily-menu' },
        { label: 'Thực đơn theo lịch', icon: 'calendar_month', path: '/manager/scheduled-menu' },
        { label: 'Tối ưu hóa AI', icon: 'auto_awesome', path: '/manager/ai' },
        { label: 'Đơn hàng', icon: 'receipt_long', path: '/manager/orders' },
        { label: 'Thanh toán', icon: 'payments', path: '/manager/payments' },
    ],
    staff: [
        { label: 'Tổng quan', icon: 'dashboard', path: '/staff/dashboard' },
        { label: 'POS', icon: 'point_of_sale', path: '/staff/pos' },
        { label: 'Đơn hàng của tôi', icon: 'history', path: '/staff/my-orders' },
    ],
};

export const ROLE_LABEL = {
    admin: 'Admin',
    manager: 'Canteen Manager',
    staff: 'Canteen Staff',
};