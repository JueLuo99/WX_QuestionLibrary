// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var append = event.append
  if(append != null){
    const db = cloud.database();
    db.collection("users").where({openid: event.userInfo.openId}).get().then(res => {
      console.log("当前正确值", res.data[0].correct)
      var correct = res.data[0].correct + append
      db.collection("users").where({openid: event.userInfo.openId}).update({data:{correct: correct}})
      return {ok:"OK"}
    })
  }else{
    return {
      event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
  }
}