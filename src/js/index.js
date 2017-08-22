
new Hammer(document.querySelector('#receive-container .opacity-layer'))
  .on('tap', function(ev) {
    ev.target.parentNode.style.display = 'none';
    pageSwiper.unlockSwipes();
  })

new Hammer(document.querySelector('#button-receive'))
  .on('tap', function() {
    document.querySelector('#receive-container').style.display = 'block';
    if (this.flag) return;
    // Initialize receive Swiper
    var receiveSwiper = new Swiper('#receive-wrap', {
          pagination: '.swiper-pagination-v',
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          paginationClickable: true,

          spaceBetween: 0,
      });

      this.flag = true;
      pageSwiper.lockSwipes();
  })

new Hammer(document.querySelector('#button-design'))
  .on('tap', function() {
    pageSwiper.slideNext();
  })



/***********
  custom underwear
****************/
var selectTemplate,
    operateTemplate;

/******
  页面翻页
********/
// function cloneImg() {
//   var arr = [];
//   for(var i = 0; i < arguments.length; i++) {
//     arr[i] = new Image();
//     arr[i].src = arguments[i].src;
//   }
//   return arr;
// }
var pageSwiper = new Swiper('#pages-container', {
          pagination: '.swiper-pagination-h',
          paginationClickable: true,
          direction: 'vertical',
          hashnav: true
      });


pageSwiper.on('onSlideChangeEnd', function(swiper) {
  //console.log(swiper.activeIndex)

 switch (swiper.activeIndex) {
   case 1:
   if (!selectTemplate) {
       selectTemplate = new customUnderwear(
             document.querySelector('#custom-container'));

       selectTemplate.btnSureCallback = function (ev) {
         pageSwiper.slideNext();
       };
       util.getImgs(['images/bg8.jpg', 'images/y1_01.png', 'images/p1.png', 'images/uw-sh-1.png'], function(){
         selectTemplate.create.apply(selectTemplate, arguments)
            .setTemplate(document.querySelector('#templates'))
            .bindSelectTmplEvent()
            .animEntry()
            //.animEntry();
        // btnSure.style.backgroundColor = '#' + color[1];
       })

     }
     break;
   case 2:
     if (!operateTemplate) {
       operateTemplate = new customUnderwear(
         document.querySelector('#operate-container'),
         selectTemplate.arcColor
       );
       util.getImgs([selectTemplate.bgImg.src, selectTemplate.uwImg.src, selectTemplate.uwOlImg.src, selectTemplate.uwShImg.src], function(){
         operateTemplate.create.apply(operateTemplate, arguments)
        .drawSign()
        .bindSelectStripeEvent()
        .animEntry()
        .setTipsMove()
       })

     } else if(operateTemplate.uwImg.src != selectTemplate.uwImg.src) {
       util.getImgs([selectTemplate.uwImg.src, selectTemplate.uwOlImg.src, selectTemplate.uwShImg.src], function(){
         operateTemplate.setUwImg.apply(operateTemplate, arguments)
       })
     }
     break;
   default:

 }

 if (swiper.activeIndex != 1) {
   selectTemplate && selectTemplate.animOut();
 } else {
   selectTemplate && selectTemplate.animEntry();
 }
})

// setTimeout(function(){
//   util.getImgs(['images/bg9.png'], function(){
//     operateTemplate.create.apply(operateTemplate, arguments);
//     operateTemplate.drawSign();
//   })
//
// }, 10000)

var btnSetBgHammer = new Hammer(document.querySelector('#btn-set-bg'));

btnSetBgHammer.on('tap', function(){
  wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
          var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          res.localIds.forEach(function(v, k){
            tips.show().setTips('图片上传中');
            wx.uploadImage({// 上传微信图片
                localId: v, // 需要上传的图片的本地ID，由chooseImage接口获得
                isShowProgressTips: 0,// 默认为1，显示进度提示
                success: function (res) {
                    var serverId = res.serverId; // 返回图片的服务器端ID
                    tips.setTips('图片加载中');
                    customUnderwearProto.uploadMedia(serverId, function(data){//{"id":"1016","r":"1","rea":"0","u":""}
                        if ( 1 == data.r && 0 == data.rea) {
                          //data.u
                          util.getImgs([data.u], function(img){
                            operateTemplate.setBackground(img);
                            tips.hide();
                          })
                        }
                    });
                }
            });

          })
      }
  });
})

// 提交分享图片
var btnSharePro = new Hammer(document.querySelector('#btn-share-pro'));
btnSharePro.on('tap', function(ev) {
  tips.setTips('正在合成').show();
  var imgData = operateTemplate.toDataURL(this);//bgImg
  if (imgData == null) {
    tips.hide();
    alert('合成失败');
    return;
  }
  tips.setTips('正在提交图片');
  customUnderwearProto.publishDesign(imgData, function(responseData) {
    tips.hide();
    if (1 != responseData["r"] || 0 != responseData["rea"]){
      alert(customUnderwearProto.REQUEST_ERROR_TIP);
    }else{
       window.location.href = 'http://mielseno.com/customunderwear/detail.html?did=' + responseData.did;
      alert("发布成功。");
    }
  })

});

//设置签名
var signWrap =  document.querySelector('#input-sign-wrap')

new Hammer(document.querySelector('#btn-set-sign'))
  .on('tap', function() {
    signWrap.style.bottom = 0;
  })

new Hammer(document.querySelector('#btn-cancel-sign'))
  .on('tap', function() {
    signWrap.setAttribute('style', '');
  })


var btnSureSignHammer = new Hammer(document.querySelector('#btn-sure-sign'));
btnSureSignHammer.on('tap', function() {
  var value = '';
  try {
    value = document.querySelector('textarea', signWrap).value.trim()//.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
  //  alert(value.length)
  } catch (e) {
    value = '';
  }
  if (value) {
    operateTemplate.setSign(value);
  }
  signWrap.setAttribute('style', '');
})
