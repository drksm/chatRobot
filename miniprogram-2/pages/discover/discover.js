const menuData = [
  {
    title: '水果',
    items: [
      { name: '苹果', content: '苹果' },
      { name: '桃子', content: '桃子' },
      { name: '葡萄', content: '葡萄' },
    ],
  },
  {
    title: '蔬菜',
    items: [
      { name: '白菜', content: '白菜' },
      { name: '胡萝卜', content: '胡萝卜' },
    ],
  },
];

Page({
  data: {
    menuData: menuData,
    showSubMenu: {
      '水果': false,
      '蔬菜': false,
    },
  },

  onMenuItemTap: function (event) {
    const menuItemContent = event.currentTarget.dataset.content;
    wx.setStorageSync('menu_item_content', menuItemContent);
    wx.switchTab({
      url: '/pages/chat/chat',
    });
  },
  
});
