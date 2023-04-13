// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      method:'GET',
      data:{
        grant_type:"client_credential",
        appid:'wx62655b0030413312',
        secret:'a9772f4243bbbaf2aea159d88ffd491d'
      },
      success: function(res){
        getApp().globalData.access_token=res.data.access_token
      },
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
         wx.request({
           url: 'https://api.weixin.qq.com/sns/jscode2session',
           method:'GET',
           data:{
            appid:'wx62655b0030413312',
            secret:'a9772f4243bbbaf2aea159d88ffd491d',
            js_code:res.code,
            grant_type:'authorization_code'
           },
           success:function(r){
             getApp().globalData.openid=r.data.openid
             console.log(getApp().globalData)
           }
         })
      }
    })
  },
  globalData: {
    userInfo: null,
    openid:'',
    access_token:'',
    isRequesting: false,
  }
})
