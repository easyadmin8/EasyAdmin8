/**
 * @autho wolfcode
 * @description switchSelect.js
 * @time 2025年7月23日 16:07:06
 */

layui.define(['form'], function (exports) {
    let form = layui.form, $ = layui.$;

    // 构造函数
    let SwitchSelect = function (options) {
        this.config = $.extend({
            elem: null,     // 容器选择器
            data: [],       // 选项数据 {1:'正常',2:'禁用',3:'删除'} Key => Value 形式
            default: '',    // 默认值
            target: '',     // 默认显示形式
            name: '',       // 表单 name
            onSwitch: null  // 切换回调
        }, options);
        this.render();
    };

    // 原型方法
    SwitchSelect.prototype = {
        // 渲染组件
        render: function () {
            let that = this;
            let elem = $(this.config.elem);
            if (!elem.length) return;
            let active, toggleHidden
            switch (this.config.target) {
                case 'radio':
                    active = 'radio';
                    toggleHidden = 'select';
                    break;
                case 'select':
                    active = 'select';
                    toggleHidden = 'radio';
                    break;
                default:
                    active = 'select';
                    toggleHidden = 'radio';
            }

            // 创建HTML结构
            let html = `
                <div class="layui-switch-select">
                    <div class="toggle-dots">
                        <span class="dot ${active === 'radio' ? 'active' : ''}" data-target="radio"></span>
                        <span class="dot ${active === 'select' ? 'active' : ''}" data-target="select"></span>
                    </div>
                    <div class="layui-input-block">
                        <div class="radio-container ${toggleHidden === 'radio' ? 'toggle-hidden' : ''}">${this.generateRadioHtml()}</div>
                        <div class="select-container ${toggleHidden === 'select' ? 'toggle-hidden' : ''}">
                            <select name="${this.config.name}" lay-filter="switchSelectFilter_${this.config.name}" class="layui-select">
                                ${this.generateSelectHtml()}
                            </select>
                        </div>
                    </div>
                </div>
            `;
            elem.html(html);
            form.render();
            this.bindEvents();
        },

        // 生成单选框HTML
        generateRadioHtml: function () {
            let html = '';
            $.map(this.config.data, (item, index) => {
                let checked = index == this.config.default ? 'checked' : '';
                html += `\n<input type="radio" name="${this.config.name}" lay-filter="switchSelectFilter_${this.config.name}" value="${index}" title="${item}" ${checked}>\n`;
            });
            return html;
        },

        // 生成下拉框HTML
        generateSelectHtml: function () {
            let html = '';
            $.map(this.config.data, (item, index) => {
                let selected = index == this.config.default ? 'selected' : '';
                html += `\n<option value="${index}" ${selected}>${item}</option>\n`;
            });
            return html;
        },

        // 绑定事件
        bindEvents: function () {
            let that = this;
            let elem = $(this.config.elem);
            let radioContainer = elem.find('.radio-container');
            let selectContainer = elem.find('.select-container');
            let toggleDots = elem.find('.dot');

            // 圆点切换事件
            toggleDots.on('click', function () {
                let target = $(this).data('target');
                if (target === 'radio') {
                    radioContainer.removeClass('toggle-hidden');
                    selectContainer.addClass('toggle-hidden');
                } else {
                    radioContainer.addClass('toggle-hidden');
                    selectContainer.removeClass('toggle-hidden');
                }

                // 更新激活状态
                toggleDots.removeClass('active');
                $(this).addClass('active');

                // 同步数据
                that.syncData(target);

                // 触发回调
                if (typeof that.config.onSwitch === 'function') {
                    that.config.onSwitch(target);
                }
            });

            // 监听单选按钮变化
            form.on('radio', function (data) {
                let that = $(this);
                let name = $(data.elem).attr('name')
                if (that.attr('lay-filter') !== `switchSelectFilter_${name}`) return;
                let value = $(data.elem).val()
                elem.find(`select[name="${name}"]`).val(value);
                form.render('select');
            });

            // 监听下拉框变化
            form.on('select', function (data) {
                let name = $(data.elem).attr('name')
                if ($(data.elem).attr('lay-filter') !== `switchSelectFilter_${name}`) return;
                let value = $(data.elem).val()
                elem.find(`input[name="${name}"][value="${value}"]`).prop('checked', true);
                form.render('radio');
            });
        },

        // 同步数据
        syncData: function (target) {
            let elem = $(this.config.elem);
            if (target === 'radio') {
                let selectValue = elem.find(`select[name="${this.config.name}"]`).val();
                elem.find(`input[name="${this.config.name}"][value="` + selectValue + '"]').prop('checked', true);
                form.render('radio');
            } else {
                let radioValue = elem.find(`input[name="${this.config.name}"]:checked`).val();
                elem.find(`select[name="${this.config.name}"]`).val(radioValue);
                form.render('select');
            }
        },

        // 获取当前值
        getValue: function () {
            return $(this.config.elem).find(`input[name="${this.config.name}"]:checked`).val();
        },

        // 设置值
        setValue: function (value) {
            let elem = $(this.config.elem);
            elem.find(`input[name="${this.config.name}"][value="${value}"]`).prop('checked', true);
            elem.find(`select[name="${this.config.name}"]`).val(value);
            form.render();
        },
    };

    // 暴露接口
    exports('switchSelect', function (options) {
        return new SwitchSelect(options);
    });
});

let currentScriptPath = document.currentScript.src;
const urlObj = new URL(currentScriptPath);
layui.link(urlObj.pathname.replace('switchSelect.js', 'switchSelect.css'));
