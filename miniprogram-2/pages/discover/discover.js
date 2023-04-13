Page({
  data: {
    categories: [], // 问题大类
    selectedCategoryId: 1, // 当前选中的问题大类ID
    questions: [] // 详细问题列表
  },

  onLoad: function () {
    this.loadCategories();
  },

  // 模拟加载问题大类数据
  loadCategories: function () {
    const categories = [
      { id: 1, name: '数据资料'},
      { id: 2, name: '文案生成' },
      { id: 3, name: '生活咨询' },
    ];
    this.setData({ categories });
    this.setData({ selectedCategoryId: 1 });
    this.loadQuestions(selectedCategoryId);
  },

  // 点击问题大类事件
  onCategoryTap: function (event) {
    const selectedCategoryId = event.currentTarget.dataset.id;
    this.setData({ selectedCategoryId });
    this.loadQuestions(selectedCategoryId);
  },

  onItemTap: function (event) {
    const app = getApp();
    if (app.globalData.isRequesting) {
      return;
    }
  
    app.globalData.isRequesting = true;
    const menuItemContent = event.currentTarget.dataset.id;
    wx.setStorageSync("menu_item_content", menuItemContent);
    wx.switchTab({
      url: "/pages/chat/chat",
      success: () => {
        setTimeout(() => {
          app.globalData.isRequesting = false;
        }, 1000);
      },
    });
  },
  
  // 模拟根据问题大类ID加载详细问题数据
  loadQuestions: function (categoryId) {
    const questions = [
      { id: 1, title: '北京市公务员近10年每年平均工资多少，平均涨幅多少？', categoryId: 1 },
      { id: 2, title: '帮我写一篇100字的文章，标题是提升客户信用假设指标', categoryId: 1 },
      { id: 3, title: '列举目前城投企业债务违约情况', categoryId: 1 },
      { id: 4, title: '大理文旅产业的现状分析，难点分析，突破策略是什么', categoryId: 1 },
      { id: 5, title: '输出一段高点赞和评论的关于女包的小红书种草文案', categoryId: 2 },
      { id: 6, title: '写出抖音渠道理想汽车L8营销文案，要求营造家庭使用舒适，空间巨大的特点', categoryId: 2 },
      { id: 7, title: '大专升如何就业', categoryId: 3 },
      { id: 8, title: '程序员面对35岁危机的处理办法', categoryId: 3 },
    ];

    const filteredQuestions = questions.filter(item => item.categoryId === categoryId);
    this.setData({ questions: filteredQuestions });
  }
});
