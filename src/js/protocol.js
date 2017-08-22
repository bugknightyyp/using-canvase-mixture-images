;(function(global){
  var customUnderwearProto = global['customUnderwearProto'] = {};


  customUnderwearProto.DESIGN_ID_PARAM = 'did';
  customUnderwearProto.NO_DESIGN_ID = 0;
  customUnderwearProto.CODE_PARAM = "code";
  customUnderwearProto.STATE_PARAM = "state";
  customUnderwearProto.HOME_PARAM = "h";


  customUnderwearProto.REQUEST_ERROR_TIP = "出错了，请重试。";
  customUnderwearProto.REQUEST_ERROR_REOPEN_TIP = "出错了，请重新打开当前链接。";


  customUnderwearProto.SET_WC_CODE_URL = domain + "/CustomUnderwear/set_wx_code";
  customUnderwearProto.LOGIN_URL = domain + "/CustomUnderwear/login";
  customUnderwearProto.GET_TOP_LIST_URL = domain + "/CustomUnderwear/get_top_list";
  customUnderwearProto.PUBLISH_DESIGN_URL = domain + "/CustomUnderwear/publish_design";
  customUnderwearProto.VOTE_URL = domain + "/CustomUnderwear/vote";
  customUnderwearProto.GET_DESIGN_URL = domain + "/CustomUnderwear/get_design";
  customUnderwearProto.UPLOAD_MEDIA_URL = domain + "/CustomUnderwear/upload_wx_media";
  /* js entry */
  customUnderwearProto.main = function(){
    if (sessionStorage.customUnderwearIsLogin && 1 == sessionStorage.customUnderwearIsLogin){

      return;
    }

    if (localStorage.customUnderwearOpenId && 0 < localStorage.customUnderwearOpenId.length){
      // already access, request user info
      customUnderwearProto.login(localStorage.customUnderwearOpenId);
    }else{
      var isHome = util.getIntParam(customUnderwearProto.HOME_PARAM, 0);
      // not access
      if (isHome || (sessionStorage.customUnderwearStartAccess
          && 1 == sessionStorage.customUnderwearStartAccess)){
        customUnderwearProto.setWxCode();
      }
    }
  };

  customUnderwearProto.checkAccess = function(){
    var isHome = util.getIntParam(customUnderwearProto.HOME_PARAM, 0);
    // alert("checkAccess isHome: " + isHome);
    // alert("checkAccess sessionStorage.customUnderwearStartAccess: " + sessionStorage.customUnderwearStartAccess);

    if (0 == isHome &&
        (!sessionStorage.customUnderwearStartAccess || 1 != sessionStorage.customUnderwearStartAccess) &&
        (!localStorage.customUnderwearOpenId || 0 == localStorage.customUnderwearOpenId.length)){
      customUnderwearProto.goToWxAccessPage();
    }
  };

  customUnderwearProto.goToWxAccessPage = function(){
    // TODO: log
    // alert("goToWxAccessPage");
    sessionStorage.customUnderwearStartAccess = 1;
    location.href = customUnderwearProto.makeWxAccessPage(location.href);
  };

  customUnderwearProto.makeWxAccessPage = function(redirectUri){
    var wxAccessUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbb5f8f68dfc90d6c&redirect_uri=" + encodeURIComponent(redirectUri) + "&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";
    return wxAccessUrl;
  };

  // 1001
  customUnderwearProto.setWxCode = function(){
    var wxCode = util.getStringParam("code", "");

    if ("" == wxCode){
        alert("微信授权登陆出错。");
        return;
    }

    var did = util.getIntParam(customUnderwearProto.DESIGN_ID_PARAM, customUnderwearProto.NO_DESIGN_ID);
    var requestUrl = customUnderwearProto.SET_WC_CODE_URL + "/" + wxCode + "/" + did;
    // TODO: log
    // alert("setWxCode requestUrl: " + requestUrl);
    util.sendRequestByGet(requestUrl, customUnderwearProto.setWxCodeResp, customUnderwearProto.setWxCodeErrorResp);
  };

  customUnderwearProto.login = function(openId){
    var did = util.getIntParam(customUnderwearProto.DESIGN_ID_PARAM, customUnderwearProto.NO_DESIGN_ID);
    var requestUrl = customUnderwearProto.LOGIN_URL + "/" + encodeURIComponent(openId) + "/" + did;
    // TODO: log
    // alert("login requestUrl: " + requestUrl);
    util.sendRequestByGet(requestUrl, customUnderwearProto.setWxCodeResp, customUnderwearProto.setWxCodeErrorResp);
  };

  // 1002
  customUnderwearProto.setWxCodeResp = function(responseData){
    // TODO: log
    // alert("setWxCodeResp");
    if (responseData["uid"] && 0 == responseData["uid"]){
      alert(customUnderwearProto.REQUEST_ERROR_REOPEN_TIP);
      return;
    }

    sessionStorage.customUnderwearUserInfo = JSON.stringify(responseData);
    // write localStorage
    localStorage.customUnderwearOpenId = responseData["uid"];
    // write sessionStorage
    sessionStorage.customUnderwearIsLogin = 1;

    // game over
    if (1 == responseData["is_game_over"]){
        // TODO: 跳到蜜豆公众号的文章
        // location.href = "./ending.html";
        return;
    }

    // TODO: log
    // util.printResponse(responseData);
  };

  customUnderwearProto.setWxCodeErrorResp = function(){
    alert(customUnderwearProto.REQUEST_ERROR_REOPEN_TIP);
  };

  customUnderwearProto.updateWindowUrl = function(designId){
    var newUrl = location.href;
    // delete code & state & did & h parameter
    newUrl = util.removeURLParameter(newUrl, customUnderwearProto.CODE_PARAM);
    newUrl = util.removeURLParameter(newUrl, customUnderwearProto.STATE_PARAM);
    newUrl = removeURLParameter(newUrl, customUnderwearProto.DESIGN_ID_PARAM);
    newUrl = removeURLParameter(newUrl, customUnderwearProto.HOME_PARAM);

    // add "did=<design_id>" parameter to current url.
    newUrl = util.updateQueryStringParameter(newUrl, customUnderwearProto.DESIGN_ID_PARAM, designId);
    newUrl = updateQueryStringParameter(newUrl, customUnderwearProto.HOME_PARAM, 0);
    /* 该方法在微信里“复制链接”不起作用，“分享到朋友圈”起作用 */
    window.history.replaceState(local.html, local.title, newUrl);
  };

  // 1003
  customUnderwearProto.getTopList = function(pageIndex, count, callback){
    var requestUrl = customUnderwearProto.GET_TOP_LIST_URL + "/" + encodeURIComponent(localStorage.customUnderwearOpenId) + "/" + pageIndex + "/" + count ;
    // TODO: log
    // alert("requestUrl: " + requestUrl);
    util.sendRequestByGet(requestUrl, callback, customUnderwearProto.getTopListErrorResp);
  };

  customUnderwearProto.getTopListErrorResp = function(){
    alert(customUnderwearProto.REQUEST_ERROR_TIP);
  };

  // 1007
  customUnderwearProto.publishDesign = function(image, callback){
    var requestUrl = customUnderwearProto.PUBLISH_DESIGN_URL + "/" + encodeURIComponent(localStorage.customUnderwearOpenId)
    var data = 's=0&i=' + encodeURIComponent(image);
    // TODO: log
    // alert("requestUrl: " + requestUrl);
    util.sendRequestByPost(requestUrl, data, callback, customUnderwearProto.publishDesignErrorResp);
  };

  // customUnderwearProto.publishDesignResp = function(responseData){
  //   if (1 != responseData["r"] || 0 != responseData["rea"]){
  //     alert(customUnderwearProto.REQUEST_ERROR_TIP);
  //   }else{
  //     customUnderwearProto.updateWindowUrl(responseData['did']);
  //     alert("发布成功。");
  //   }
  // };

  customUnderwearProto.publishDesignErrorResp = function(){
    alert(customUnderwearProto.REQUEST_ERROR_TIP);
  };

  // 1011
  customUnderwearProto.vote = function(designId, callback){
    var requestUrl = customUnderwearProto.VOTE_URL + "/" + encodeURIComponent(localStorage.customUnderwearOpenId) + "/" + designId;
    // TODO: log
    // alert("requestUrl: " + requestUrl);
    util.sendRequestByGet(requestUrl, callback, customUnderwearProto.voteErrorResp);
  };

  customUnderwearProto.voteErrorResp = function(){
    alert(customUnderwearProto.REQUEST_ERROR_TIP);
  };

  // 1013
  customUnderwearProto.getDesign = function(designId, callback){
    var requestUrl = customUnderwearProto.GET_DESIGN_URL + "/" + encodeURIComponent(localStorage.customUnderwearOpenId) + "/" + designId;
    // TODO: log
    // alert("requestUrl: " + requestUrl);
    util.sendRequestByGet(requestUrl, callback, customUnderwearProto.getDesignErrorResp);
  };

  customUnderwearProto.getDesignErrorResp = function(){
    alert(customUnderwearProto.REQUEST_ERROR_TIP);
  };
  customUnderwearProto.uploadMedia = function(mediaId, callback){
    var requestUrl = customUnderwearProto.UPLOAD_MEDIA_URL + "/" + mediaId;
    util.sendRequestByGet(requestUrl, callback, customUnderwearProto.voteErrorResp);
  };
})(this);
