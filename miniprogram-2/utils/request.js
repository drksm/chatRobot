const baseURL = "https://aigkzy.com:9000"; // 替换为您的API域名

function request(options) {
  wx.reportEvent("chat_send_times", {
  })
  let startTime = Date.parse(new Date());  
  console.error(startTime)
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseURL + options.url,
      method: options.method || "POST",
      data: options.data || {},
      header: {
        "content-type": "application/json", // 设置默认请求头
        ...options.header, // 如果需要，在此处添加其他请求头
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          wx.reportEvent("chat_send_success_times", {
          })
          wx.reportEvent("chat_send_duration_time", {
            "duration_time": Date.parse(new Date()) - startTime
          })
          console.error(Date.parse(new Date()) - startTime)
          resolve(res.data);
        } else {
          // 可以在这里处理一些通用的错误逻辑
          console.error("请求失败: ", res);
          reject(res);
        }
      },
      fail: (err) => {
        console.error("网络错误: ", err);
        reject(err);
      },
    });
  });
}

module.exports = {
  request,
};
