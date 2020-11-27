//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: '../../images/user-unlogin.png',
    usingTools: [[{ "name": "练习", "active": "exercise", "type": 0 },{ "name": "模拟", "active": "exam", "type": 0 }],[{ "name": "背题模式", "active": "remember", "type": 0 }],[{ "name": "客服", "type": 1 }]],
    allTiku: [],
    tikuData: [],
    tikuIndex: 0,
    openid: "",
    total: 0,
    correct: 0,
    isVerifiedUser: false
  },
  onShow: function() {
    if(this.data.openid!=""){
      this.getStats()
    }
  },
  getStats: function() {
    const db = wx.cloud.database()
    const $ = db.command
    db.collection('users').where({ openid: this.data.openid }).get().then(res => {
      this.setData({total: res.data[0].total,correct: res.data[0].correct})
    })
  },
  exercise: function() {
    var tikuChineseName = this.data.tikuData[this.data.tikuIndex]
    var collection = ""
    for(var i=0;i<this.data.allTiku.length;i++){
      if(this.data.allTiku[i].name.indexOf(tikuChineseName)>-1){
        collection = this.data.allTiku[i].collection
        break
      }
    }
    wx.navigateTo({
      url: '../exercise/exercise?tikuName=' + collection
    })
  },
  remember:function(){
    var tikuChineseName = this.data.tikuData[this.data.tikuIndex]
    var collection = ""
    for(var i=0;i<this.data.allTiku.length;i++){
      if(this.data.allTiku[i].name.indexOf(tikuChineseName)>-1){
        collection = this.data.allTiku[i].collection
        break
      }
    }
    wx.navigateTo({
      url: '../remember/remember?tikuName=' + collection
    })
  },
  exam: function() {
    var tikuChineseName = this.data.tikuData[this.data.tikuIndex]
    var collection = ""
    for(var i=0;i<this.data.allTiku.length;i++){
      if(this.data.allTiku[i].name.indexOf(tikuChineseName)>-1){
        collection = this.data.allTiku[i].collection
        break
      }
    }
    wx.navigateTo({
      url: '../exam/exam?tikuName=' + collection
    })
  },
 
  // 实时响应切换题库
  changeTiku: function(e) {
    this.setData({ tikuIndex: e.detail.value })
  },

  // 找到题库与数据库名的对应关系
  getAllTiku: function() {
    const db = wx.cloud.database();
    const $ = db.command;
    db.collection('tikuName').get().then(res => {
      // res.data 包含该记录的数据
      console.log("拉取全部题库：", res.data)
      this.setData({ allTiku: res.data })
      this.getTiku();
    });
  },

  // 获取当前用户有权限的题库列表
  getTiku: function() {
    const db = wx.cloud.database()
    const $ = db.command
    db.collection('users').where({ openid: this.data.openid }).get().then(res => {
      console.log("用户所在组：", res.data)
      var d = []
      if (res.data.length == 0) {
        this.setData({isVerifiedUser:false})
        for(var i=0;i<this.data.allTiku.length;i++){
          if(this.data.allTiku[i]["collection"].indexOf("demo")>-1){
            this.setData({tikuData: [this.data.allTiku[i]["name"]]})
          }
        }
        return ''
      }
      this.setData({isVerifiedUser:true})
      console.log("所在组数量：", res.data[0].group.length)
      for (var i = 0; i < res.data[0].group.length; i++) {
        for (var j = 0; j < this.data.allTiku.length; j++) {
          if (res.data[0].group[i].trim() == this.data.allTiku[j]["collection"].trim()) {
            d.push(this.data.allTiku[j]["name"])
          }
        }
      }
      console.log("用户可访问题库：", d)
      this.setData({total: res.data[0].total,correct: res.data[0].correct})
      this.setData({ tikuData: d })
    })
  },
  flashAnswerNumbers: function(){
    const db = wx.cloud.database()
    const $ = db.command
    db.collection('users').where({ openid: this.data.openid }).get().then(res => {
      console.log("用户所在组：", res.data)
      if (res.data.length == 0) {
        this.setData({total: res.data[0].total,correct: res.data[0].correct})
      }
    })
    this.navigateToInfo()
  },
  navigateToInfo: function(){
    wx.navigateTo({
      url: '../userInfo/userInfo?allCorrect='+this.data.correct+"&allTotal="+this.data.total+"&tikuName="+this.data.allTiku[this.data.tikuIndex].collection,
    })
  },
  cutOpenid:function(){
    wx.setClipboardData({
      data: this.data.openid,
    })
    console.log("run CutOpenid")
  },
  onLoad: function() {
    // this.setData({ usingTools: [[]] })
    // 调用云函数获取用户的 openid
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log("openid: ", res.result.openid)
        this.setData({ openid: res.result.openid })
        // 拉取全部题库信息
        if (this.data.allTiku.length == 0) {
          this.getAllTiku()
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
              this.setData({ isGetInfo: true })
              // this.setData({
              //   usingTools: [
              //     [
              //       { "name": "练习", "active": "exercise", "type": 0 },
              //       { "name": "模拟", "active": "exam", "type": 0 }
              //     ],
              //     [
              //       { "name": "客服", "type": 1 }
              //     ]
              //   ]
              // })
            }
          })
        }
      }
    })
  },

  getInfo: function(e) {
    this.setData({ userInfo: e.detail.userInfo, avatarUrl: e.detail.userInfo.avatarUrl, isGetInfo: true })
    // this.setData({
    //     usingTools: [
    //       [
    //         { "name": "练习", "active": "exercise", "type": 0 },
    //         { "name": "模拟", "active": "exam", "type": 0 }
    //       ],
    //       [
    //         { "name": "客服", "type": 1 }
    //       ]
    //     ]
    //   })
    // 获取到并填充数据后自动刷新页面，避免用户手动刷新
    this.onPullDownRefresh()
  },

  onPullDownRefresh: function(e) {
  }
})