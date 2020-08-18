// pages/question.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    questionInfo:{
      type: Object,
      value: {question:"",choices:[]},
    },
    isEnd: {
      type: Boolean,
      value: false,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    selectItem:function(d){
      if(this.data.isEnd){
        return;
      }
      var qlist = this.data.questionInfo;
      var qindex = d["currentTarget"]["dataset"]["qindex"];
      var cindex = d["currentTarget"]["dataset"]["cindex"];
      var status = qlist["choices"][cindex]["selected"];
      if(qlist["answerNumber"]==1){
        for(var i=0;i<qlist["choices"].length;i++){
          var s = qlist["choices"][i]["selected"];
          qlist["choices"][i]["selected"] = false;
          qlist["choices"][i]["class"] = "choice";
        }
        qlist["choices"][cindex]["selected"] = true;
        qlist["choices"][cindex]["class"] = "choice selected";
      }else{
        qlist["choices"][cindex]["selected"] = !status;
        if(!status){
          qlist["choices"][cindex]["class"] = "choice selected";
        }else{
          qlist["choices"][cindex]["class"] = "choice";
        }
      }
      this.setData({questionInfo: qlist});
      // 回调page
      this.triggerEvent("Choice",this.data.questionInfo)
    }
  }
})
