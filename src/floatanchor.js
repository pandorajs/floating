define(function(require, exports, module) {

    /**
     * 悬浮层
     * @module Floating
     */
    'use strict';

    var $ = require('$'),
        Floating = require('./floating');

    var importStyle = require('./floatanchor.css');

    var $window = $(window);

    /**
     * 自动生成导航锚点。
     * @class FloatAnchor
     * @extends Floating
     * @constructor
     */
    var FloatAnchor = Floating.extend({

        defaults: {

            /**
             * 指定要生成锚点的元素
             * @attribute anchors
             * @type {String}
             */
            anchors: 'h2',

            contentWidth: 1000,

            vertical: 'middle',

            horizontal: 'right',

            /**
             * 是否导入默认样式
             * @attribute importStyle
             * @type {Boolean}
             */
            importStyle: true,

            /**
             * 是否显示“返回顶部”
             * @attribute gotoTop
             * @type {Boolean}
             */
            gotoTop: true,

            /**
             * 返回顶部的文本
             * @attribute topText
             * @type {String}
             */
            topText: '返回顶部',

            /**
             * 额外要加入悬浮层的元素
             * @attribute additional
             * @type {String} jquery选择符
             */
            additional: null,

            template: require('./floatanchor.handlebars')
        },

        initialize: function(options) {
            options.main = options.element;
            options.element = '<div></div>';
            FloatAnchor.superclass.initialize.apply(this, arguments);
        },

        setup: function() {
            var self = this;
            var additional = self.option('additional');
            self.main = $(self.option('main'));
            self.createData();
            if (self.option('importStyle')) {
                importStyle();
            }
            self.render();
            if (additional) {
                self.element.append($(additional));
            }
            FloatAnchor.superclass.setup.apply(self, arguments);
        },

        /**
         * 创建显示数据
         * @private
         */
        createData: function() {
            var self = this;
            var anchors = [];
            self.main.find(self.option('anchors')).each(function(i, current) {
                var item = $(current);
                anchors.push({
                    id: item.attr('id'),
                    title: item.attr('data-title') || item.text()
                });
            });
            self.option('data', {
                anchors: anchors,
                gotoTop: self.option('gotoTop'),
                topText: self.option('topText')
            });
        }
    });

    module.exports = FloatAnchor;

});
