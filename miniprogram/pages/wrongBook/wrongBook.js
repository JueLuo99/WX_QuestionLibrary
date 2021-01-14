// miniprogram/pages/wrongBook/wrongBook.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tikuName: "",
    UIQuestions: [],
    ids: [],
    endIndex: 0,
    left: 0,
    flashNum:10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载错题本',
    })
    this.setData({
      tikuName: options.tikuName
    })
    this.getWrongQuestions()
  },
  getWrongQuestions: function () {
    this.data.endIndex = 0
    this.data.UIQuestions = []
    wx.cloud.callFunction({
      name: "getWrongQuestions",
      data: {
        tikuName: this.data.tikuName
      },
      success: res => {
        console.log(res.result)
        this.setData({ids: res.result})
        this.flashWrong()
      }
    })
  },
  flashWrong: function(){  
    wx.showLoading({
      title: '加载错题本',
    })
    const db = wx.cloud.database()
    const _ = db.command
    db.collection(this.data.tikuName).where({_id:_.in(this.data.ids.slice(this.data.endIndex,this.data.endIndex+this.data.flashNum))}).get().then(res=>{
      console.log(this.data.ids.slice(this.data.endIndex,this.data.endIndex+this.data.flashNum))
      var qs = res.data
      for(var i in qs){
        var newQuestion = {"question": "", "choices": [], id:qs[i]._id}
        newQuestion.question = ((this.data.endIndex + parseInt(i) + 1) + ".[" +qs[i].type + "] " +qs[i].question).replace("[tf]", "[判断题]").replace("[s]", "[单选题]").replace("[m]", "[多选题]")
        for (var ci = 0; ci <qs[i].choices.length; ci++) {
          if (qs[i].answers.indexOf(qs[i].choices[ci]) > -1) {
            newQuestion.choices.push({
              "answer":qs[i].choices[ci],
              "isAnswer": true
            })
          } else {
            newQuestion.choices.push({
              "answer":qs[i].choices[ci],
              "isAnswer": false
            })
          }
        }
        this.data.UIQuestions.push(newQuestion)
      }
      this.setData({
        UIQuestions: this.data.UIQuestions,
        endIndex: this.data.UIQuestions.length,
        left: this.data.ids.length - this.data.UIQuestions.length
      })
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  deleteWrongQuestion: function (e) {
    console.log(e.currentTarget.dataset.index)
    wx.showModal({
      title: "移除错题本",
      content: "确认移除此题？",
      confirmText: "确定",
      cancelText: "点错了",
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "deleteWrongQuestion",
            data: {
              id: this.data.UIQuestions[e.currentTarget.dataset.index].id,
              tikuName: this.data.tikuName
            },
            success: res => {
              this.getWrongQuestions()
            }
          })
        }
      }
    })
  }
})