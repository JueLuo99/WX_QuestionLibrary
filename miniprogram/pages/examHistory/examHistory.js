// miniprogram/pages/examHistory/examHistory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    records: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.tikuName)
    const db = wx.cloud.database()
    db.collection("ExamHistoryRecords").where({tiku: options.tikuName}).orderBy("time","desc").get().then(res=>{
      for(var i in res.data){
        var record = {time: this.formatDate(res.data[i].time),total: res.data[i].record.length,correct: res.data[i].correct,id : res.data[i]._id}
        this.data.records.push(record)
      }

      this.setData({records: this.data.records})
    })
  },
  formatDate: function(d){
    var month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = '' + d.getHours(),
      minute = '' + d.getMinutes(),
      second = '' + d.getSeconds();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (minute.length < 2) minute = '0' + minute;
    if (second.length < 2) second = '0' + second;
    return [year, month, day].join('-')+" "+[hour,minute,second].join(":");
  },
  intoRecord: function(e){
    wx.navigateTo({
      url: './record?id='+e.currentTarget.dataset.id,
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