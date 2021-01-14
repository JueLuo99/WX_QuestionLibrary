// miniprogram/pages/examHistory/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id)
    const db = wx.cloud.database()
    db.collection("ExamHistoryRecords").doc(options.id).field({
      time:false,
      _id:false,
      _openid:false,
      tiku:false
    }).get().then(res=>{
      this.setData({questions: res.data.record})
      wx.setNavigationBarTitle({
        title: '共 '+this.data.questions.length+" 题   答对 "+res.data.correct+" 题",
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})