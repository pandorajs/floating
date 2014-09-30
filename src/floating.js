define(function(require, exports, module) {

    /**
     * 悬浮层
     * @module Floating
     */
    'use strict';

    var $ = require('$');
    var Widget = require('widget');
    var Scroll = require('./scroll');

    var isIE = !!window.ActiveXObject;
    var isIE6 = isIE && !window.XMLHttpRequest;
    var $window = $(window);

    /**
     * 浮层类，一般用于浮动导航,回顶部等。
     * @class Floating
     * @extends Widget
     * @uses Scroll
     * @constructor
     */
    var Floating = Widget.extend({

        defaults: {
            /**
             * 中间内容的宽度，配成0代表相对于屏幕
             * @attribute contentWidth
             * @default 980
             * @type {Number}
             */
            contentWidth: 980,

            /**
             * 垂直对齐,支持'bottom、middle、top'
             * @attribute vertical
             * @default 'bottom'
             * @type {String}
             */
            vertical: 'bottom',

            /**
             * 水平对齐,支持'left、center、right'
             * @attribute horizontal
             * @default 'right'
             * @type {String}
             */
            horizontal: 'right',

            /**
             * 对齐后的偏移微调
             * @attribute offset
             * @default {x:10,y:10}
             * @type {Object}
             */
            offset: {
                x: 10, //TODO支持百分比
                y: 10
            },

            /**
             * 是否开启锚点位置监测,比如当某个锚点进入视图时，改变浮层上对应的导航样式
             * @attribute useAnchor
             * @default false
             * @type {Boolean}
             */
            useAnchor: false,

            /**
             * 到达顶部时是否隐藏本浮层
             * @attribute topHide
             * @default false
             * @type {Boolean}
             */
            topHide : false,

            /**
             * 锚点进入视图后，浮层上的导航要应用的样式名
             * @attribute activeClass
             * @default 'active'
             * @type {String}
             */
            activeClass: 'active',

            /**
             * 中间线偏移设置
             * @attribute middleOffset
             * @default 0
             * @type {Number}
             */
            middleOffset : 0,

            classPrefix: 'ue-floating',

            delegates: {
                'click [data-role=close]': function() {
                    this.hide();
                },

                'click [data-role=goTop]': function() {
                    $('body,html').animate({
                        scrollTop: 0
                    }, 200);
                }
            }
        },

        setup: function() {
            var self = this;
            self.setPosition();
            self.createAnchor();
        },

        /**
         * 设置位置
         * @method setPosition
         * @private
         */
        setPosition: function() {
            var self = this;
            var top, left, mleft;
            var contentWidth = self.option('contentWidth');
            var vertical = self.option('vertical');
            var horizontal = self.option('horizontal');
            var offset = self.option('offset');
            var selfElement = self.element;
            var selfWidth = selfElement.outerWidth();
            var selfHeight = selfElement.outerHeight();
            var temObj = {};
            if (isIE6) {
                selfElement.css('position', 'absolute');
                self.fixIe6();
            } else {
                selfElement.css('position', 'fixed');
            }
            if (contentWidth) {
                contentWidth = parseInt(contentWidth, 10);
                mleft = contentWidth / 2 + offset.x;
                temObj.left = '50%';
                temObj.marginLeft = horizontal == 'right' ? mleft : 0 - mleft - selfWidth + 'px';
            } else {
                temObj[horizontal] = offset.x + 'px';
            }
            if (horizontal == 'center') {
                temObj.left = '50%';
                temObj.marginLeft = 0 - selfWidth / 2 + offset.x + 'px';
            }
            if (vertical == 'middle') {
                temObj.top = '50%';
                temObj.marginTop = 0 - (selfHeight / 2) + offset.y;
            } else {
                temObj[vertical] = offset.y + 'px';
            }
            selfElement.css(temObj);
            $window.trigger('scroll');
        },

        /**
         * 修复IE6不支持fixed的问题
         * @method fixIe6
         * @private
         */
        fixIe6: function() {
            var self = this;
            var offset = self.option('offset');
            var selfHeight = self.element.outerHeight();
            $window.on('scroll resize', function() {
                var top;
                var clientHeight = window.innerHeight || document.documentElement.clientHeight;
                var scrollTop = $window.scrollTop();
                switch (self.option('vertical')) {
                    case 'middle':
                        top = scrollTop + clientHeight / 2 - selfHeight / 2 + offset.y;
                        break;
                    case 'bottom':
                        top = scrollTop + clientHeight - selfHeight - offset.y;
                        break;
                    case 'top':
                        top = scrollTop + offset.y;
                        break;
                    default:
                        break;
                }
                self.element.css({
                    top: top + 'px',
                    marginTop: '0px'
                });
            });
        },

        /**
         * 创建锚点监测
         * @method createAnchor
         * @private
         */
        createAnchor: function() {
            var self = this;
            var anchorMap = self.anchorMap = {};
            var anchorList = [];
            var activeClass = self.option('activeClass');
            var topHide = self.option('topHide');

            if (self.option('useAnchor')) {
                self.$('a').each(function() {
                    var $anchor;
                    var item = $(this);
                    var href = item.attr('href');
                    var anchorId = href.match(/^#(.+)/);
                    if (anchorId) {
                        anchorId = anchorId[1];
                        anchorMap[anchorId] = item;
                        $anchor = $('#' + anchorId);
                        if ($anchor.length) {
                            anchorList.push($anchor);
                        }
                    }
                });
            }

            self.scroll = new Scroll({
                watchers: anchorList,
                middleOffset: self.option('middleOffset'),
                events: {
                    all: function(event) {
                        self.fire.apply(self, arguments);
                    },
                    enterMiddle: function(event, $item) {
                        var id = $item.attr('id');
                        anchorMap[id] && anchorMap[id].addClass(activeClass);
                    },
                    exitMiddle: function(event, $item) {
                        var id = $item.attr('id');
                        anchorMap[id] && anchorMap[id].removeClass(activeClass);
                    },
                    getToTop: function() {
                        topHide && self.hide();
                    },
                    leaveTop: function() {
                        topHide && self.show();
                    }
                }
            });
        }
    });

    module.exports = Floating;

});
