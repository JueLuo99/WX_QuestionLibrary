// miniprogram/pages/remember/remember.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    endIndex: 0,
    UIQuestions: [],
    tikuName:"",
    noMore:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.tikuName == null){
      wx.navigateBack()
    }else{
      this.setData({tikuName: options.tikuName})
      this.updateData()
    }
  },
  updateData:function(){
    console.log("UpdateData is Run.")
    const db = wx.cloud.database();
    const $ = db.command;
    db.collection(this.data.tikuName).skip(this.data.endIndex).get().then(res=>{
      if(res.data.length<1){
        this.setData({noMore:true})
      }
      for(var i=0;i<res.data.length;i++){
        this.data.endIndex += 1
        var newQuestion = {"question":"","choices":[]}
        newQuestion.question = (this.data.endIndex+".["+ res.data[i].type +"] "+res.data[i].question).replace("[tf]","[判断题]").replace("[s]","[单选题]").replace("[m]","[多选题]")
        for(var ci=0;ci<res.data[i].choices.length;ci++){
          if(res.data[i].answers.indexOf(res.data[i].choices[ci])>-1){
            newQuestion.choices.push({"answer":res.data[i].choices[ci],"isAnswer":true})
          }else{
            newQuestion.choices.push({"answer":res.data[i].choices[ci],"isAnswer":false})
          }
        }
        this.data.UIQuestions.push(newQuestion)
      }
      this.setData({UIQuestions:this.data.UIQuestions})
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