Component({
  methods: {
    switchToChat() {
      wx.switchTab({
        url: '/pages/chat/chat',
      });
    },
    switchToDiscover() {
      wx.switchTab({
        url: '/pages/discover/discover',
      });
    },
  },
});
