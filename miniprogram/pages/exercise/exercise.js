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
    tikuName: "",
    recordIds: [],
    totalNum: 0,
    load: false,
    error: false
  },
  getQuestion: function(){
    wx.cloud.callFunction({
      name: "getExerciseQuestion",
      data:{tikuName: this.data.tikuName, recordIds: this.data.recordIds},
      success:res=>{
        if(res.result.data.length==0){
          wx.showModal({
            title:"已完成",
            content:"恭喜你已经完成本题库所有内容，是否重置数据重头开始？",
            cancelText:"否",
            confirmText:"是",
            success:res=>{
              if(res.confirm){
                this.setData({recordIds:[]})
                this.uploadAnswerRecord()
              }
              wx.navigateBack({
                delta: 0,
              })
            }
          })
          return;
        }
        this.data.questionList[0]["_id"] = res.result.data[0]["_id"];
        this.data.questionList[0]["question"] = res.result.data[0]["question"];
        this.data.questionList[0]["type"] = res.result.data[0]["type"];
        this.data.questionList[0]["choices"] = [];
        var tmpChoices = []
        for(var i=0;i<res.result.data[0]["choices"].length;i++){
          tmpChoices.push({"answers":res.result.data[0]["choices"][i],"isTrue":res.result.data[0]["answers"].indexOf(res.result.data[0]["choices"][i])>-1,"class":"choice","selected":false});
        }
        while(tmpChoices.length>0){
          var i = parseInt(Math.random()*tmpChoices.length)
          this.data.questionList[0]["choices"].push(tmpChoices[i])
          tmpChoices.splice(i,1)
        }
        this.data.questionList[0]["question"] = "[" + this.data.questionList[0]["type"] + "]" + this.data.questionList[0]["question"]
        this.data.questionList[0]["question"] = this.data.questionList[0]["question"].replace("[tf]","[判断题]").replace("[s]","[单选题]").replace("[m]","[多选题]")
        this.data.questionList[0]["answerNumber"] = res.result.data[0]["answers"].length;
        console.log(this.data.questionList);
        delete this.data.questionList[0].T
        this.setData({questionList:this.data.questionList});
        this.setData({end: false,submit: {"name":"提交","active":"submit"}});
      }
    })
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
    this.setData({error:false})
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
        this.data.recordIds.push(qlist[i]["_id"])
        this.setData({recordIds: this.data.recordIds})
        this.uploadAnswerRecord()
      }else{
        qlist[i]["T"] = false
        this.setData({error:true})
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
    const db = wx.cloud.database()
    db.collection(this.data.tikuName).count().then(res=>{
      this.setData({totalNum: res.total})
    })
    this.syncAnswerRecord();
  },
  // 获取历史答题记录
  syncAnswerRecord: function(){
    const db = wx.cloud.database()
    db.collection("ExerciseAnswerRecords").where({tiku: this.data.tikuName}).get().then(res=>{
      console.log("ExerciseAnswerRecords",res)
      if(res.data.length==0){
        db.collection("ExerciseAnswerRecords").add({data:{tiku: this.data.tikuName,ids:[]}})
        this.setData({recordIds: []})
      }else{
        this.setData({recordIds: res.data[0].ids})
      }
      if(!this.data.load){
        this.getQuestion();
        this.data.load = true;
      }
    })
  },
  // 上传历史答题记录
  uploadAnswerRecord: function(){
    wx.cloud.callFunction({
      name: "updateExerciseAnswerRecords",
      data:{recordIds: this.data.recordIds,tikuName: this.data.tikuName}
    })
  },
  addWrongQuestion: function(){
    const db = wx.cloud.database()
    db.collection("WrongQuestions").where({id:this.data.questionList[0]._id}).count().then(res=>{
      if(res.total==0){
        db.collection("WrongQuestions").add({data:{tikuName:this.data.tikuName,id:this.data.questionList[0]._id}}).then(res=>{
          wx.showToast({
            title: '添加成功'
          })
        })
      }
    })
  }
})