// 'use strict';
// angular.module('slingshot')
//     /**
//  * NOTICE:
//  * This directive is old version!!
//  * Please check this repository:
//  * https://github.com/ktknest/angular-pinch-zoom
//  * /

// // sample: http://codepen.io/ktknest/full/LDljw/

// angular.module('app', [])
// /**
//  * @ngdoc directive
//  * @name pinchZoom
//  * @restrict A
//  * @scope false
//  *
//  * @description
//  * 要素のピンチアウト・インでの拡大・縮小、拡大時のスワイプ動作を提供
//  *
//  **/
//     .directive('pinchZoom', function($rootScope) {
//         var _directive = {
//             restrict: 'A',
//             scope: false,
//             link: _link
//         };

//         function _link(scope, element, attrs) {
//             var elWidth = element[0].offsetParent.offsetWidth;
//             var elHeight = Number(attrs.height);
//             var parentHeight = element[0].offsetParent.offsetHeight;

//             // モード（pinch or swipe）
//             var mode = '';

//             // ピンチ時の2点間の距離
//             var distance = 0;
//             var initialDistance = 0;

//             // 拡大率
//             var scale = 1;
//             var relativeScale = 1;
//             var initialScale = 1;
//             var MAX_SCALE = 3;

//             // 要素の左上端の座標
//             var positionX = 0;
//             var positionY = 0;

//             var initialPositionX = 0;
//             var initialPositionY = 0;

//             // ピンチ時の中心座標
//             var originX = 0;
//             var originY = 0;

//             // スワイプ時のスタート座標・移動量
//             var startX = 0;
//             var startY = 0;
//             var moveX = 0;
//             var moveY = 0;

//             element.css({
//                 '-webkit-transform-origin': '0 0',
//                 'transform-origin': '0 0'
//             });

//             element.on('touchstart', function(evt) {
//                 startX = evt.touches[0].pageX;
//                 startY = evt.touches[0].pageY;
//                 initialPositionX = positionX;
//                 initialPositionY = positionY;
//                 moveX = 0;
//                 moveY = 0;
//                 mode = '';

//                 if (evt.touches.length === 2) {
//                     $rootScope.isZoomedState = true;
//                     initialScale = scale;
//                     initialDistance = getDistance(evt);
//                     originX = evt.touches[0].pageX -
//                         parseInt((evt.touches[0].pageX - evt.touches[1].pageX) / 2, 10) -
//                         element[0].offsetLeft - initialPositionX;
//                     originY = evt.touches[0].pageY -
//                         parseInt((evt.touches[0].pageY - evt.touches[1].pageY) / 2, 10) -
//                         element[0].offsetTop - initialPositionY;

//                 }
//             });

//             element.on('touchmove', function(evt) {
//                 evt.preventDefault();
//                 if ($rootScope.isZoomedState == true) {
//                     if (mode === 'swipe' && scale > 1) {

//                         moveX = evt.touches[0].pageX - startX;
//                         moveY = evt.touches[0].pageY - startY;

//                         positionX = initialPositionX + moveX;
//                         positionY = initialPositionY + moveY;
//                         console.log("positionX: " + positionX);
//                         console.log("positionY: " + positionY);

//                         if (parentHeight > elHeight) {
//                             // if (positionX > 0) {
//                             //     positionX = 0;
//                             // } else if (positionX < elWidth * (1 - scale)) {
//                             //     positionX = elWidth * (1 - scale);
//                             // }
//                             // if (positionY > 0) {
//                             //     positionY = 0;
//                             // } else if (positionY <  elHeight * (1 - scale)) {
//                             //     positionY = elHeight * (1 - scale);
//                             // }
//                             if (positionY > -132)
//                                 return;
//                         } else {
//                             if (positionX > 0) {
//                                 positionX = 0;
//                             } else if (positionX < elWidth * (1 - scale)) {
//                                 positionX = elWidth * (1 - scale);
//                             }
//                             if (positionY > 0) {
//                                 positionY = 0;
//                             } else if (positionY < elHeight * (1 - scale)) {
//                                 positionY = elHeight * (1 - scale);
//                             }
//                         }
//                         transformElement();

