const { request } = require("../../utils/request");

Page({
  usingComponents: {
    "tab-bar": "/components/tab-bar/tab-bar",
  },
  data: {
    inputValue: "",
    chatData: [],
  },
  onLoad: function () {
    this.fetchChatData(); // 页面加载时获取聊天数据
  },
  fetchChatData: function () {
    request({
      url: "", // 根据您的模拟API定义相应的请求URL
      method: "GET",
    })
      .then((data) => {
        console.log("获取聊天数据成功: ", data);
        // 在此处处理成功的逻辑，如更新页面数据等
      })
      .catch((err) => {
        console.error("获取聊天数据失败: ", err);
        // 在此处处理失败的逻辑，如显示错误提示等
      });
  },
  onInput: function (e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },
  onSend: function () {
    const { inputValue, chatData } = this.data;

    if (!inputValue.trim()) {
      wx.showToast({
        title: "请输入内容",
        icon: "none",
      });
      return;
    }

    // 添加用户的消息到聊天数据
    const newMessage = {
      id: chatData.length + 1,
      type: "user",
      message: inputValue,
      timestamp: new Date(),
    };
    this.setData({
      chatData: [...chatData, newMessage],
      inputValue: "",
    });

    // 处理机器人的回复
    this.handleReply(inputValue);
  },
  handleReply: function (userMessage) {
    const { chatData } = this.data;

    request({
      url: "/chat/send", // 根据您的API定义相应的请求URL
      method: "POST",
      data: { message: userMessage },
    })
      .then((response) => {
        console.log("接收到的回复: ", response);

        const robotReply = {
          id: chatData.length + 1,
          type: "robot",
          //message: response.data.message, // 根据实际API响应更新此处
          timestamp: new Date(),
        };

        this.setData({
          chatData: [...chatData, robotReply],
        });
      })
      .catch((err) => {
        console.error("发送消息失败: ", err);
        // 在此处处理失败的逻辑，如显示错误提示等
      });
  },
  onShow: function () {
    const menuItemContent = wx.getStorageSync('menu_item_content');
    if (menuItemContent) {
      // 将缓存的值设置为输入框的值
      this.setData({ inputValue: menuItemContent });
      // 以用户的身份发送输入框的内容
      this.onSend(menuItemContent);
      // 清除存储值，以便下次不会重复发送
      wx.removeStorageSync('menu_item_content');
    }
  },
  
  
});
