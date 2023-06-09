const baseURL = "https://5a427a3c-4ded-4a1f-8db8-4852c5f28fa5.mock.pstmn.io"; // 替换为您的API域名

function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseURL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "content-type": "application/json", // 设置默认请求头
        ...options.header, // 如果需要，在此处添加其他请求头
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
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
