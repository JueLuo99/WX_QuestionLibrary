// miniprogram/pages/userInfo/userInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _7DayDate: [],
    todayTotal: 0,
    todayCorrect: 0,
    allCorrect: 0,
    allTotal: 0,
    tikuName: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      allCorrect: options.allCorrect,
      allTotal: options.allTotal,
      tikuName: options.tikuName
    })
    this.get7dayInfo()
  },
  get7dayInfo: function () {
    var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const db = wx.cloud.database()
    db.collection("AnswerRecords").orderBy("date", 'desc').limit(7).get().then(res => {
      console.log(res)
      var _7 = res.data
      var maxTotal = 0;
      for (var i = 0; i < _7.length; i++) {
        maxTotal = maxTotal >= _7[i].total ? maxTotal : _7[i].total
        if (_7[i].date.getFullYear() == today.getFullYear() && _7[i].date.getDate() == today.getDate() && _7[i].date.getMonth() == today.getMonth()) {
          this.setData({
            todayCorrect: _7[i].correct,
            todayTotal: _7[i].total
          })
        }
      }
      var maxHeight = 200;
      for (var i = 0; i < _7.length; i++) {
        var TotalHeight = _7[i].total / maxTotal * 200
        var RedHeight = TotalHeight / _7[i].total * (_7[i].total - _7[i].correct)
        _7[i].TotalHeight = TotalHeight
        _7[i].RedHeight = RedHeight
        _7[i].date = (_7[i].date.getMonth() + 1) + "." + _7[i].date.getDate()
      }
      this.setData({
        _7DayDate: _7
      })
    })
  },
  gotoWrongBook: function () {
    wx.navigateTo({
      url: '../wrongBook/wrongBook?tikuName=' + this.data.tikuName,
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