// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  var res = await db.collection("WrongQuestions").where({_openid:wxContext.OPENID,tikuName:event.tikuName}).get()
  return {data:res.data}
}