//                     } else if (mode === 'pinch') {

//                         distance = getDistance(evt);
//                         relativeScale = distance / initialDistance;
//                         scale = relativeScale * initialScale;

//                         positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
//                         positionY = originY * (1 - relativeScale) + initialPositionY + moveY;
//                         // if (parentHeight > elHeight) {
//                         //     if (scale < 1.7 && scale > 1) {
//                         //         transformElement();
//                         //     }
//                         // } else {
//                         if (scale > 1) {
//                             transformElement();
//                         }
//                         // }
//                     } else {

//                         if (evt.touches.length === 1) {
//                             mode = 'swipe';
//                         } else if (evt.touches.length === 2) {
//                             mode = 'pinch';
//                         }

//                     }
//                 }
//             });

//             element.on('touchend', function(evt) {
//                 if ($rootScope.isZoomedState == true) {
//                     if (mode === 'pinch') {

//                         if (scale < 1) {

//                             scale = 1;
//                             positionX = 0;
//                             positionY = 0;


//                         } else if (scale > MAX_SCALE) {

//                             scale = MAX_SCALE;
//                             relativeScale = scale / initialScale;
//                             positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
//                             positionY = originY * (1 - relativeScale) + initialPositionY + moveY;

//                         }
//                         transformElement(0.1);
//                     }

//                     // if (scale > 1) {

//                     //     if (positionX > 0) {
//                     //         positionX = 0;
//                     //     } else if (positionX < elWidth * (1 - scale)) {
//                     //         positionX = elWidth * (1 - scale);
//                     //     }
//                     //     if (positionY > 0) {
//                     //         positionY = 0;
//                     //     } else if (positionY < elHeight * (1 - scale)) {
//                     //         positionY = elHeight * (1 - scale);
//                     //     }

//                     // }


//                 }
//             });

//             function getDistance(evt) {
//                 var d = Math.sqrt(Math.pow(evt.touches[0].pageX - evt.touches[1].pageX, 2) +
//                     Math.pow(evt.touches[0].pageY - evt.touches[1].pageY, 2));
//                 return parseInt(d, 10);
//             }

//             function transformElement(duration) {
//                 var transition = duration ? 'all cubic-bezier(0,0,.5,1) ' + duration + 's' : '',
//                     matrixArray = [scale, 0, 0, scale, positionX, positionY],
//                     matrix = 'matrix(' + matrixArray.join(',') + ')';

//                 element.css({
//                     '-webkit-transition': transition,
//                     'transition': transition,
//                     '-webkit-transform': matrix + ' translate3d(0,0,0)',
//                     'transform': matrix
//                 });
//             }
//         }
//         return _directive;
//     });

'use strict';
angular.module('slingshot')

