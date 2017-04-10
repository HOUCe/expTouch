function ExpTouch(tBox, args) {
    // 第一个参数是jquery对象，表示target，第二个参数是用户的传参
    var tPoint = {
        self: tBox,
        count: 0,
        speed: 300,
        iniL: 30,
        iniT: 30,
        iniAngle: 30, // 这些都是默认值，可以用户自定义来设置
        touch: false,
        mutiTouch: false,
        setAttr: function(name, value) {
            tPoint[name]=value;
        }
    };
    
    // init初始化
    (function(){    
        target = tPoint.self;
        // 融合用户的传参，扩展参数
        for (var o in args){
            tPoint[o] = args[o];
        }
        // var offset = target.offset();
        tPoint.bL = target.left; // (Box Left) 相对于文档的left偏移
        tPoint.bT = target.top; // (Box Top)相对于文档的top偏移
        tPoint.bW = target.width(); // (Box Width)BOX的宽度
        tPoint.bH = target.height(); // (Box Width)BOX的高度
        tPoint.bRb = tPoint.bL + tPoint.bW; //右边界 支持BOX边界检测，touch超出边界后自动停止回调操作;
        tPoint.bBb = tPoint.bT + tPoint.bH; //下边界 支持BOX边界检测，touch超出边界后自动停止回调操作;
        tPoint.total = target.children().children().length;        
    })();
    
    // 浏览器特性检测
    tPoint.vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
        (/firefox/i).test(navigator.userAgent) ? 'Moz' :
        'opera' in window ? 'O' : '';
    tPoint.has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
    tPoint.hasTouch = 'ontouchstart' in window;
    tPoint.hasTransform = tPoint.vendor + 'Transform' in document.documentElement.style;
    
    // 方向检测(左移距离，上移距离)
    function directionDetect (l,t) {
        if (Math.abs(t) < tPoint.iniT && Math.abs(l) > tPoint.iniL){
            var rStr = l < 0 ? 'left':'right';
            return rStr;
        }
        return false;
    }
    
    // 边界检测
    function borderDetect (x, y) {
        return (x < tPoint.bL || x > tPoint.bRb || y < tPoint.bT || y > tPoint.bBb);  
    }
    
    // 获取夹角(通过arctant反三角函数)
    function getAngle (n) {
        return Math.atan(n)*180/Math.PI;
    }
    
    // 获取距离(通过两边计算第三边)
    function getDis (xLen, yLen) {
        return Math.sqrt(Math.pow(xLen,2) + Math.pow(yLen,2));
    }

    // 设置tPoint，在touchmove时需要记录数据，在touchmove过程中也要记录数据
    // 所以有两处调用这个函数，第一处是touchstart时setPointData(point,setList);
    // 第二处是touchmove且非首次触屏move时setPointData(point) 
    // 这两处调用，根据参数不同，分别记录相应的数据。其实可以把这个函数拆开，但是想想意义也不是很大
    // 当双指滑动时候，也需要记录数据，但是不再调用这个函数处理记录，而是直接写在tPoint里面
    function setPointData (point, setList){
        if (setList){ 
            // touchstart
            for (var o in setList){
                tPoint.setAttr(o,setList[o]);
            }
        }
        else { // moving
            var t = new Date();
            tPoint.endX = point.pageX;
            tPoint.endY = point.pageY;
            tPoint.endTime = t.getTime();
            tPoint.duration = tPoint.endTime - tPoint.startTime;
            tPoint.mX = point.pageX - tPoint.startX; // x轴方向滑动距离
            tPoint.mY = point.pageY - tPoint.startY; // y轴方向滑动距离
            tPoint.direction = directionDetect(tPoint.mX, tPoint.mY);      
            tPoint.angle = getAngle(tPoint.mY/tPoint.mX);
        }
    }
    
    // 多点触摸检测(只检测两点触摸)
    function multiTouchDetect (e) {
        tPoint.tLen = e.touches.length;
        if (tPoint.tLen > 1){
            var point0 = e.touches[0],
                point1 = e.touches[1],
                xLen = point1.pageX - point0.pageX,
                yLen = point1.pageY - point0.pageY,
                angle = getAngle(yLen/xLen),
                gDis = getDis(xLen,yLen);

            if(!tPoint.mutiTouch){ // 第一次双指触碰，刚刚优雅的放在屏幕上
                // 如果之前tPoint.mutiTouch为false,说明这是双指刚刚触摸在屏幕上，需要记录此时初始手指距离和角度
                tPoint.gStartDis = gDis; // 所有关于双指的数据记录变量名前都加g(gesture), 作为区分
                tPoint.gStartAngle = angle;
            }
            else{ // 非第一次双指触碰，那就是手指在移动咯
                // 如果之前tPoint.mutiTouch为true,说明多指已经触摸在屏幕上，这时候可以计算scale和rotation
                tPoint.gEndDis = gDis;
                tPoint.gEndAngle = angle;
                tPoint.scale = gDis/tPoint.gStartDis;
                tPoint.rotation = angle - tPoint.gStartAngle;
            }
            tPoint.mutiTouch = true;
        }
        else{
            tPoint.mutiTouch = false;
        };  
    }
    
    function startFun (e){
        var point = e.touches[0],
            t = new Date();

        var setList={
            startX: point.pageX,
            startY: point.pageY,
            startTime: t.getTime(),
            // identifier：一个数值，唯一标识触摸会话（touch session）中的当前手指。一般为从0开始的流水号
            identifier: point.identifier
        }

        // setTouchstartPointData()
        setPointData(point, setList);

        tPoint.touch=true;

        // 处理touchstart的回调
        if(typeof tPoint.sCallback == "function"){
            tPoint.sCallback(tPoint);
        }   
    }
    
    function moveFun (e) {
        var point = e.touches[0];

        if (borderDetect(point.pageX, point.pageY)) {
            // 支持BOX边界检测，touch超出边界后自动停止回调操作;
            tPoint.touch = false;
            return false;
        }

        if (tPoint.touch) {
            setPointData(point);
            multiTouchDetect(e);// Muti touch detect
            // 处理move过程中的回调
            if(typeof tPoint.mCallback == "function"){
                tPoint.mCallback(tPoint);
            }
        }

        //  如果滑动角度小于阈值iniAngle，屏蔽掉系统事件
        if (Math.abs(tPoint.angle) < tPoint.iniAngle){
            e.preventDefault(); 
        }
    }
    
    function endFun (e) {
        tPoint.touch = false;
        tPoint.mutiTouch = false;
        // 处理end时的回调
        if(typeof tPoint.eCallback == "function"){
            tPoint.eCallback(tPoint);
        }
    }

    // 实例化之前的回调函数,用户可自定义
    if(typeof tPoint.beforeCallback == "function"){
        tPoint.beforeCallback(tPoint);
    }
    
    // Touch事件监听
    // console.log(_this, _this.get(0));
    // console.log(_this,_this.die);
    target.get(0).addEventListener('touchstart', startFun);
    target.get(0).addEventListener('touchmove', moveFun);
    target.get(0).addEventListener('touchend', endFun);
    
    // 实例化之后的回调函数,用户可自定义
    if(typeof tPoint.afterCallback=="function"){
        tPoint.afterCallback(tPoint);
    } 
}

// 关于zepto/jquery插件的扩展机制：
//$( "a" ).css( "color", "red" );
// This is some pretty basic jQuery code, but do you know what's happening behind the scenes?
// Whenever you use the $ function to select elements, it returns a jQuery object. 
// This object contains all of the methods you've been using (.css(), .click(), etc.) and all of the elements that fit your selector. 
// The jQuery object gets these methods from the $.fn object. 
// This object contains all of the jQuery object methods, and if we want to write our own methods, it will need to contain those as well.

// 用法
// $("#touchBox").ExpTouch(args);
if (window.jQuery || window.Zepto) { (function(a) {
        a.fn.ExpTouch = function(b) {
            return this.each(function() {
                // $()返回一个jquery object包含了
                // As of jQuery 1.4.3 HTML 5 data- attributes will be automatically pulled in to jQuery's data object. 
                // The treatment of attributes with embedded dashes was changed in jQuery 1.6 to conform to the W3C HTML5 specification.
                // return this 作为链式调用
                a(this).data("ExpTouch", new ExpTouch(a(this), b));
                // console.log(new ExpTouch(a(this), b));
            })
        }
    })(window.jQuery || window.Zepto)
};
