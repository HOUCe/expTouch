# ExpTouch特点：<br/>
* expTouch.js只包含核心功能函数，不包含任何效果，简洁轻巧;
* 提供丰富的回调参数，可由用户自定义扩展效果（可参考Demo）;
* 支持多种回调函数，方便及时监控及事件处理（实例化前/后回调，touch start/move/end回调）;
* 支持用户自定义手势标准定义(X-Y轴滑动限定，角度限定);
* 支持BOX边界检测，touch超出边界后自动停止回调操作;
* 支持手势横向滑动，同时保证浏览器纵向正常滑动;
* 不会阻止BOX内的其它绑定事件(onclick等);
* 支持多点触摸监控（缩放，旋转;

<b>expTouch.js中为事件监听的核心文件。所有的特殊效果可以在回调函数进行个性化定制。</b><br/>

# 主要提供以下回调函数：<br/>
<b>beforeCallback</b> (实例化之前触发的回调函数),<br/>
<b>sCallback</b> (start callback,touchstart时触发的回调函数),<br/>
<b>mCallback</b> (move callback,touchmove时触发的回调函数),<br/>
<b>eCallback</b> (end callback,touchend时触发的回调函数)<br/>
<b>afterCallback</b> (实例化之后触发的回调函数),<br/>


# 相关回调参数：
<b>self</b>:实例化的BOX,<br/>
<b>startX</b>:触点起始X,<br/>
<b>startY</b>:触点起始Y,<br/>
<b>bL</b>:(Box Left) 相对于文档的left偏移,<br/>
<b>bT</b>:(Box Top)相对于文档的top偏移,<br/>
<b>bW</b>:(Box Width)BOX的宽度,<br/>
<b>bH</b>:(Box Height)BOX的高度,<br/>
<b>bRb</b>:(Box Right Border)BOX的右边界,<br/>
<b>bBb</b>:(Box Bottom Border)BOX的下边界,<br/>
<b>endX</b>:触点结束X;<br/>
<b>endY</b>:触点结束Y;<br/>
<b>mX</b>:(move x distance)X方向滑动距离;<br/>
<b>mY</b>:(move y distance)Y方向滑动距离;<br/>
<b>direction</b>:手势滑动方向(left/right/false);<br/>
<b>angle</b>:单点手势滑动角度;<br/>
<b>duration</b>:手势持续时间;<br/>
<b>vendor</b>:浏览器前缀(-moz/-webkit/-o/-ms);<br/><br/>

<b>tPoint.multiTouch</b>:是否多点触摸(touchmove时可监控);<br/>
<b>tPoint.gStartDis</b>:(gisture start distance)手势起始距离;<br/>
<b>tPoint.gEndDis</b>:(gisture end distance)手势结束距离;<br/>
<b>tPoint.scale</b>:手势缩放比例;<br/>
<b>tPoint.rotation</b>:手势旋转角度;<br/>

# 同时在外部回调函数中提供修改内部tPoint数据的接口:<br/>
```js
    tPoint.setAttr(name,value);
```

# 调用方法:<br/>
```js
    <script type="text/javascript">
    //传入args初始化参数对象
    args={
        iniL:30,//X方向滑动的最小距离
        iniT:50,//Y方向滑动的最大距离
        eCallback:function(tPoint){
            switch(tPoint.direction){
                case "left":
                    alert("left");
                    break;
                case "right":
                    alert("right");
            }
        }
    }
    $("body").ExpTouch(args); 
    </script>
```


# expTouch
