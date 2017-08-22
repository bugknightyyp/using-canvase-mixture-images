/*关于canvas的几个XX像素与分辨率的问题  http://jiaolonghuang.github.io/2015/11/19/canvas-devicePixelRatio/
  style.width可以控制canvas的宽度，canvas.width是控制坐标系统
*/
/*
从上到下为1~9
#fff4ef
#f7ffef
#fffaef
#daf0fe
#ffd5e8
#fbf4f1
#ffabab
#e1cce9
#ffe1de
*/

var sWidth = Math.min(window.innerWidth || Infinity, screen.width, 640);
var sHeight = Math.min(window.innerHeight || Infinity, screen.height);
/*******************/
var customUnderwear = (function(){
  var color = ['', 'fee7db', 'e9f6dc', 'fdf2d8', 'c6e3f6', 'f7dce8', 'fce9e1', 'ffd2d2', 'e1cce9', 'ffe1de'];

  var dpr = window.devicePixelRatio || 1;
  //screeen width
  /*
       var sWidth = document.documentElement.clientWidth;
       var sHeight = document.documentElement.clientHeight;
   */

  //var dpr = Math.floor(window.devicePixelRatio || 1);

  //  alert(dpr)
  // clip layer width
  var uwTopRatio = 0.05;
  var uwTop = Math.round(sHeight * uwTopRatio);
  /*****
  * draw arc path
  **/
  // point anti-clockwise
  var split = 1 - 0.618;
  var point1 = [0, sHeight * split];
  var point2 = [0, sHeight];
  var point3 = [sWidth, sHeight];
  var point4 = [sWidth, sHeight * split];
  var point5 = [sWidth/ 2, sHeight / 2];//quadraticCurveTo control point;


  var vp = Math.pow(sWidth / 2, 2) / (sHeight / 2 - point1[1]);
  //quadraticCurveTo radius
  var qr = Math.pow(vp * (vp + (sHeight / 2 - point1[1])), 0.5);
  //tangency point;切点
  var tp =  sHeight / 2 - ((vp + (sHeight / 2 - point1[1])) - qr);


  function underwear(container, arcColor) {
    this.sign = '我所理解的生活就是和自己喜欢的一切在一起';

    this.arcColor = arcColor || color[1];

    this.bgState = {};
    this.bg = null;
    this.blurRadius = 30;
    this.stripeTop = 10;// 调整内衣到顶端的距离
    // ctxArc.globalCompositeOperation = 'destination-in';

    this.container = container;
    this.btnSureCallback = function(){};
  }

  var proto = underwear.prototype;
  /*********
  * create dom struct
  */
  proto.createDom = function() {
    var oFragment = document.createDocumentFragment();
    this.bgWrap = document.createElement("div");
    this.bgWrap.setAttribute('class', 'bg-wrap');
    this.bgWrap.innerHTML = '';

    this.uwWrap = document.createElement("div");
    this.uwWrap.setAttribute('class', 'uw-wrap');

    this.stripeWrap = document.createElement("div");
    this.stripeWrap.setAttribute('class', 'stripe-wrap');
    this.stripeWrap.innerHTML = '';
    //this.bgWrap.appendChild(this.bgImg);

    this.monitorWrap = document.createElement("div");
    this.monitorWrap.setAttribute('class', 'mo-wrap');
    this.monitorWrap.style.height = tp + 'px';

    this.ctxArc = document.createElement('canvas').getContext('2d');
    [this.ctxArc].forEach(function(item, index){
        item.canvas.width = sWidth * dpr;
        item.canvas.height = sHeight * dpr;
        item.imageSmoothingEnabled = true;
        item.scale(dpr, dpr);
    })
    this.stripeWrap.appendChild(this.ctxArc.canvas);
    //this.ctxBg.canvas.style.display = 'none';
    //bgWrap.parentNode.insertBefore(this.ctxBg.canvas, this.ctxArc.canvas);



    oFragment.appendChild(this.bgWrap);
    oFragment.appendChild(this.uwWrap);
    //oFragment.appendChild(this.ctxBg.canvas);
    oFragment.appendChild(this.stripeWrap);
    oFragment.appendChild(this.monitorWrap);
    //oFragment.appendChild(this.ctxStripe.canvas);

    this.fragment = oFragment;

    return this;
  }
  /*********
  * initial background image state
  */
  proto.initBgState = function() {
    var iWidth = this.bgImg.naturalWidth;
    var iHeight = this.bgImg.naturalHeight;
    // 缩放和旋转都是以屏幕中心点  处理顺序 缩放 - 平移  - 旋转
    // var ratio = Math.max( sWidth / iWidth,  sHeight / iHeight);
    // this.bgState.scale = ratio;
    // this.bgState.sourcePoint = [(iWidth - sWidth / ratio) / 2, 0];
    // this.bgState.clipDimension = [sWidth / ratio, sHeight / ratio];

    // var ratio = Math.max( sWidth / iWidth,  sHeight / iHeight);
    // this.bgState.scale = ratio;
    // this.bgState.translate = [(sWidth - (iWidth * ratio)) / 2, 0];//(sWidth - (iWidth * ratio)) / 2
    // this.bgState.rotate = 0;//弧度

    this.bgState.scale = 1;
    this.bgState.rotate = 0; // 弧度
    this.bgState.translate = [Math.round((sWidth - iWidth) / 2), Math.round((tp - iHeight) / 2)];//(tp - iHeight) / 2

    return this;
  };
  /********************
  * bind event for select stripe
  */
  proto.bindSelectStripeEvent = function() {
    // // get a reference to an element
    var hammertime = new Hammer(this.monitorWrap, {domEvents: true});

      hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 3});
      hammertime.get('pinch').set({ enable: true });

      // bind  pan event
      hammertime.on('pan', function(ev) {
        this.removeTipsMove();
        this.translate(ev.deltaX, ev.deltaY);
        ev.srcEvent.stopPropagation();
      }.bind(this));
      hammertime.on('panstart', function(ev) {
        this.bgState.tempTranslate = [this.bgState.translate[0], this.bgState.translate[1]];
        ev.srcEvent.stopPropagation();
      }.bind(this));
      hammertime.on('panend', function(ev) {
        this.bgState.translate[0] = this.stuckBoundaryX(this.bgState.tempTranslate[0] + ev.deltaX);
        this.bgState.translate[1] = this.stuckBoundaryY(this.bgState.tempTranslate[1] + ev.deltaY);
        this.bgState.tempTranslate = null;
        ev.srcEvent.stopPropagation();
      }.bind(this));

      //bind pinch event
      // hammertime.on('pinchmove', function(ev) {
      //   this.scale(ev.scale);
      //   ev.srcEvent.stopPropagation();
      // }.bind(this));
      // hammertime.on('pinchstart', function(ev) {
      //   this.monitorWrap.innerHTML = this.monitorWrap.innerHTML + '/ ,' + ev.scale;
      //   this.monitorWrap.style.color = '#000';
      //   this.bgState.tempScale = ev.scale;
      //   ev.srcEvent.stopPropagation();
      // }.bind(this));
      // hammertime.on('pinchend', function(ev) {
      //   this.bgState.scale = this.bgState.tempScale * ev.scale;
      //   this.bgState.tempScale = null;
      //   ev.srcEvent.stopPropagation();
      // }.bind(this));

      return this;
  }
  /*************
  *  bind event for select templates
  */
  proto.bindSelectTmplEvent = function() {



    var hammertime = new Hammer(this.tmplWrap);
    hammertime.on('tap', function(ev) {
        var img = ev.target;
        var index = img.src.match(/pro-(\d)\./)[1];
        //tips.show();
        //['images/bg8.png', 'images/p1-2.png', 'images/p1.png', 'images/uw-sh-1.png']
        util.getImgs(['images/y' + index + '_01.png'], function(){
          this.arcColor = color[index];
          this.setUwImg.apply(this, arguments)
          //tips.hide();
        }.bind(this))


    }.bind(this));

    new Hammer(this.btnSure)
      .on('tap', function(ev) {
          this.btnSureCallback.call(this, ev);
      }.bind(this))

    return this;
  }
  /*********
  * start create widget;
  *
  * bgSrc: {string} background image
  * uwSrc: {string} underwear image
  * uwShSrc: {string} underwear image  with shadow
  */
  proto.create = function(bgImg, uwImg, uwOlImg, uwShImg) {
    this.bgImg = bgImg || this.bgImg;
    this.uwImg = uwImg || this.uwImg;
    this.uwOlImg = uwOlImg || this.uwOlImg;
    this.uwShImg = uwShImg || this.uwShImg;


    //this.initBgState();
    this.createDom();
    this.drawArc();
    // this.drawSign();
    // this.draw();

    this.setBackground();
    this.setUnderwear();
    this.container.innerHTML = '';
    this.container.appendChild(this.fragment);
    //this.bindEvent();
    return this;

  }

  proto.setBackgroundState = function() {
    this.bgImg.style['-webkit-transform'] =
    this.bgImg.style['transform'] =
    'scale('+ this.bgState.scale + ','+ this.bgState.scale +')'
      + ' translate(' + this.bgState.translate[0] + 'px,' + this.bgState.translate[1] + 'px)'
      + ' rotate('+ this.bgState.rotate +'deg)';

    // this.ctxBg.clearRect(0, 0, sWidth, sHeight);
    // this.ctxBg.drawImage(this.bgImg, state.sourcePoint[0], state.sourcePoint[1], state.clipDimension[0], state.clipDimension[1], 0, 0, sWidth, sHeight);

  }
  /********
  * draw background image canvas
  */
  proto.setBackground = function(bgImg) {

    this.bgImg = bgImg ||　this.bgImg;
    this.bgWrap.innerHTML = '';
    this.bgWrap.appendChild(this.bgImg);

    this.initBgState();
    this.setBackgroundState();
    // this.ctxBg.clearRect(0, 0, sWidth, sHeight);
    // this.ctxBg.drawImage(this.bgImg, state.sourcePoint[0], state.sourcePoint[1], state.clipDimension[0], state.clipDimension[1], 0, 0, sWidth, sHeight);

    return this;
  }
  /**********
  * set underwear to page
  */
  proto.setUnderwear = function() {
    var img = this.uwImg;

    img.width = sWidth;
    //img.height = cHeight;
    //img.style.left = (sWidth - cWidth) / 2 + 'px';
    //img.style.top = (sHeight / 2 - cHeight) / 2 + 'px';

    //img.style.width = cWidth + 'px';

    var stripLayer = document.createElement('div');
    stripLayer.style.height = '200px';
    stripLayer.style.width = '100%';
    stripLayer.style.backgroundColor = 'white';
    stripLayer.style.marginTop = '-30px';

    this.uwWrap.innerHTML = '';
    this.uwWrap.appendChild(img);
    this.uwWrap.appendChild(stripLayer);
    return this;
  }
  proto.setTemplate = function(tmplWrap) {
    this.tmplWrap = tmplWrap || this.tmplWrap;
    //<div class="button-sure-stripe" id="button-sure-stripe">确定</div>
    var btnNode = document.createElement('div');
    var textNode = document.createTextNode('确定');
    btnNode.style.top = tp - 30 + 'px';
    btnNode.appendChild(textNode);
    btnNode.setAttribute('class', 'button-sure-stripe');
    tmplWrap.style.width = sWidth + 'px';
    // tmplWrap.style.height = sHeight / 2 + 'px';
    this.btnSure = btnNode;
    this.stripeWrap.appendChild(tmplWrap);
    this.stripeWrap.appendChild(btnNode);
    tmplWrap.style.display = 'block';


    return this;
  };

  /**************
  * set uwImg
  */
  proto.setUwImg = function(uwImg, uwOlImg, uwShImg) {
    this.uwImg = uwImg || this.uwImg;
    this.uwOlImg = uwOlImg || this.uwOlImg;
    this.uwShImg = uwShImg || this.uwShImg;

    this.setUnderwear();

    this.uwImg.style.top = this.uwImg.top;

    return this;
  };
  /*************
  * animation entry
  */
  this.animNum = 0;
  proto.animEntry = function() {
    setTimeout(function(){
      try {
        this.uwWrap.style.top = -uwTopRatio * 100 + '%';
        this.stripeWrap.style.top = 0;
        this.animNum++;
      } catch (e) {

      } finally {

      }

    }.bind(this), 0);

    return this;
  }
  /*************
  * animation entry
  */
  proto.animOut = function() {
    //setTimeout(function(){
      this.uwWrap.style.top = '-100%';
      this.stripeWrap.style.top = '100%';
      this.animNum++;
    //}.bind(this), 0);

    return this;
  }
  /********
  * stuck boundary x when move background image
  */
  proto.stuckBoundaryX = function(x){
    var left,
        right,
        w = this.bgImg.naturalWidth;
    if (w > sWidth) {
      left = sWidth - w;
      right = 0;
    } else {
      left = right = (sWidth - w) / 2;
    }
    return Math.min(Math.max(left, x), right);
  }
  /********
  * stuck boundary x when move background image
  */
  proto.stuckBoundaryY = function(x){
    var left,
        right,
        h = this.bgImg.naturalHeight;
    if (h > tp) {
      left = tp - h;
      right = 0;
    } else {
      left = right = (tp - h) / 2;
    }
    return Math.min(Math.max(left, x), right);
  }
  /********
  * translate background image
  */
  proto.translate = function(x, y) {// x y 增、减量

      this.bgState.translate[0] = this.stuckBoundaryX(this.bgState.tempTranslate[0] + x);
      this.bgState.translate[1] = this.stuckBoundaryY(this.bgState.tempTranslate[1] + y);
      this.setBackgroundState();
  }
  /********
  * translate background image
  */
  proto.scale = function(x) {// x
      this.bgState.scale = this.bgState.tempScale * x;
      this.setBackgroundState();
  }
  /********
  * draw arc canvas
  */
  proto.drawArc = function(color) {// img object
    this.ctxArc.clearRect(0, 0, sWidth, sHeight);
    this.ctxArc.beginPath();
    this.ctxArc.moveTo(point1[0], point1[1]);
    this.ctxArc.lineTo(point2[0], point2[1]);
    this.ctxArc.lineTo(point3[0], point3[1]);
    this.ctxArc.lineTo(point4[0], point4[1]);
    this.ctxArc.quadraticCurveTo(point5[0],  point5[1], point1[0], point1[1])


    // this.ctxArc.strokeStyle="green";
    // this.ctxArc.strokeWidth="5"
    // this.ctxArc.stroke();
    this.ctxArc.fillStyle = '#' + (color || this.arcColor || 'ffffff');
    this.ctxArc.fill();


    // //draw brand
    // var can = document.createElement('canvas');
    // var ctxCan = can.getContext('2d');
    // can.width = sWidth;
    // can.height = sHeight;
    // ctxCan.textAlign = "center";
    // ctxCan.fillStyle = '#999';
    // ctxCan.font = 14 + "px 'Hiragino Sans GB',sans-serif";
    //this.ctxArc.drawImage(can, 0, 0);

    return this;
  }
  /*********
  * draw strip canvas
  */
  proto.drawStrip = function(){
    this.ctxStripe.clearRect(0, 0, sWidth, sHeight);
    this.ctxStripe.drawImage(this.ctxBg.canvas, 0, 0, sWidth, sHeight);
    this.ctxStripe.globalCompositeOperation = 'destination-in';
    this.ctxStripe.drawImage(this.uwImg, (sWidth - cWidth) / 2, sHeight / 2 -  cHeight + this.stripeTop, cWidth, cHeight);
    this.ctxStripe.globalCompositeOperation = 'destination-over';
    this.ctxStripe.drawImage(this.uwOlImg, (sWidth - cWidth) / 2, sHeight / 2 -  cHeight + this.stripeTop, cWidth, cHeight);
    return this;
  }
  proto.drawSign = function(sign) {
    sign = sign  || this.sign;

    var signWithSpace = sign.replace(/./g, function(char) {
        return char + ' ';
    })

    var fontSize = 20;
    var signLineHeight = fontSize + 8;
    var signFontNumsPerLine = Math.floor(sWidth / (fontSize));
    var signFontNums = signWithSpace.length + 1;
    var signLineNums = Math.ceil(signFontNums / signFontNumsPerLine);



    // for (var i = 0; i < signLineNums; i++) {
    //   this.ctxArc.fillText(sign.substring(i * signFontNumsPerLine, (i + 1) * signFontNumsPerLine), sWidth * dpr / 2 , point5[1] + (i * signLineHeight) * dpr);
    // }

    var can = document.createElement('canvas');
    var ctxCan = can.getContext('2d');
    can.width = sWidth;
    can.height = sHeight;
    ctxCan.textAlign = "center";
    ctxCan.fillStyle = '#000';
    ctxCan.font = fontSize + "px 'Hiragino Sans GB',sans-serif";
    //ctxCan.fillText('中 国共产党', sWidth / 2, point5[1]);

    for (var i = 0; i < signLineNums; i++) {
      ctxCan.fillText(signWithSpace.substring(i * signFontNumsPerLine, (i + 1) * signFontNumsPerLine), sWidth  / 2 , point5[1] + 20 + (i * signLineHeight) );
    }


    this.ctxArc.drawImage(can, 0, 0);

    //document.querySelector('#data').appendChild(can);

    return this;

  };
  proto.setTipsMove = function() {
    var img =  new Image();
    img.src = 'images/move.gif';
    this.tipsMove = img;
    this.monitorWrap.appendChild(img);
    return this;
  };
  proto.removeTipsMove = function() {
    this.tipsMove &&  (this.monitorWrap.removeChild(this.tipsMove), this.tipsMove = null);
    return this;
  };
  proto.setSign = function(sign) {
    this.sign = (sign || this.sign).substring(0, 40);
    this.drawArc();
    this.drawSign();
    return this;
  }
  /*********
  * blur bg
  */
  // proto.blur = function(){
  //   var can = this.ctxBg.canvas;
  //   stackBlur.canvasRGB(can, 0, 0, can.width, can.height, this.blurRadius);
  //   return this;
  // }


