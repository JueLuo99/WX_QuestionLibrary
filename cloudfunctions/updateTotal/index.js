// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var append = event.append
  if(append != null){
    const db = cloud.database();
    const _ = db.command;
    await db.collection("users").where({openid: event.userInfo.openId}).update({data:{total: _.inc(append)}});
    var today = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
    var d = await db.collection("AnswerRecords").where({_openid:wxContext.OPENID,date: today}).count();
    if(d.total==0){
      await db.collection("AnswerRecords").add({data:{_openid:wxContext.OPENID,date: today,correct:0,total:append}})
    }else{
      await db.collection("AnswerRecords").where({_openid:wxContext.OPENID,date: today}).update({data:{total:_.inc(append)}})
    }
    return {ok:"OK"}
  }else{
    return {
      event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
  }
}