.directive('pinchZoom', function() {
    var _directive = {
        restrict: 'A',
        scope: { nextFn: '&', prevFn: '&' },
        link: _link
    };

    function _link(scope, element, attrs) {
        var sensitivityOfSwipe = 70 //more value means more finger needs to be slide to swipe left or right
        var elWidth, elHeight;
        var mode = '';
        var distance = 0;
        var initialDistance = 0;
        var scale = 1;
        var relativeScale = 1;
        var initialScale = 1;
        var maxScale = parseInt(attrs.maxScale, 10);
        if (isNaN(maxScale) || maxScale <= 1) {
            maxScale = 6;
        }
        var positionX = 0;
        var positionY = 0;
        var initialPositionX = 0;
        var initialPositionY = 0;
        var originX = 0;
        var originY = 0;
        var startX = 0;
        var startY = 0;
        var moveX = 0;
        var moveY = 0;

        var isStateOverZoom = false;
        var offsetTop = 0;
        var image = new Image();
        image.onload = function() {
            scale = 1;
            elWidth = element[0].width;
            elHeight = element[0].height;
            offsetTop = element[0].offsetTop;
            // console.log("Element: " + element[0])
            // console.log("Element[0]Width: " + element[0].width);
            // console.log("Element[0] height: " + element[0].height);
            // console.log("Element[0] offsettop: " + element[0].offsetTop);


            // console.log("This Natural Width: " + this.naturalWidth);
            // console.log("This Natural Height: " + this.naturalHeight);
            // //console.log("Element[0] offsettop: " + this.offsetTop);


            // console.log("This Width: " + this.width);
            // console.log("This Height: " + this.height);
            console.log("Image Load called");
            //console.log("Element[0] offsettop: " + element[0].offsetTop);

            element.css({
                '-webkit-transform-origin': '0 0',
                'transform-origin': '0 0'
            });
            element.on('touchstart', touchstartHandler);
            element.on('touchmove', touchmoveHandler);
            element.on('touchend', touchendHandler);
        };
        if (attrs.ngSrc) {
            image.src = attrs.ngSrc;
        } else {
            image.src = attrs.src;
        }

        function touchstartHandler(evt) {
            var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;
            startX = touches[0].clientX;
            startY = touches[0].clientY;
            console.log("element Height: " + elHeight + "element width: " + elWidth);
            // console.log("touchstartHandler ");
            // console.log("startX: " + startX);
            // console.log("startY: " + startY);
            initialPositionX = positionX;
            initialPositionY = positionY;
            // console.log("initialPositionX: " + initialPositionX);
            // console.log("initialPositionY: " + initialPositionY);
            console.log("Touch start called");
            moveX = 0;
            moveY = 0;
        }

        function touchmoveHandler(evt) {
            var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;
            if (mode === '') {
                if (touches.length === 1 && scale >= 1) {
                    mode = 'swipe';
                } else if (touches.length === 2) {
                    mode = 'pinch';
                    initialScale = scale;
                    initialDistance = getDistance(touches);
                    originX = touches[0].clientX - parseInt((touches[0].clientX - touches[1].clientX) / 2, 10) - element[0].offsetLeft - initialPositionX;
                    originY = touches[0].clientY - parseInt((touches[0].clientY - touches[1].clientY) / 2, 10) - element[0].offsetTop - initialPositionY;
                    //console.log("origin x parseint: " + parseInt((touches[0].clientX - touches[1].clientX) / 2, 10) + " origin y parseint: " + parseInt((touches[0].clientY - touches[1].clientY) / 2, 10));
                    // console.log("originX: " + originX + " OffsetLeft: " + element[0].offsetLeft);
                    // console.log("originY: " + originY + " OffsetTop: " + element[0].offsetTop);
                }
            }
            if (mode === 'swipe') {
                console.log("Touch Move Swipe called");
                evt.preventDefault();
                moveX = touches[0].clientX - startX;
                //if(moveX)
                moveY = touches[0].clientY - startY;
                console.log(touches[0].clientY);
                // console.log('moveX: ' + moveX);
                // console.log('moveY: ' + moveY);
                 
                console.log("Scale:" + scale);
                if (scale > 1) {
                   
                    positionX = initialPositionX + moveX;
                    if (isStateOverZoom) {

                        positionY = initialPositionY + moveY;
                        if (moveY > 0) {
                            if (positionY > -element[0].offsetTop) {
                                positionY = -element[0].offsetTop;
                            }
                        } else {
                            if (positionY < (elHeight + element[0].offsetTop - (elHeight * scale))) {
                                positionY = (elHeight + element[0].offsetTop - (elHeight * scale));
                            }
                        }

                    }
                    if (positionX > 0) {
                        positionX = 0;
                    } else if (positionX < elWidth * (1 - scale)) {
                        positionX = elWidth * (1 - scale);
                    }
                    transformElement();
                }


                // console.log("swipe");
                // console.log("positionX: " + positionX + "Width: " + elWidth * scale);
                // console.log("positionY: " + positionY + "Height: " + elHeight * scale);

                // if (isStateOverZoom) {
                //     if (moveY > 0) {
                //         if (positionY > -element[0].offsetTop) {
                //             positionY = -element[0].offsetTop;
                //         }
                //     } else {
                //         if (positionY < (elHeight + element[0].offsetTop - (elHeight * scale))) {
                //             positionY = (elHeight + element[0].offsetTop - (elHeight * scale));
                //         }
                //     }
                // }



                // }

            } else if (mode === 'pinch') {
                console.log("Touch Move Pinch called");
                evt.preventDefault();
                distance = getDistance(touches);
                relativeScale = distance / initialDistance;
                // console.log("relativeScale: " + relativeScale);
                scale = relativeScale * initialScale;
                positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
                positionY = originY * (1 - relativeScale) + initialPositionY + moveY;
                // console.log("pinchZoom");
                // console.log("positionX: " + positionX + "moveX: " + moveX + "initialPositionX: " + initialPositionX + "Width: " + elWidth * scale);
                // console.log("positionY: " + positionY + "moveY: " + moveY + "initialPositionY: " + initialPositionY + "Height:" + elHeight * scale);
                //if scale less than 1 pinch zoom not working
                if (scale > 1) {
                    transformElement();
                }

            }
        }

        function touchendHandler(evt) {
            console.log("Touch End called");
            var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;
            if (mode === '' || touches.length > 0) {
                return;
            }
            if (scale < 1) {
                scale = 1;
                positionX = 0;
                positionY = 0;
            } else if (scale > maxScale) {
                scale = maxScale;
                relativeScale = scale / initialScale;
                positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
                positionY = originY * (1 - relativeScale) + initialPositionY + moveY;
            }
         

            setOverZoomVarialbeIfRequired();
            // Swipe left or right
            performSwipeIfRequired();


            if (positionY > 0) {
                positionY = 0;
            } else if (positionY < elHeight * (1 - scale)) {
                positionY = elHeight * (1 - scale);
            }
            // else {
            //     if (positionX > 0) {
            //         positionX = 0;
            //     } else if (positionX < elWidth * (1 - scale)) {
            //         positionX = elWidth * (1 - scale);
            //     }
            //     if (positionY > 0) {
            //         positionY = 0;
            //     } else if (positionY < elHeight * (1 - scale)) {
            //         positionY = elHeight * (1 - scale);
            //     }
            // }
            transformElement(0.1);
            mode = '';
        }

        function getDistance(touches) {
            var d = Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2));
            return parseInt(d, 10);
        }

        function setOverZoomVarialbeIfRequired(){
               // console.log(positionY);
            if (positionY >= (elHeight + element[0].offsetTop - (elHeight * scale)) && (positionY <= -element[0].offsetTop)) {
                isStateOverZoom = true;
            } else if (positionY <= (elHeight + element[0].offsetTop - (elHeight * scale)) && (positionY >= -element[0].offsetTop)) {
                isStateOverZoom = false;
            }
        }
        function performSwipeIfRequired() {
            if (moveX > 1 * sensitivityOfSwipe * (scale > 1.5 ? 1.5 : scale)) {
                if (positionX >= 0) {
                    positionX = 0;

                    scope.$apply(function() {
                        // scope.$eval(attrs.prev); 
                        scope.prevFn();
                       // scale = 1;
              

                    });
                }
            } else if (moveX < -1 * sensitivityOfSwipe * (scale > 1.5 ? 1.5 : scale)) {
                if (positionX <= elWidth * (1 - scale)) {
                    positionX = elWidth * (1 - scale);
                    scope.$apply(function() {
                        // scope.$eval(attrs.next); 
                        scope.nextFn();
                      //  scale = 1;
                       
                    });
                }
            }
        }

        function transformElement(duration) {
            var transition = duration ? 'all cubic-bezier(0,0,.5,1) ' + duration + 's' : '';
            var matrixArray = [
                scale,
                0,
                0,
                scale,
                positionX,
                positionY
            ];
            var matrix = 'matrix(' + matrixArray.join(',') + ')';
            element.css({
                '-webkit-transition': transition,
                transition: transition,
                '-webkit-transform': matrix + ' translate3d(0,0,0)',
                transform: matrix
            });
        }
    }
    return _directive;
});
//@ sourceURL=pen.js
