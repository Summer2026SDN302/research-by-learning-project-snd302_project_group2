import mongoose from 'mongoose';
import User from './src/modules/user/user.model.js';
import Order from './src/modules/order/order.model.js';
import DailyMenu from './src/modules/menu/daily-menu/daily-menu.model.js';
import FoodItem from './src/modules/menu/food_item/food_item.model.js';

mongoose.connect('mongodb+srv://stallbox_admin:stallboxadmin@stallbox-cluster.xj1k0yp.mongodb.net/stallbox_db').then(async () => {
  const users = await User.find({});
  const nhatLA = users.find(u => {
    const un = u.username ? u.username.toLowerCase() : '';
    const fn = u.fullname ? u.fullname.toLowerCase() : '';
    return un === 'nhatla' || fn.includes('nhat');
  });
  if (!nhatLA) {
    console.log('User NhatLA not found.');
    process.exit(1);
  }
  
  const today = new Date();
  const dateStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
  const menu = await DailyMenu.findOne({ date: dateStr }).populate('items.foodItemId');
  
  const fallbackFood = await FoodItem.findOne();
  let availableItems = [];

  if (menu && menu.items.length > 0) {
    availableItems = menu.items.filter(i => i.status === 'Available');
    if (availableItems.length === 0) availableItems = menu.items;
  }
  
  const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  for(let i=0; i<15; i++) {
    // pick 1-3 random items
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subTotal = 0;

    for(let j=0; j<itemCount; j++) {
      if (availableItems.length > 0) {
        const item = availableItems[Math.floor(Math.random() * availableItems.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const price = item.currentPrice || item.originalPrice || 25000;
        items.push({
          foodItemId: item.foodItemId._id,
          name: item.foodItemId.name,
          quantity: qty,
          unitPrice: price,
          lineTotal: price * qty
        });
        subTotal += price * qty;
      } else {
        const qty = Math.floor(Math.random() * 2) + 1;
        const price = fallbackFood ? fallbackFood.defaultPrice : 25000;
        items.push({
          foodItemId: fallbackFood ? fallbackFood._id : new mongoose.Types.ObjectId(),
          name: fallbackFood ? fallbackFood.name : 'Món an demo',
          quantity: qty,
          unitPrice: price,
          lineTotal: price * qty
        });
        subTotal += price * qty;
      }
    }

    // subtract random days (0 to 5 days ago)
    const randomDaysAgo = Math.floor(Math.random() * 6);
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - randomDaysAgo);
    orderDate.setHours(Math.floor(Math.random() * 10) + 8); // 8 AM to 18 PM

    const newOrder = await Order.create({
      orderNumber: '#ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      customerName: 'Khách hàng ' + (i+1),
      customerPhone: '09012345' + (Math.floor(Math.random() * 90) + 10),
      orderDate: orderDate,
      orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
      subTotal: subTotal,
      totalAmount: subTotal,
      items: items,
      paymentId: null,
      staffId: nhatLA._id
    });
    console.log('Created order:', newOrder.orderNumber, 'Date:', orderDate.toLocaleDateString('vi-VN'));
  }
  
  console.log('Successfully created 15 sample orders.');
  process.exit(0);
}).catch(console.error);
