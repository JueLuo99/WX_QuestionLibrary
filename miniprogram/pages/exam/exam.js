// miniprogram/pages/exam/exam.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 单选题
    num_of_s: 20,
    // 多选题
    num_of_m: 10,
    // 判断题
    num_of_tf: 10,
    qs: [],
    tikuName: "WangAn",
    end: false
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
    this.setData({qs:[{"question":"Loading...","choices":[],"answerNumber":0}]})
    console.log("当前题库：" + this.data.tikuName)
    this.getQuestions()
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
    var cNum = 0
    var tNum = qlist.length
    for(var i=0; i<qlist.length; i++){
      var item = qlist[i]["choices"];
      var t = true;
      for(var n=0;n<item.length;n++){
        t = (item[n]["isTrue"] == item[n]["selected"]) && t
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
      if(t){
        cNum += 1
        qlist[i]["T"] = true
      }else{
        qlist[i]["T"] = false
      }
    }
    this.setData({qs:qlist});

    wx.cloud.callFunction({name: "updateCorrect",data:{append:cNum}})
    wx.cloud.callFunction({name: "updateTotal",data:{append:tNum}})
    wx.setNavigationBarTitle({title:"答题"+tNum+",正确"+cNum})
  },
  // 获取题目
  getQuestions: function(){
    const db = wx.cloud.database();
    const $ = db.command;
    var no = 0;
    this.data.qs = [];
    // 匹配对应的题库并从中抽取题目
    db.collection(this.data.tikuName).aggregate().match({type: "s"}).sample({size: this.data.num_of_s}).end().then(res=>{
      console.log("测试单选", res.list)
      for(var i=0;i<res.list.length;i++){
        no += 1
        var tItem = res.list[i]
        tItem.question = no + ". [单选题] " + tItem.question
        var choices = []
        var tmpChoices = []
        console.log("Choices",tItem["choices"],tItem["choices"].length)
        // for(var o=0;o<tItem["choices"].length;o++){
        //   choices.push({"answers":tItem["choices"][o],"isTrue":tItem["answers"].indexOf(tItem["choices"][o])>-1,"class":"choice","selected":false})
        // }
        while(tItem["choices"].length>0){
          var o = parseInt(Math.random()*tItem["choices"].length)
          choices.push({"answers":tItem["choices"][o],"isTrue":tItem["answers"].indexOf(tItem["choices"][o])>-1,"class":"choice","selected":false})
          tItem["choices"].splice(o,1)
        }
        tItem["choices"] = choices
        tItem["answerNumber"] = tItem["answers"].length
        this.data.qs.push(tItem)
      }
      db.collection(this.data.tikuName).aggregate().match({type: "m"}).sample({size: this.data.num_of_m}).end().then(res=>{
        console.log("测试多选", res.list)
        for(var i=0;i<res.list.length;i++){
          no += 1
          var tItem = res.list[i]
          tItem.question = no + ". [多选题] " + tItem.question
          var choices = []
          console.log("Choices",tItem["choices"],tItem["choices"].length)
          // for(var o=0;o<tItem["choices"].length;o++){
          //   choices.push({"answers":tItem["choices"][o],"isTrue":tItem["answers"].indexOf(tItem["choices"][o])>-1,"class":"choice","selected":false})
          // }
          while(tItem["choices"].length>0){
            var o = parseInt(Math.random()*tItem["choices"].length)
            choices.push({"answers":tItem["choices"][o],"isTrue":tItem["answers"].indexOf(tItem["choices"][o])>-1,"class":"choice","selected":false})
            tItem["choices"].splice(o,1)
          }
          tItem["choices"] = choices
          tItem["answerNumber"] = tItem["answers"].length
          this.data.qs.push(tItem)
        }
        db.collection(this.data.tikuName).aggregate().match({type: "tf"}).sample({size: this.data.num_of_tf}).end().then(res=>{
          console.log("测试判断", res.list)
          for(var i=0;i<res.list.length;i++){
            no += 1
            var tItem = res.list[i]
            tItem.question = no + ". [判断题] " + tItem.question
            var choices = []
            console.log("Choices",tItem["choices"],tItem["choices"].length)
            // for(var o=0;o<tItem["choices"].length;o++){
            //   choices.push({"answers":tItem["choices"][o],"isTrue":tItem["answers"].indexOf(tItem["choices"][o])>-1,"class":"choice","selected":false})
            // }
            while(tItem["choices"].length>0){
              var o = parseInt(Math.random()*tItem["choices"].length)
              choices.push({"answers":tItem["choices"][o],"isTrue":tItem["answers"].indexOf(tItem["choices"][o])>-1,"class":"choice","selected":false})
              tItem["choices"].splice(o,1)
            }
            tItem["choices"] = choices
            tItem["answerNumber"] = tItem["answers"].length
            this.data.qs.push(tItem)
          }
          this.setData({qs: this.data.qs})
        });
      });
    });
    
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