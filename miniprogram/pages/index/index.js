//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: '../../images/user-unlogin.png',
    usingTools: [
      [{
        "name": "练习",
        "active": "exercise",
        "type": 0
      }, {
        "name": "模拟",
        "active": "exam",
        "type": 0
      }],
      [{
        "name": "背题模式",
        "active": "remember",
        "type": 0
      }],
      [{
        "name": "扫一扫",
        "active": "QRScan",
        "type": 0
      }],
      [{
        "name": "客服",
        "type": 1
      }]
    ],
    allTiku: [],
    tikuData: [],
    tikuIndex: 0,
    openid: "",
    total: 0,
    correct: 0,
    isVerifiedUser: false,
    isTeacher: false
  },
  onShow: function () {
    if (this.data.openid != "") {
      this.getStats()
    }
  },
  getStats: function () {
    const db = wx.cloud.database()
    const $ = db.command
    db.collection('users').where({
      openid: this.data.openid
    }).get().then(res => {
      this.setData({
        total: res.data[0].total,
        correct: res.data[0].correct
      })
    })
  },
  exercise: function () {
    var tikuChineseName = this.data.tikuData[this.data.tikuIndex]
    var collection = ""
    for (var i = 0; i < this.data.allTiku.length; i++) {
      if (this.data.allTiku[i].name.indexOf(tikuChineseName) > -1) {
        collection = this.data.allTiku[i].collection
        break
      }
    }
    wx.navigateTo({
      url: '../exercise/exercise?tikuName=' + collection
    })
  },
  remember: function () {
    var tikuChineseName = this.data.tikuData[this.data.tikuIndex]
    var collection = ""
    for (var i = 0; i < this.data.allTiku.length; i++) {
      if (this.data.allTiku[i].name.indexOf(tikuChineseName) > -1) {
        collection = this.data.allTiku[i].collection
        break
      }
    }
    wx.navigateTo({
      url: '../remember/remember?tikuName=' + collection
    })
  },
  exam: function () {
    var tikuChineseName = this.data.tikuData[this.data.tikuIndex]
    var collection = ""
    for (var i = 0; i < this.data.allTiku.length; i++) {
      if (this.data.allTiku[i].name.indexOf(tikuChineseName) > -1) {
        collection = this.data.allTiku[i].collection
        break
      }
    }
    wx.navigateTo({
      url: '../exam/exam?tikuName=' + collection
    })
  },

  // 实时响应切换题库
  changeTiku: function (e) {
    this.setData({
      tikuIndex: e.detail.value
    })
  },

  // 找到题库与数据库名的对应关系
  getAllTiku: function () {
    const db = wx.cloud.database();
    const $ = db.command;
    db.collection('tikuName').get().then(res => {
      // res.data 包含该记录的数据
      console.log("拉取全部题库：", res.data)
      this.setData({
        allTiku: res.data
      })
      this.getTiku();
    });
  },

  // 获取当前用户有权限的题库列表
  getTiku: function () {
    const db = wx.cloud.database()
    const $ = db.command
    db.collection('users').where({
      openid: this.data.openid
    }).get().then(res => {
      console.log("用户所在组：", res.data)
      var d = []
      if (res.data.length == 0) {
        this.setData({
          isVerifiedUser: false
        })
        for (var i = 0; i < this.data.allTiku.length; i++) {
          if (this.data.allTiku[i]["collection"].indexOf("demo") > -1) {
            this.setData({
              tikuData: [this.data.allTiku[i]["name"]]
            })
          }
        }
        return ''
      }
      this.setData({
        isVerifiedUser: true
      })
      console.log("所在组数量：", res.data[0].group.length)
      for (var i = 0; i < res.data[0].group.length; i++) {
        for (var j = 0; j < this.data.allTiku.length; j++) {
          if (res.data[0].group[i].trim() == this.data.allTiku[j]["collection"].trim()) {
            d.push(this.data.allTiku[j]["name"])
          }
        }
      }
      console.log("用户可访问题库：", d)
      this.setData({
        total: res.data[0].total,
        correct: res.data[0].correct,
        isTeacher: res.data[0].isTeacher
      })
      this.setData({
        tikuData: d
      })
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  flashAnswerNumbers: function () {
    const db = wx.cloud.database()
    const $ = db.command
    db.collection('users').where({
      openid: this.data.openid
    }).get().then(res => {
      console.log("用户所在组：", res.data)
      if (res.data.length == 0) {
        this.setData({
          total: res.data[0].total,
          correct: res.data[0].correct
        })
      }
    })
    this.navigateToInfo()
  },
  navigateToInfo: function () {
    var tikuChineseName = this.data.tikuData[this.data.tikuIndex]
    var collection = ""
    for (var i = 0; i < this.data.allTiku.length; i++) {
      if (this.data.allTiku[i].name.indexOf(tikuChineseName) > -1) {
        collection = this.data.allTiku[i].collection
        break
      }
    }
    wx.navigateTo({
      url: '../userInfo/userInfo?allCorrect=' + this.data.correct + "&allTotal=" + this.data.total + "&tikuName=" + collection,
    })
  },
  cutOpenid: function () {
    wx.setClipboardData({
      data: this.data.openid,
    })
    console.log("run CutOpenid")
  },
  onLoad: function () {
    // this.setData({ usingTools: [[]] })
    // 调用云函数获取用户的 openid
    wx.showLoading({
      title: '正在打开',
    })
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log("openid: ", res.result.openid)
        this.setData({
          openid: res.result.openid
        })
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
              this.setData({
                isGetInfo: true
              })
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

  getInfo: function (e) {
    this.setData({
      userInfo: e.detail.userInfo,
      avatarUrl: e.detail.userInfo.avatarUrl,
      isGetInfo: true
    })
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
  QRScan: function(e){
    wx.scanCode({
      onlyFromCamera: true,
      success: res=>{
        if(res.result.indexOf(':')>-1){
          switch(res.result.split(":")[0]){
            case "WIFI":
              var t = res.result.replace("WIFI:","");
              var l = t.split(';')
              var wifi = ""
              var password = ""
              for(var i=0;i<l.length;i++){
                if(l[i].split(':')[0]=="P"){
                  password = l[i].split(':')[1]
                }else if(l[i].split(':')[0]=="S"){
                  wifi = l[i].split(':')[1]
                }
              }
              wx.showModal({
                title: "检测到Wifi",
                content: "Wifi:"+wifi+"\nPassword:"+password,
                confirmText: "复制密码",
                cancelText: "不要密码",
                success: res=>{
                  if(res.confirm){
                    wx.setClipboardData({
                      data: password,
                    })
                  }
                }
              })
              break;
            case "TiKuLogin": 
              if(this.data.isTeacher){
                var __id=res.result.split(":")[1]
                wx.showModal({
                  title: "确定要登陆？",
                  confirmText:"登陆",
                  cancelText:"取消",
                  success: res => {
                    if (res.confirm) {
                      wx.cloud.callFunction({
                        name: "teacherLogin",
                        data: {id:__id},
                        success: res=>{
                          wx.showToast({
                            title: '登陆成功',
                          })
                        }
                      })
                    }else{
                      wx.showToast({
                        title: '你取消了登陆！',
                        icon: "none"
                      })
                    }
                  }
                })
              }else{
                wx.showToast({
                  title: '账号无权限登陆！',
                  icon: "none"
                })
              }
              break;
            case "TiKuInvitation":
              var __id=res.result.split(":")[1]
              var tikuname = ""
              var tiku = ""
              for(var i=0;i<this.data.allTiku.length;i++){
                if(this.data.allTiku[i]._id==__id){
                  tikuname = this.data.allTiku[i].name
                  tiku = this.data.allTiku[i].collection
                }
              }
              if(this.data.tikuData.indexOf(tikuname)>-1){
                wx.showToast({
                  title: '你已经在 '+tikuname+" 题库中了！" ,
                  icon: 'none'
                })
                return
              }
              wx.showModal({
                title: "添加题库",
                content:"确定加入"+tikuname+"题库？",
                confirmText:"加入",
                cancelText:"取消",
                success: res => {
                  if (res.confirm) {
                    wx.cloud.callFunction({
                      name: 'joinTiku',
                      data: {tiku: tiku},
                      success: res=>{
                        wx.showToast({
                          title: '加入成功',
                        })
                      }
                    })
                  }else{
                    wx.showToast({
                      title: '你放弃了加入'+tikuname+'！',
                      icon: "none"
                    })
                  }
                }
              })
              break;
          }
        }
      }
    })
  },
  onPullDownRefresh: function (e) {}
})