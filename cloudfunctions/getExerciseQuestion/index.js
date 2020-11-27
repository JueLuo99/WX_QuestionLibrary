// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command;
  res = await db.collection(event.tikuName).aggregate().match({_id: _.nin(event.recordIds)}).end()
  return {
    data: res.list
  }
}