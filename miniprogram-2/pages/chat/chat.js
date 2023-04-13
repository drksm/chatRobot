const { request } = require("../../utils/request");

Page({
  usingComponents: {
    "tab-bar": "/components/tab-bar/tab-bar",
  },
  data: {
    inputValue: "",
    chatData: [],
    userAvatar: "",
    sendButtonText: "发送",
    messageWithCursor: "",
    chatListHeight: 0, 
    chatListPaddingBottom: 0,
    animationDuration: 300, // 设置动画持续时间（毫秒）
    scrollAnimationDuration: 1000,
    requestPromise: null,
  },
  abortRequest: function () {
    const { requestPromise, chatData } = this.data;
    if (requestPromise) {
      requestPromise.abort(); // 取消请求
      this.setData({
        requestPromise: null,
      });
      // 如果最后一条消息是空的机器人回复，将其移除
      if (chatData.length > 0 && chatData[chatData.length - 1].type === 'robot' && chatData[chatData.length - 1].message === '') {
        chatData.pop();
        this.setData({
          chatData: chatData
        });
        // 保存聊天数据到本地缓存
        wx.setStorageSync("chat_data", chatData);
      }
    }
  },
  removeEmptyReply: function () {
    const { chatData } = this.data;
    if (chatData.length > 0 && chatData[chatData.length - 1].type === 'robot' && chatData[chatData.length - 1].message === '') {
      chatData.pop();
      this.setData({
        chatData: chatData
      });
      // 保存聊天数据到本地缓存
      wx.setStorageSync("chat_data", chatData);
    }
  },
  onLoad: function () {
    this.fetchChatData(); // 页面加载时获取聊天数据
    this.updateChatListHeight(); // 在页面加载时更新 chatListHeight
    const welcomeMessage = {
      id: 0,
      type: "robot",
      message: "您好，欢迎使用袋鼠AI，请输入您的指令，由于延迟问题，部分内容可能生成失败",
      timestamp: new Date(),
      showCursor: false,
    };
    this.removeEmptyReply();
    const { chatData } = this.data;
    chatData.push(welcomeMessage);
    this.setData({
      chatData: chatData,
    });
    console.log(this.data.chatData)
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
  
    const textarea = e.detail.value.split("\n").length; // 计算换行符数量
    const lineHeight = 20; // 设置行高（根据wxss中的line-height值）
    const minHeight = 40; // 设置最小高度
    const maxHeight = 120; // 设置最大高度
  
    const inputHeight = Math.min(maxHeight, Math.max(minHeight, lineHeight * textarea));
    this.setData({
      inputHeight: inputHeight,
    });
  
    const chatListPaddingBottom = inputHeight - minHeight;
    this.setData({
      chatListPaddingBottom: chatListPaddingBottom,
    });
  
    this.updateChatListHeight(); // 在输入框高度发生变化时更新 chatListHeight
  },
  
  updateChatListHeight: function () {
    const query = wx.createSelectorQuery();
    query.select(".input-container").boundingClientRect();
    query.exec((res) => {
      const inputContainerHeight = res[0].height;
      const windowHeight = wx.getSystemInfoSync().windowHeight;
      const chatListHeight = windowHeight - inputContainerHeight;
      this.setData({
        chatListHeight: chatListHeight,
      });
    });
  },
  
  adjustInputHeight: function (e) {
    const { lineHeight = 1.2, paddingBottom = 10, paddingTop = 10 } = this.data;
    const height = (e.detail.lineCount * lineHeight + paddingTop + paddingBottom) * 10;
  
    this.setData({
      inputHeight: height
    });
  },
  
  onSend: function () {
    const app = getApp();
    if (app.globalData.isRequesting) {
      wx.showToast({
        title: '请等待当前问题完成',
        icon: 'none',
        duration: 2000
      });
      return;
    }
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
    this.scrollToBottom(this.data.animationDuration);
  },
  handleReply: function (userMessage) {
    const { chatData } = this.data;
    const app = getApp();
    // 设置一个超时标记
    let isTimeout = false;
    // 设置一个30秒的计时器
    const timer = setTimeout(() => {
      isTimeout = true; // 标记请求已超时
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
    app.globalData.isRequesting = true; // 请求开始前设置为 true
    const requestPromise =request({
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
      app.globalData.isRequesting = false; // 请求完成后设置为 false
      this.setData({ requestPromise: null }); // 清除 requestPromise
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
        });
        // 调用typeMessage方法逐字显示回复内容
        this.typeMessage(robotReply.message, chatData.length - 1);
    })
    .catch((err) => {
      app.globalData.isRequesting = false; // 请求完成后设置为 false
      this.setData({ requestPromise: null }); // 清除 requestPromise
        // 清除计时器
        clearTimeout(timer);
        // 如果请求已超时，不处理错误
        if (isTimeout) {
          return;
        }
        console.error("发送消息失败: ", err);
        // 在此处处理失败的逻辑，如显示错误提示等
        const robotReply = {
          id: chatData.length,
          type: "robot",
          message: '发送失败，请稍后重试',
          timestamp: new Date(),
          height: 100,
          showCursor: false,
        };
        chatData[chatData.length - 1] = robotReply;
        this.setData({
          chatData: chatData,
        });S
        // 调用typeMessage方法逐字显示回复内容
        this.typeMessage(robotReply.message, chatData.length - 1);
    });
    this.setData({
      requestPromise: requestPromise,
    });
  },
  onUnload: function () {
    this.abortRequest();
    this.setData({ requestPromise: null }); // 清除 requestPromise
    this.removeEmptyReply();
  },

  onHide: function () {
    this.abortRequest();
    this.setData({ requestPromise: null }); // 清除 requestPromise
    this.removeEmptyReply();
  },
  
// 修改typeMessage方法
typeMessage: function (message,robotReplyIndex) {
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
    const updatedChatData = this.data.chatData;
    updatedChatData[robotReplyIndex].message = this.data.chatData[robotReplyIndex].message + char;
    this.setData({
      chatData: updatedChatData,
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

  scrollToBottom: function (duration) {
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select(".chat-list").boundingClientRect();
      query.exec((res) => {
        const chatListHeight = res[0].height;
        this.setData({ scrollTop: chatListHeight });
      });
    }, 100);
  },
  
  onInputFocus: function () {
    console.log("onInputFocus")
    this.scrollToBottom(this.data.animationDuration);
  },
});
