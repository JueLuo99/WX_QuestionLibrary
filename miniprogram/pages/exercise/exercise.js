// miniprogram/pages/exercise/exercise.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 这个 List 里面存抽到的题目的 ID
    questionList: [{"question":"Loading...","choices":[],"answerNumber":1}],
    end: false,
    // 这个存放问题题干
    question: "1",
    // 这个存放问题选项
    choices: ["AA", "BB", "CC", "DD"],
    // 按钮设定
    submit: {"name":"提交","active":"submit"},
    tikuName: ""
  },
  getQuestion: function(){
    const db = wx.cloud.database({
      env: "tiku-na1fl"
    });
    const $ = db.command;
    db.collection(this.data.tikuName).aggregate().sample({size: 1}).end().then(res => {
      console.log(res.list);
      this.data.questionList[0]["question"] = res.list[0]["question"];
      this.data.questionList[0]["choices"] = [];
      for(var i=0;i<res.list[0]["choices"].length;i++){
        this.data.questionList[0]["choices"].push({"answers":res.list[0]["choices"][i],"isTrue":res.list[0]["answers"].indexOf(res.list[0]["choices"][i])>-1,"class":"choice","selected":false});
      }
      this.data.questionList[0]["answerNumber"] = res.list[0]["answers"].length;
      console.log(this.data.questionList);
      this.setData({questionList:this.data.questionList});
      this.setData({end: false,submit: {"name":"提交","active":"submit"}});
    });
  },
  selectItem:function(d){
    if(this.data.end){
      return;
    }
    var qlist = this.data.questionList;
    var qindex = d["currentTarget"]["dataset"]["qindex"];
    var cindex = d["currentTarget"]["dataset"]["cindex"];
    var status = qlist[qindex]["choices"][cindex]["selected"];
    if(qlist[qindex]["answerNumber"]==1){
      for(var i = 0;i<qlist[qindex]["choices"].length;i++){
        var s = qlist[qindex]["choices"][i]["selected"];
        qlist[qindex]["choices"][i]["selected"] = false;
        qlist[qindex]["choices"][i]["class"] = "choice";
      }
      qlist[qindex]["choices"][cindex]["selected"] = true;
      qlist[qindex]["choices"][cindex]["class"] = "choice selected";
    }else{
      qlist[qindex]["choices"][cindex]["selected"] = !status;
      if(!status){
        qlist[qindex]["choices"][cindex]["class"] = "choice selected";
      }else{
        qlist[qindex]["choices"][cindex]["class"] = "choice";
      }
    }
    this.setData({questionList: qlist});
  },
  next:function(){
    this.getQuestion();
  },
  submit: function(){
    if(this.data.end){
      return null;
    }
    this.data.end = true;
    this.setData({end:this.data.end})
    var qlist = this.data.questionList;
    var cNum = 0
    var tNum = qlist.length
    for(var i=0; i<qlist.length; i++){
      var item = qlist[i]["choices"];
      var t = true;
      var tN = 0;
      for(var n=0;n<item.length;n++){
        if(item[n]["selected"]){
          tN += 1
          if(item[n]["isTrue"]){
            if(qlist[i]["choices"][n]["class"].indexOf("true")<0){
              qlist[i]["choices"][n]["class"] = "choice true";
            }
          }else{
            if(qlist[i]["choices"][n]["class"].indexOf("false")<0){
              qlist[i]["choices"][n]["class"] = "choice false";
            }
            t = false
          }
        }else{
          qlist[i]["choices"][n]["class"] = qlist[i]["choices"][n]["class"].replace(" true","").replace(" false","");
        }
        
        if(item[n]["isTrue"]){
          if(qlist[i]["choices"][n]["class"].indexOf("true")<0){
            qlist[i]["choices"][n]["class"] = "choice true";
          }
        }
        if(tN!=qlist[i]["answerNumber"]){
          t = false
        }
      }
      if(t){
        cNum += 1
        qlist[i]["T"] = true
      }else{
        qlist[i]["T"] = false
      }
    }
    this.setData({questionList:qlist,submit: {"name":"下一题","active":"next"}});
    wx.cloud.callFunction({name: "updateCorrect",data:{append:cNum}})
    wx.cloud.callFunction({name: "updateTotal",data:{append:tNum}})
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.tikuName == null){
      wx.navigateBack()
    }else{
      this.setData({tikuName: options.tikuName})
    }
    this.getQuestion();
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