// console.log(this.ctxBg.canvas.toDataURL())

  proto.toDataURL = function() {
    var can = document.createElement('canvas');
    var can_1 = document.createElement('canvas');
    var ctx = can.getContext('2d');
    var ctx_1 = can_1.getContext('2d');

    var w = sWidth;
    var h = tp;

    can.width = can_1.width = sWidth;
    can.height = can_1.height = sHeight;
    //alert((this.bgState.translate[0]) + ':---:' + (this.bgState.translate[1]));
      //ctx.drawImage(this.bgImg, 100, 100,  w, h, 0, 0, w, h);//-this.bgState.translate[0] / dpr, -this.bgState.translate[1] / dpr,


    // this is worked in chorome and firefox
    //ctx.drawImage(this.bgImg, -this.bgState.translate[0], -this.bgState.translate[1],  w, h, 0, 0, w, h)

    // for compatible safari
    var sx, sy, swidth, sheight, x, y, width, height;
    if (this.bgState.translate[0] > 0) {
      x = this.bgState.translate[0];
      sx = 0;
      swidth = Math.min(this.bgImg.naturalWidth, w);
      width = swidth;
    } else {
      sx = Math.abs(this.bgState.translate[0]);
      x = 0;
      swidth = Math.min(Math.max(this.bgImg.naturalWidth - sx, 0), w);
      width = swidth;
    }


    if (this.bgState.translate[1] > 0) {
      y = this.bgState.translate[1];
      sy = 0;
      sheight = Math.min(this.bgImg.naturalHeight, h);
      height = sheight;
    } else {
      sy = Math.abs(this.bgState.translate[1]);
      y = 0;
      sheight = Math.min(Math.max(this.bgImg.naturalHeight - sy, 0), h);
      height = sheight;
    }


    ctx.drawImage(this.bgImg, sx, sy, swidth, sheight, x, y, width, height);
     //return can.toDataURL();


    var img = this.uwImg;//this.uwImg;
    //ctx.globalCompositeOperation = 'destination-over'; * sWidth / this.uwImg.naturalWidth

    var ratio = sWidth / this.uwImg.naturalWidth;
    // sx, sy, swidth, sheight, x, y, width, height;

    // for the lack of uwImg'height
    sx = 0;
    sy = uwTop / ratio;
    swidth = this.uwImg.naturalWidth;
    sheight = this.uwImg.naturalHeight - sy;
    x = 0;
    y = 0;
    width = sWidth;
    height = sheight * ratio;

    ctx.drawImage(this.uwImg, sx, sy, swidth, sheight, x, y, width, height);

    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.lineTo(sWidth, sHeight);
    ctx.lineTo(0, sHeight);
    ctx.fillStyle = 'white';
    ctx.fill();

    //ctx.globalCompositeOperation = 'source-over';

    ctx.drawImage(this.ctxArc.canvas, 0, 0, sWidth, sHeight);
    ctx.textAlign = "center";
    ctx.fillStyle = '#000';
    ctx.font = 14 + "px 'Hiragino Sans GB',sans-serif";
    ctx.fillText('-蜜豆内衣-', sWidth  / 2 , sHeight - 10 );
    var data;
    try{// avoid image cross origin domain
      data = can.toDataURL();
    } catch(e) {
      data = null;
    }

    return data;
  }

  return underwear;

})();


var tips = (function(){
  var tipsWrap = document.querySelector('#spinner-wrap');
  var rslt = {};
  rslt.show = function() {
    $(tipsWrap).addClass('show');
    return this;
  }
  rslt.hide = function() {
    $(tipsWrap).removeClass('show');
    return this;
  }
  rslt.setTips = function(tips) {
    document.querySelector('.loading-tips', tipsWrap).innerHTML = tips || '请稍等';
    return this;
  }
  return rslt;
})();
