const { request } = require("../../utils/request");

Page({
  usingComponents: {
    "tab-bar": "/components/tab-bar/tab-bar",
  },
  data: {
    inputValue: "",
    chatData: [],
    isRobotReplying: false,
    userAvatar:''
  },
  onLoad: function () {
    this.fetchChatData(); // 页面加载时获取聊天数据
  },

  fetchChatData: function () {
    // 从本地缓存获取聊天数据
    const chatData = wx.getStorageSync("chat_data") || [];
    this.setData({ chatData });
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
      sendButtonText: "生成中",
    });

    // 保存聊天数据到本地缓存
    wx.setStorageSync("chat_data", this.data.chatData);

    // 处理机器人的回复
    this.handleReply(inputValue);
  },
  handleReply: function (userMessage) {
    const { chatData } = this.data;

    this.setData({
      isRobotReplying: true,
    });

    request({
      url: "/", // 更新请求URL
      method: "POST",
      data: {
        user: {
          id: "001",
        },
        openai: {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: userMessage }],
          temperature: 0.7,
        },
      },
    })
      .then((response) => {
        console.log("接收到的回复: ", response);

        const robotReply = {
          id: chatData.length + 1,
          type: "robot",
          message: response.choices[0].message.content, // 直接使用响应数据作为回复内容
          timestamp: new Date(),
        };

        this.setData({
          chatData: [...chatData, robotReply],
          isRobotReplying: false,
          sendButtonText: "发送",
        });

        // 保存聊天数据到本地缓存
        wx.setStorageSync("chat_data", this.data.chatData);
      })
      .catch((err) => {
        console.error("发送消息失败: ", err);
        // 在此处处理失败的逻辑，如显示错误提示等
        this.setData({
          isRobotReplying: false,
          sendButtonText: "发送",
        });
      });
  },

  onShow: function () {
    const menuItemContent = wx.getStorageSync("menu_item_content");
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
