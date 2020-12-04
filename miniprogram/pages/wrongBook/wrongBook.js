// miniprogram/pages/wrongBook/wrongBook.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tikuName: "",
    UIQuestions: [],
    endIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载错题本',
    })
    this.setData({tikuName: options.tikuName})
    this.getWrongQuestions()
  },
  getWrongQuestions: function(){
    this.data.endIndex = 0
    this.data.UIQuestions = []
    wx.cloud.callFunction({
      name:"getWrongQuestions",
      data:{tikuName:this.data.tikuName},
      success: res=>{
        var ids = []
        for(var i=0;i<res.result.data.length;i++){
          ids.push(res.result.data[i].id)
        }
        console.log("IDS", ids)
        const db = wx.cloud.database()
        const _ = db.command
        db.collection(this.data.tikuName).where({_id:_.in(ids)}).get().then(res=>{
          if(res.data.length<1){
            this.setData({noMore:true})
          }
          for(var i=0;i<res.data.length;i++){
            this.data.endIndex += 1
            var newQuestion = {"question":"","choices":[],id:res.data[i]._id}
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
          wx.hideLoading({
            success: (res) => {},
          })
        })
      }
    })
  },
  deleteWrongQuestion: function(e){
    console.log(e.currentTarget.dataset.index)
    wx.showModal({
      title:"移除错题本",
      content:"确认移除此题？",
      confirmText:"确定",
      cancelText:"点错了",
      success:res=>{
        if(res.confirm){
          wx.cloud.callFunction({
            name:"deleteWrongQuestion",
            data:{id:this.data.UIQuestions[e.currentTarget.dataset.index].id,tikuName: this.data.tikuName},
            success: res=>{
              this.getWrongQuestions()
            }
          })
        }
      }
    })
  }
})