Page({
  data: {
    categories: [], // 问题大类
    selectedCategoryId: null, // 当前选中的问题大类ID
    questions: [] // 详细问题列表
  },

  onLoad: function () {
    this.loadCategories();
  },

  // 模拟加载问题大类数据
  loadCategories: function () {
    const categories = [
      { id: 1, name: '大类1' },
      { id: 2, name: '大类2' },
      { id: 3, name: '大类3' },
      { id: 4, name: '大类4' },
    ];
    this.setData({ categories });
  },

  // 点击问题大类事件
  onCategoryTap: function (event) {
    const selectedCategoryId = event.currentTarget.dataset.id;
    this.setData({ selectedCategoryId });
    this.loadQuestions(selectedCategoryId);
  },

  onItemTap: function (event) {
    const menuItemContent = event.currentTarget.dataset.content;
    wx.setStorageSync('menu_item_content', menuItemContent);
    wx.switchTab({
      url: '/pages/chat/chat',
    });
  },

  // 模拟根据问题大类ID加载详细问题数据
  loadQuestions: function (categoryId) {
    const questions = [
      { id: 1, title: '详细问题1', categoryId: 1 },
      { id: 2, title: '详细问题2', categoryId: 1 },
      { id: 3, title: '详细问题3', categoryId: 1 },
      { id: 4, title: '详细问题4', categoryId: 2 },
      { id: 5, title: '详细问题5', categoryId: 2 },
      { id: 6, title: '详细问题6', categoryId: 3 },
      { id: 7, title: '详细问题7', categoryId: 3 },
      { id: 8, title: '详细问题8', categoryId: 4 },
      { id: 9, title: '详细问题9', categoryId: 4 },
    ];

    const filteredQuestions = questions.filter(item => item.categoryId === categoryId);
    this.setData({ questions: filteredQuestions });
  }
});
