/**
 * Created by sense on 15/12/7.
 */

var domain = 'http://mielseno.com';
var currUrl = window.location.href.replace(window.location.hash,'');
$.getJSON(domain + '/wx/signature.php?url=' + encodeURIComponent(currUrl)).done(function(data) {
    wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'chooseImage',
            'uploadImage'
        ]
    });

    wx.ready(function () {
        var shareTitle = '我的亲手设计 期待被珍惜';
        var shareDesc = '喜欢的东西和生活，都想要分享给你';
        var shareImg = domain + '/customunderwear/images/icon_share.png';

        // 分享给朋友事件绑定
        wx.onMenuShareAppMessage({
            title: shareTitle,
            desc: shareDesc,
            imgUrl: shareImg
        });

        // 分享到朋友圈
        wx.onMenuShareTimeline({
            title: shareTitle,
            imgUrl: shareImg
        });
    });
});
