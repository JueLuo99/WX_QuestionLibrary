// miniprogram/pages/exam/exam.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qs: [],
    end: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var t = {"question":"这是亿个题目","choices":[{"answers":"这是选项A","isTrue":false,"class":"choice","selected":false},{"answers":"B","isTrue":true,"class":"choice","selected":false}],"answerNumber":1}
    for(var i=0;i<10;i++){
      this.data.qs.push(t)
    }
    this.setData({qs:this.data.qs})
  },
  // 监听事件，监听Component选择改变事件
  choice:function(e){
    console.log(e)
    this.data.qs[e.currentTarget.id] = e.detail
  },
  // 提交按钮
  submit:function(){

    // 已提交判断
    if(this.data.end){
      return null;
    }
    // 更新提交标记
    this.data.end = true;
    this.setData({end:this.data.end})
    // 数据处理
    var qlist = this.data.qs;
    for(var i=0; i<qlist.length; i++){
      var item = qlist[i]["choices"];
      for(var n=0;n<item.length;n++){
        if(item[n]["selected"]){
          if(item[n]["isTrue"]){
            if(qlist[i]["choices"][n]["class"].indexOf("true")<0){
              qlist[i]["choices"][n]["class"] = "choice true";
            }
          }else{
            if(qlist[i]["choices"][n]["class"].indexOf("false")<0){
              qlist[i]["choices"][n]["class"] = "choice false";
            }
          }
        }else{
          qlist[i]["choices"][n]["class"] = qlist[i]["choices"][n]["class"].replace(" true","").replace(" false","");
        }
        
        if(item[n]["isTrue"]){
          if(qlist[i]["choices"][n]["class"].indexOf("true")<0){
            qlist[i]["choices"][n]["class"] = "choice true";
          }
        }
      }
    }
    this.setData({qs:qlist});

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