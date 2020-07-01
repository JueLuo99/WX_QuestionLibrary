//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: '../../images/user-unlogin.png',
    usingTools: [[{ "name": "联系", "active": "clickTeacherTable", "type": 0 }, { "name": "模拟", "active": "clicktable", "type": 0 }], [{ "name": "客服", "type": 1 }]]
  },
  onShow: function(){
    this.onPullDownRefresh()
  },
  onLoad: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
              this.setData({ isGetInfo: true })
            }
          })
        }
      }
    })

  }, 
  getInfo:function(e){
    this.setData({ userInfo: e.detail.userInfo, avatarUrl: e.detail.userInfo.avatarUrl, isGetInfo:true})
    // 获取到并填充数据后自动刷新页面，避免用户手动刷新
    this.onPullDownRefresh()
  },
  onPullDownRefresh: function(e){
  }
})
