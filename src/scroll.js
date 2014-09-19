define(function(require, exports, module) {

    /**
     * 悬浮层
     * @module Floating
     */

    'use strict';
    var $ = require('$');
    var Base = require('base');

    var $window = $(window);
    var $document = $(document);

    /**
     * 位置监测,监测元素进入或离开屏幕可见区域.
     *
     * @class Scroll
     * @extends Base
     * @constructor
     */
    var Scroll = Base.extend({

        defaults: {
            /**
             * 要监测的元素列表
             * @attribute watchers
             * @default []
             * @type {Array}
             */
            watchers: [],

            /**
             * 中间线偏移设置
             * @attribute middleOffset
             * @default 0
             * @type {Number}
             */
            middleOffset: 0
        },

        initialize: function() {
            Scroll.superclass.initialize.apply(this, arguments);
            this.init();
        },

        /**
         * 初始化
         * @private
         */
        init: function() {
            var self = this;
            var item;
            var list = self.option('watchers');

            self.watchers = [];
            self.exports = {};
            self.globalState = {};

            for (var i = list.length - 1; i >= 0; i--) {
                item = {
                    $item: $(list[i]),
                    state: {}
                };
                self.updateWatcher(item);
                self.watchers.push(item);
            }

            $window.on('scroll resize', function() {
                self.updateViewInfo();
                self.triggerWatchers();
            });

            self.updateViewInfo();
            self.triggerWatchers();
        },

        /**
         * 触发事件
         * @private
         */
        triggerWatchers: function() {
            var self = this;
            var item;
            var state;
            var globalState;
            var watchers = self.watchers;
            var exports = self.exports;
            var i = watchers.length;

            globalState = {
                /**
                 * 滚动到顶部
                 * @event getToTop
                 * @param {object} e Event.
                 */
                getToTop: exports.viewportTop <= 0,
                /**
                 * 滚动到未尾
                 * @event getToBottom
                 * @param {object} e Event.
                 */
                getToBottom: exports.viewportBottom >= exports.documentHeight
            };
            /**
             * 滚动条离开顶部
             * @event leaveTop
             * @param {object} e Event.
             */
            globalState.leaveTop = !globalState.getToTop;

            /**
             * 滚动条离开底部
             * @event leaveBottom
             * @param {object} e Event.
             */
            globalState.leaveBottom = !globalState.getToBottom;

            for (var eventName in globalState) {
                if (globalState[eventName] !== self.globalState[eventName]) {
                    globalState[eventName] && self.fire(eventName);
                    self.globalState[eventName] = globalState[eventName];
                }
            }

            while (i--) {
                item = watchers[i];
                state = {
                    /**
                     * 进入视图
                     * @event enterViewport
                     * @param {object} e Event.
                     * @param {jquery} watcher 被监控的jq对象
                     */
                    enterViewport: item.top >= exports.viewportTop && item.top <= exports.viewportBottom ||
                        item.bottom >= exports.viewportTop && item.bottom <= exports.viewportBottom,

                    /**
                     * 进入视图中间
                     * @event enterViewport
                     * @param {object} e Event.
                     * @param {jquery} watcher 被监控的jq对象
                     */
                    enterMiddle: exports.middle >= item.top && exports.middle <= item.bottom
                };

                /**
                 * 离开视图
                 * @event exitViewport
                 * @param {object} e Event.
                 * @param {jquery} watcher 被监控的jq对象?
                 */
                state.exitViewport = !state.enterViewport;

                /**
                 * 离开视图中间
                 * @event exitMiddle
                 * @param {object} e Event.
                 * @param {jquery} watcher 被监控的jq对象
                 */
                state.exitMiddle = !state.enterMiddle;
                for (var name in state) {
                    if (state[name] !== item[name]) {
                        state[name] && self.fire(name, item.$item);
                        item[name] = state[name];
                    }
                }
            }
        },

        /**
         * 获取视图高度
         * @private
         * @return {number} 视图高度
         */
        windowHeight: function() {
            return window.innerHeight || document.documentElement.clientHeight;
        },

        /**
         * 更新屏幕和监测的元素信息
         * @private
         */
        updateViewInfo: function() {
            var self = this;
            var i;
            var watchers = self.watchers;
            var exports = self.exports;
            var middleOffset = parseInt(self.option('middleOffset'), 10);
            exports.viewportTop = $window.scrollTop();
            exports.viewportBottom = exports.viewportTop + self.windowHeight();
            exports.documentHeight = $document.height();
            exports.middle = (exports.viewportTop + exports.viewportBottom) / 2 + middleOffset;
            if (exports.documentHeight !== self.previousDocumentHeight) {
                i = watchers.length;
                while (i--) {
                    self.updateWatcher(watchers[i]);
                }
                self.previousDocumentHeight = exports.documentHeight;
            }
        },

        /**
         * 更新节点位置信息
         * @param  {Object} watcher 节点信息对象
         * @private
         */
        updateWatcher: function(watcher) {
            var offset = watcher.$item.offset();
            watcher.top = offset.top;
            watcher.bottom = offset.top + watcher.$item.outerHeight();
        }
    });

    module.exports = Scroll;

});
