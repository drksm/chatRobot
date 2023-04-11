const { request } = require("../../utils/request");

Page({
  usingComponents: {
    "tab-bar": "/components/tab-bar/tab-bar",
  },
  data: {
    inputValue: "",
    chatData: [],
    isRobotReplying: false,
    userAvatar: "",
    sendButtonText: "发送",
    messageWithCursor: "",
  },
  onLoad: function () {
    this.fetchChatData(); // 页面加载时获取聊天数据
    const welcomeMessage = {
      id: 0,
      type: "robot",
      message: "您好，欢迎使用袋鼠AI，请输入您的指令，一般的判断大概需要30s，生成指令需要60s，由于延迟问题，部分内容可能生成失败",
      timestamp: new Date(),
      showCursor: false,
    };
  
    const { chatData } = this.data;
    chatData.push(welcomeMessage);
    this.setData({
      chatData: chatData,
    });
    
  },
  getUserInfo: function () {
    wx.getUserInfo({
      success: (res) => {
        this.setData({
          userAvatar: res.userInfo.avatarUrl, // 将头像URL存储在页面的data对象中
        });
      },
      fail: (err) => {
        console.error("获取用户信息失败: ", err);
      },
    });
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
    if (this.isRobotReplying) {
      return;
    }
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
  
    // 添加一个空的机器人回复
    const emptyRobotReply = {
      id: chatData.length + 2,
      type: "robot",
      message: "",
      timestamp: new Date(),
      showCursor: true,
    };
    this.setData({
      chatData: [...chatData, newMessage, emptyRobotReply],
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
  
    // 设置一个超时标记
    let isTimeout = false;
  
    // 设置一个30秒的计时器
    const timer = setTimeout(() => {
      isTimeout = true; // 标记请求已超时
      this.setData({
        isRobotReplying: false,
      });
  
      // 更新最后一条空的机器人回复为错误信息
      const errorReply = {
        id: chatData.length,
        type: "robot",
        message: "生成失败，请重新输入",
        timestamp: new Date(),
        showCursor: false,
      };
      chatData[chatData.length - 1] = errorReply;
      this.setData({ chatData: chatData });
    }, 60000);
  
    request({
      url: "/", // 更新请求URL
      method: "POST",
      data: {
        user: {
          id: "001",
          token: getApp().globalData.access_token,
          openid: getApp().globalData.openid,
        },
        openai: {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: userMessage }],
          temperature: 0.7,
        },
      },
    })
      .then((response) => {
        // 清除计时器
        clearTimeout(timer);
  
        // 如果请求已超时，不处理回复
        if (isTimeout) {
          return;
        }
  
        console.log("接收到的回复: ", response);
  
        const messageLength = response.length;
        let minHeight = 100;
        if (messageLength <= 50) {
          minHeight = 100;
        } else if (messageLength <= 100) {
          minHeight = 150;
        } else {
          minHeight = 200;
        }
  
        const robotReply = {
          id: chatData.length,
          type: "robot",
          message: response.choices[0].message.content, // 直接使用响应数据作为回复内容
          timestamp: new Date(),
          height: minHeight,
          showCursor: false,
        };
  
        // 更新最后一条空的机器人回复
        chatData[chatData.length - 1] = robotReply;
        this.setData({
          chatData: chatData,
          isRobotReplying: false,
        });
  
        // 调用typeMessage方法逐字显示回复内容
        this.typeMessage(robotReply.message);
      })
      .catch((err) => {
        // 清除计时器
        clearTimeout(timer);
  
        // 如果请求已超时，不处理错误
        if (isTimeout) {
          return;
        }
  
        console.error("发送消息失败: ", err);
        // 在此处处理失败的逻辑，如显示错误提示等
        this.setData({
          isRobotReplying: false,
        });
      });
  },
  
  
// 修改typeMessage方法
typeMessage: function (message) {
  const messageWithCursor = message.split("");
  this.setData({ messageWithCursor: "" });

  const typeChar = () => {
    if (messageWithCursor.length === 0) {
      this.setData({
        Replying: false,
        sendButtonText: "发送",
      });

      // 保存聊天数据到本地缓存
      wx.setStorageSync("chat_data", this.data.chatData);
      return;
    }

    const char = messageWithCursor.shift();
    this.setData({
      messageWithCursor: this.data.messageWithCursor + char,
    });

    setTimeout(typeChar, 100);
  };

  typeChar();
},

  onShow: function () {
    const menuItemContent = wx.getStorageSync("menu_item_content");
    if (menuItemContent) {
    // 将缓存的值设置为输入框的值
    this.setData({ inputValue: menuItemContent });
    // 以用户的身份发送输入框的内容
    this.onSend(menuItemContent);
    // 清除存储值，以便下次不会重复发送
    wx.removeStorageSync("menu_item_content");
    }
  },
});
