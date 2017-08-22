;(function(global){
  var util = global['util'] = {};



  this.isAndroid = /android/i.test(navigator.userAgent)? true : false;
  this.isIphone = /ipad|iphone|mac/i.test(navigator.userAgent)? true : false;

  util.AJAX_TIMEOUT = 60000;

  util.getImg = function(src, callback) {
    callback = callback || function(){};

			var img;
      img = new Image();
      img.src = src;

      if(img.complete ){
        callback.call(img, null);
      } else {
        img.onload = function(){
          callback.call(img, null);
        };

        img.onerror = function(){
          callback.call(img, '加载图片：' + src + '出错');
        };
      }
  };
  util.getImgs = function(srcs, callback){
      var len = srcs.length;
      var imgs = [];
      srcs.forEach(function(item, index){
        util.getImg(item, function(err){
          if (!err) {
            imgs[index] = this;
            if (--len < 1) {
              callback.apply(null, imgs);
            }
          } else {
            alert(err);
          }
        })
      })
    };

  util.getIntParam = function(paramName,defaultValue){
    var v = parseInt(util.getUrlParam(paramName));
    if(!isNaN(v)){
      return v;
    }else{
      return defaultValue;
    }
  };

  util.getStringParam = function(paramName,defaultValue){
    var v = util.getUrlParam(paramName);
    if(v != ''){
      return v;
    }else{
      return defaultValue;
    }
  };

  util.getUrlParam = function(param){
    var url = location.href;
    var c_mark = url.indexOf("#");

    if(c_mark != -1)
      url = url.substring(0,c_mark);

    var q_mark = url.indexOf("?");

    if(q_mark == -1)
      return "";

    var paraString = url.substring(q_mark+1,url.length).split("&");
    var paraObj = {};

    for(i=0; j=paraString[i]; i++){
      paraObj[j.substring(0,j.indexOf("=")).toLowerCase()] =
              j.substring(j.indexOf("=")+1,j.length);
    }

    var returnValue = paraObj[param.toLowerCase()];

    if("undefined" == typeof(returnValue)){
      return "";
    }else{
      return returnValue;
    }
  };

  util.updateQueryStringParameter = function(uri, key, value){
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";

    if (uri.match(re)){
      return uri.replace(re, '$1' + key + "=" + value + '$2');
    }else{
      return uri + separator + key + "=" + value;
    }
  };

  util.removeURLParameter = function(url, parameter){
    //prefer to use l.search if you have a location/link object
    var urlparts= url.split('?');
    if (urlparts.length>=2){
      var prefix= encodeURIComponent(parameter)+'=';
      var pars= urlparts[1].split(/[&;]/g);

      //reverse iteration as may be destructive
      for (var i= pars.length; i-- > 0;){
        //idiom for string.startsWith
        if (pars[i].lastIndexOf(prefix, 0) !== -1){
          pars.splice(i, 1);
        }
      }

      if (0 < pars.length){
        url = urlparts[0]+'?'+pars.join('&');
      }else{
        url = urlparts[0];
      }

      return url;
    }else{
      return url;
    }
  };

  util.removeProtoFromUrl = function(url){
    var protoMatch = /^(https?):\/\//;
    return url.replace(protoMatch, '');
  };

  util.sendRequestByGet = function(requestUrl, successCallback, errorCallback){
    util.sendRequest(requestUrl, "GET", null, successCallback, errorCallback);
  };

  util.sendRequestByPost = function(requestUrl, data, successCallback, errorCallback){
    util.sendRequest(requestUrl, "POST", data, successCallback, errorCallback);
  };

  util.sendRequest = function(requestUrl, type, data, successCallback, errorCallback){
    $.ajax({
      url: requestUrl,
      dataType: "json",
      data: data,
      cache: false,
      timeout: util.AJAX_TIMEOUT,
      type: type,
      async: true,
      success:
        function(responseData, textStatus, jqXHR){
          if (successCallback){
            successCallback(responseData);
          }
        },
      error:
        function(jqXHR, textStatus, errorThrown){
          // TODO: log
          // alert("request error.");
          if (0 == textStatus.status && "abort" == textStatus.statusText){
            return;
          }

          if (errorCallback){
            errorCallback();
          }

          return;
        }
      });
  };

  util.printResponse = function(responseData){
    var respString = "";

    for (var key in responseData){
      respString += key + " => " + responseData[key] + "\n";
    }

    alert("responseData: \n" + respString);
  };
})(this);
