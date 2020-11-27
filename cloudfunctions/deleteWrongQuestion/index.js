// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  await db.collection("WrongQuestions").where({_openid:wxContext.OPENID,id:event.id,tikuName:event.tikuName}).remove()
  return {
    ok:"ok"
  }
}