/**
 * date:2020/02/28
 * author:Mr.Chung
 * version:2.0
 * description:layuimini tab框架扩展
 */
define(["jquery"], function ($) {
    var $ = layui.$,
        layer = layui.layer;

    var miniTheme = {

        /**
         * 主题配置项
         * @param bgcolorId
         * @returns {{headerLogo, menuLeftHover, headerRight, menuLeft, headerRightThis, menuLeftThis}|*|*[]}
         */
        config: function (bgcolorId) {
            var bgColorConfig = [
                {
                    headerRightBg: '#ffffff', //头部右侧背景色
                    headerRightBgThis: '#f4f5f5', //头部右侧选中背景色,
                    headerRightColor: 'rgba(107, 107, 107, 0.7)', //头部右侧字体颜色,
                    headerRightChildColor: 'rgba(107, 107, 107, 0.7)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#565656', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(160, 160, 160, 0.7)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#1E9FFF', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#ffffff', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#565656', //头部缩放按钮样式,
                    headerLogoBg: '#ffffff', //logo背景颜色,
                    headerLogoColor: '#333333', //logo字体颜色,
                    leftMenuNavMore: '#999999', //左侧菜单更多下拉样式,
                    leftMenuBg: '#ffffff', //左侧菜单背景,
                    leftMenuBgThis: '#f4f5f5', //左侧菜单选中背景,
                    leftMenuChildBg: '#efefef', //左侧菜单子菜单背景,
                    leftMenuColor: '#333333', //左侧菜单字体颜色,
                    leftMenuColorThis: '#1E9FFF', //左侧菜单选中字体颜色,
                    tabActiveColor: '#1e9fff', //tab选项卡选中颜色,
                    tabHeaderBg: '#efefef', //tab头部背景色
                    tabItemBg: '#ffffff', //tab选项背景色
                    tabColor: '#333333', //tab选项字体颜色
                    leftBorderColor: '#efefef', //左侧间隔线颜色
                },
                {
                    headerRightBg: '#232324', //头部右侧背景色
                    headerRightBgThis: '#0f0f1a', //头部右侧选中背景色,
                    headerRightColor: 'rgba(255,255,255,.8)', //头部右侧字体颜色,
                    headerRightChildColor: 'var(--lay-color-text-1)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#ffffff', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(255,255,255,.6)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#16b777', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#ffffff', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#16b777', //头部缩放按钮样式,
                    headerLogoBg: '#232324', //logo背景颜色,
                    headerLogoColor: 'rgba(255,255,255,.8)', //logo字体颜色,
                    leftMenuNavMore: 'rgba(255,255,255,.5)', //左侧菜单更多下拉样式,
                    leftMenuBg: '#232324', //左侧菜单背景,
                    leftMenuBgThis: '#16213e', //左侧菜单选中背景,
                    leftMenuChildBg: '#232324', //左侧菜单子菜单背景,
                    leftMenuColor: 'rgba(255,255,255,.85)', //左侧菜单字体颜色,
                    leftMenuColorThis: '#16b777', //左侧菜单选中字体颜色,
                    tabActiveColor: '#16b777', //tab选项卡选中颜色,
                    tabColor: 'rgba(255,255,255,.85)', //tab选项字体颜色
                    leftBorderColor: 'rgba(255,255,255,0.06)', //左侧间隔线颜色
                    tabHeaderBg: '#efefef', //tab头部背景色
                    tabItemBg: '#232324', //tab选项背景色
                },
                {
                    headerRightBg: '#1e9fff', //头部右侧背景色
                    headerRightBgThis: '#0c7fd4', //头部右侧选中背景色,
                    headerRightColor: '#ffffff', //头部右侧字体颜色,
                    headerRightChildColor: 'var(--lay-color-text-1)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#ffffff', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(255,255,255,.7)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#ffffff', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#1e9fff', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#ffffff', //头部缩放按钮样式,
                    headerLogoBg: '#1f1f1f', //logo背景颜色,
                    headerLogoColor: 'rgba(255,255,255,.85)', //logo字体颜色,
                    leftMenuNavMore: 'rgba(255,255,255,.5)', //左侧菜单更多下拉样式,
                    leftMenuBg: '#1f1f1f', //左侧菜单背景,
                    leftMenuBgThis: '#1e9fff', //左侧菜单选中背景,
                    leftMenuChildBg: 'rgba(0,0,0,.3)', //左侧菜单子菜单背景,
                    leftMenuColor: 'rgba(255,255,255,.85)', //左侧菜单字体颜色,
                    leftMenuColorThis: '#ffffff', //左侧菜单选中字体颜色,
                    tabActiveColor: '#1e9fff', //tab选项卡选中颜色,
                    tabColor: '#333333', //tab选项字体颜色
                    leftBorderColor: 'rgba(255,255,255,0.08)', //左侧间隔线颜色
                    tabHeaderBg: '#f6f8fa', //tab头部背景色
                    tabItemBg: '#ffffff', //tab选项背景色
                },
                {
                    headerRightBg: '#16b777', //头部右侧背景色
                    headerRightBgThis: '#0e9c68', //头部右侧选中背景色,
                    headerRightColor: '#ffffff', //头部右侧字体颜色,
                    headerRightChildColor: 'var(--lay-color-text-1)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#ffffff', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(255,255,255,.7)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#ffffff', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#16b777', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#ffffff', //头部缩放按钮样式,
                    headerLogoBg: '#23262e', //logo背景颜色,
                    headerLogoColor: 'rgba(255,255,255,.85)', //logo字体颜色,
                    leftMenuNavMore: 'rgba(255,255,255,.5)', //左侧菜单更多下拉样式,
                    leftMenuBg: '#23262e', //左侧菜单背景,
                    leftMenuBgThis: '#16b777', //左侧菜单选中背景,
                    leftMenuChildBg: 'rgba(0,0,0,.3)', //左侧菜单子菜单背景,
                    leftMenuColor: 'rgba(255,255,255,.85)', //左侧菜单字体颜色,
                    leftMenuColorThis: '#ffffff', //左侧菜单选中字体颜色,
                    tabActiveColor: '#16b777', //tab选项卡选中颜色,
                    tabColor: '#333333', //tab选项字体颜色
                    leftBorderColor: 'rgba(255,255,255,0.08)', //左侧间隔线颜色
                    tabHeaderBg: '#f6f8fa', //tab头部背景色
                    tabItemBg: '#ffffff', //tab选项背景色
                },
                {
                    headerRightBg: '#ff6b81', //头部右侧背景色
                    headerRightBgThis: '#d94f63', //头部右侧选中背景色,
                    headerRightColor: '#ffffff', //头部右侧字体颜色,
                    headerRightChildColor: 'var(--lay-color-text-1)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#ffffff', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(255,255,255,.7)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#ffffff', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#ff6b81', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#ffffff', //头部缩放按钮样式,
                    headerLogoBg: '#2f4056', //logo背景颜色,
                    headerLogoColor: 'rgba(255,255,255,.85)', //logo字体颜色,
                    leftMenuNavMore: 'rgba(255,255,255,.5)', //左侧菜单更多下拉样式,
                    leftMenuBg: '#2f4056', //左侧菜单背景,
                    leftMenuBgThis: '#ff6b81', //左侧菜单选中背景,
                    leftMenuChildBg: 'rgba(0,0,0,.3)', //左侧菜单子菜单背景,
                    leftMenuColor: 'rgba(255,255,255,.85)', //左侧菜单字体颜色,
                    leftMenuColorThis: '#ffffff', //左侧菜单选中字体颜色,
                    tabActiveColor: '#ff6b81', //tab选项卡选中颜色,
                    tabColor: '#333333', //tab选项字体颜色
                    leftBorderColor: 'rgba(255,255,255,0.08)', //左侧间隔线颜色
                    tabHeaderBg: '#f6f8fa', //tab头部背景色
                    tabItemBg: '#ffffff', //tab选项背景色
                },
                {
                    headerRightBg: '#ffb800', //头部右侧背景色
                    headerRightBgThis: '#d09600', //头部右侧选中背景色,
                    headerRightColor: '#ffffff', //头部右侧字体颜色,
                    headerRightChildColor: 'var(--lay-color-text-1)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#ffffff', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(255,255,255,.7)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#ffffff', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#ffb800', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#ffffff', //头部缩放按钮样式,
                    headerLogoBg: '#2f4056', //logo背景颜色,
                    headerLogoColor: 'rgba(255,255,255,.85)', //logo字体颜色,
                    leftMenuNavMore: 'rgba(255,255,255,.5)', //左侧菜单更多下拉样式,
                    leftMenuBg: '#2f4056', //左侧菜单背景,
                    leftMenuBgThis: '#ffb800', //左侧菜单选中背景,
                    leftMenuChildBg: 'rgba(0,0,0,.3)', //左侧菜单子菜单背景,
                    leftMenuColor: 'rgba(255,255,255,.85)', //左侧菜单字体颜色,
                    leftMenuColorThis: '#ffffff', //左侧菜单选中字体颜色,
                    tabActiveColor: '#ffb800', //tab选项卡选中颜色,
                    tabColor: '#333333', //tab选项字体颜色
                    leftBorderColor: 'rgba(255,255,255,0.08)', //左侧间隔线颜色
                    tabHeaderBg: '#f6f8fa', //tab头部背景色
                    tabItemBg: '#ffffff', //tab选项背景色
                },
                {
                    headerRightBg: '#a855f7', //头部右侧背景色
                    headerRightBgThis: '#7c3aed', //头部右侧选中背景色,
                    headerRightColor: '#ffffff', //头部右侧字体颜色,
                    headerRightChildColor: 'var(--lay-color-text-1)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#ffffff', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(255,255,255,.7)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#ffffff', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#a855f7', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#ffffff', //头部缩放按钮样式,
                    headerLogoBg: '#1f1f1f', //logo背景颜色,
                    headerLogoColor: 'rgba(255,255,255,.85)', //logo字体颜色,
                    leftMenuNavMore: 'rgba(255,255,255,.5)', //左侧菜单更多下拉样式,
                    leftMenuBg: '#1f1f1f', //左侧菜单背景,
                    leftMenuBgThis: '#a855f7', //左侧菜单选中背景,
                    leftMenuChildBg: 'rgba(0,0,0,.3)', //左侧菜单子菜单背景,
                    leftMenuColor: 'rgba(255,255,255,.85)', //左侧菜单字体颜色,
                    leftMenuColorThis: '#ffffff', //左侧菜单选中字体颜色,
                    tabActiveColor: '#a855f7', //tab选项卡选中颜色,
                    tabColor: '#333333', //tab选项字体颜色
                    leftBorderColor: 'rgba(255,255,255,0.08)', //左侧间隔线颜色
                    tabHeaderBg: '#f6f8fa', //tab头部背景色
                    tabItemBg: '#ffffff', //tab选项背景色
                },
                {
                    headerRightBg: '#e82121', //头部右侧背景色
                    headerRightBgThis: '#b01515', //头部右侧选中背景色,
                    headerRightColor: '#ffffff', //头部右侧字体颜色,
                    headerRightChildColor: 'var(--lay-color-text-1)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#ffffff', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(255,255,255,.7)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#ffffff', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#e82121', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#ffffff', //头部缩放按钮样式,
                    headerLogoBg: '#1f1f1f', //logo背景颜色,
                    headerLogoColor: 'rgba(255,255,255,.85)', //logo字体颜色,
                    leftMenuNavMore: 'rgba(255,255,255,.5)', //左侧菜单更多下拉样式,
                    leftMenuBg: '#1f1f1f', //左侧菜单背景,
                    leftMenuBgThis: '#e82121', //左侧菜单选中背景,
                    leftMenuChildBg: 'rgba(0,0,0,.3)', //左侧菜单子菜单背景,
                    leftMenuColor: 'rgba(255,255,255,.85)', //左侧菜单字体颜色,
                    leftMenuColorThis: '#ffffff', //左侧菜单选中字体颜色,
                    tabActiveColor: '#e82121', //tab选项卡选中颜色,
                    tabColor: '#333333', //tab选项字体颜色
                    leftBorderColor: 'rgba(255,255,255,0.08)', //左侧间隔线颜色
                    tabHeaderBg: '#f6f8fa', //tab头部背景色
                    tabItemBg: '#ffffff', //tab选项背景色
                },
                {
                    headerRightBg: '#eb6709', //头部右侧背景色
                    headerRightBgThis: '#c5570a', //头部右侧选中背景色,
                    headerRightColor: '#ffffff', //头部右侧字体颜色,
                    headerRightChildColor: 'var(--lay-color-text-1)', //头部右侧下拉字体颜色,
                    headerRightColorThis: '#ffffff', //头部右侧鼠标选中,
                    headerRightNavMore: 'rgba(255,255,255,.7)', //头部右侧更多下拉颜色,
                    headerRightNavMoreBg: '#ffffff', //头部右侧更多下拉列表选中背景色,
                    headerRightNavMoreColor: '#eb6709', //头部右侧更多下拉列表字体色,
                    headerRightToolColor: '#ffffff', //头部缩放按钮样式,
                    headerLogoBg: '#2f4056', //logo背景颜色,
                    headerLogoColor: 'rgba(255,255,255,.85)', //logo字体颜色,
                    leftMenuNavMore: 'rgba(255,255,255,.5)', //左侧菜单更多下拉样式,
                    leftMenuBg: '#2f4056', //左侧菜单背景,
                    leftMenuBgThis: '#eb6709', //左侧菜单选中背景,
                    leftMenuChildBg: 'rgba(0,0,0,.3)', //左侧菜单子菜单背景,
                    leftMenuColor: 'rgba(255,255,255,.85)', //左侧菜单字体颜色,
                    leftMenuColorThis: '#ffffff', //左侧菜单选中字体颜色,
                    tabActiveColor: '#eb6709', //tab选项卡选中颜色,
                    tabColor: '#333333', //tab选项字体颜色
                    leftBorderColor: 'rgba(255,255,255,0.08)', //左侧间隔线颜色
                    tabHeaderBg: '#f6f8fa', //tab头部背景色
                    tabItemBg: '#ffffff', //tab选项背景色
                }
            ];
            if (bgcolorId === undefined) {
                return bgColorConfig;
            } else {
                return bgColorConfig[bgcolorId];
            }
        },

        /**
         * 初始化
         * @param options
         */
        render: function (options) {
            options.bgColorDefault = options.bgColorDefault || false;
            options.listen = options.listen || false;
            var bgcolorId = localStorage.getItem('layuiminiBgColorId');
            if (bgcolorId === null || bgcolorId === undefined || bgcolorId === '') {
                bgcolorId = options.bgColorDefault;
            }
            bgcolorId = bgcolorId || '0';
            miniTheme.buildThemeCss(bgcolorId);
            if (options.listen) miniTheme.listen(options);
        },

        renderElemStyle(elemStyleDefault) {
            elemStyleDefault = elemStyleDefault || 'normal';
            let elemStyleName = localStorage.getItem('layuiminiElemStyleName');
            if (!elemStyleName) elemStyleName = elemStyleDefault;
            let themeModeEle = $('input[name=theme-mode]')
            if (themeModeEle.length > 0) {
                if (elemStyleName === 'dark') {
                    themeModeEle.prop('checked', true);
                } else {
                    themeModeEle.prop('checked', false);
                }
                layui.form.render('checkbox', 'header-theme-mode');
            }
            miniTheme.buildBodyElemStyle(elemStyleName);
        },

        changeThemeMainColor() {
            let bgcolorId = localStorage.getItem('layuiminiBgColorId');
            if (bgcolorId === null || bgcolorId === undefined || bgcolorId === '') return false;
            let bgcolorData = miniTheme.config(bgcolorId);
            let mainColor = bgcolorData.headerRightBg
            if (bgcolorId == 0) mainColor = '#16b777';
            const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--ea8-theme-main-color');
            document.documentElement.style.setProperty('--ea8-theme-main-color', mainColor);
            const iframes = document.getElementsByTagName('iframe');
            if (iframes.length === 0) return false;
            $.each(iframes, (i, iframe) => {
                if (iframe === '' || iframe === undefined) return false;
                const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                iframeDocument.documentElement.style.setProperty('--ea8-theme-main-color', mainColor);
            })
        },

        /**
         * 构建主题样式
         * @param bgcolorId
         * @returns {boolean}
         */
        buildThemeCss: function (bgcolorId) {
            if (!bgcolorId) {
                return false;
            }
            var bgcolorData = miniTheme.config(bgcolorId);
            var styleHtml = '/*头部右侧背景色 headerRightBg */\n' +
                '.layui-layout-admin .layui-header {\n' +
                '    background-color: ' + bgcolorData.headerRightBg + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*头部右侧选中背景色 headerRightBgThis */\n' +
                '.layui-layout-admin .layui-header .layuimini-header-content > ul > .layui-nav-item.layui-this, .layuimini-tool i:hover {\n' +
                '    background-color: ' + bgcolorData.headerRightBgThis + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*头部右侧字体颜色 headerRightColor */\n' +
                '.layui-layout-admin .layui-header .layui-nav .layui-nav-item a {\n' +
                '    color:  ' + bgcolorData.headerRightColor + ';\n' +
                '}\n' +
                '/**头部右侧下拉字体颜色 headerRightChildColor */\n' +
                '.layui-layout-admin .layui-header .layui-nav .layui-nav-item .layui-nav-child a {\n' +
                '    color:  ' + bgcolorData.headerRightChildColor + '!important;\n' +
                '}\n' +
                '\n' +
                '/*头部右侧鼠标选中 headerRightColorThis */\n' +
                '.layui-header .layuimini-menu-header-pc.layui-nav .layui-nav-item a:hover, .layui-header .layuimini-header-menu.layuimini-pc-show.layui-nav .layui-this a {\n' +
                '    color: ' + bgcolorData.headerRightColorThis + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*头部右侧更多下拉颜色 headerRightNavMore */\n' +
                '.layui-header .layui-nav .layui-nav-more {\n' +
                '    border-top-color: ' + bgcolorData.headerRightNavMore + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*头部右侧更多下拉颜色 headerRightNavMore */\n' +
                '.layui-header .layui-nav .layui-nav-mored, .layui-header .layui-nav-itemed > a .layui-nav-more {\n' +
                '    border-color: transparent transparent ' + bgcolorData.headerRightNavMore + ' !important;\n' +
                '}\n' +
                '\n' +
                '/**头部右侧更多下拉配置色 headerRightNavMoreBg headerRightNavMoreColor */\n' +
                '.layui-header .layui-nav .layui-nav-child dd.layui-this a, .layui-header .layui-nav-child dd.layui-this, .layui-layout-admin .layui-header .layui-nav .layui-nav-item .layui-nav-child .layui-this a {\n' +
                '    background-color: ' + bgcolorData.headerRightNavMoreBg + ' !important;\n' +
                '    color:' + bgcolorData.headerRightNavMoreColor + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*头部缩放按钮样式 headerRightToolColor */\n' +
                '.layui-layout-admin .layui-header .layuimini-tool i {\n' +
                '    color: ' + bgcolorData.headerRightToolColor + ';\n' +
                '}\n' +
                '\n' +
                '/*logo背景颜色 headerLogoBg */\n' +
                '.layui-layout-admin .layuimini-logo {\n' +
                '    background-color: ' + bgcolorData.headerLogoBg + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*logo字体颜色 headerLogoColor */\n' +
                '.layui-layout-admin .layuimini-logo h1 {\n' +
                '    color: ' + bgcolorData.headerLogoColor + ';\n' +
                '}\n' +
                '\n' +
                '/*左侧菜单更多下拉样式 leftMenuNavMore */\n' +
                '.layuimini-menu-left .layui-nav .layui-nav-more,.layuimini-menu-left-zoom.layui-nav .layui-nav-more {\n' +
                '    border-top-color: ' + bgcolorData.leftMenuNavMore + ';\n' +
                '}\n' +
                '\n' +
                '/*左侧菜单更多下拉样式 leftMenuNavMore */\n' +
                '.layuimini-menu-left .layui-nav .layui-nav-mored, .layuimini-menu-left .layui-nav-itemed > a .layui-nav-more,   .layuimini-menu-left-zoom.layui-nav .layui-nav-mored, .layuimini-menu-left-zoom.layui-nav-itemed > a .layui-nav-more {\n' +
                '    border-color: transparent transparent  ' + bgcolorData.leftMenuNavMore + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*左侧菜单背景 leftMenuBg */\n' +
                '.layui-side.layui-bg-black, .layui-side.layui-bg-black > .layuimini-menu-left > ul, .layuimini-menu-left-zoom > ul {\n' +
                '    background-color:  ' + bgcolorData.leftMenuBg + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*左侧菜单选中背景 leftMenuBgThis */\n' +
                '.layuimini-menu-left .layui-nav-tree .layui-this, .layuimini-menu-left .layui-nav-tree .layui-this > a, .layuimini-menu-left .layui-nav-tree .layui-nav-child dd.layui-this, .layuimini-menu-left .layui-nav-tree .layui-nav-child dd.layui-this a, .layuimini-menu-left-zoom.layui-nav-tree .layui-this, .layuimini-menu-left-zoom.layui-nav-tree .layui-this > a, .layuimini-menu-left-zoom.layui-nav-tree .layui-nav-child dd.layui-this, .layuimini-menu-left-zoom.layui-nav-tree .layui-nav-child dd.layui-this a {\n' +
                '    background-color: ' + bgcolorData.leftMenuBgThis + ' !important\n' +
                '}\n' +
                '\n' +
                '/*左侧菜单子菜单背景 leftMenuChildBg */\n' +
                '.layuimini-menu-left .layui-nav-itemed > .layui-nav-child{\n' +
                '    background-color: ' + bgcolorData.leftMenuChildBg + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*左侧菜单字体颜色 leftMenuColor */\n' +
                '.layuimini-menu-left .layui-nav .layui-nav-item a, .layuimini-menu-left-zoom.layui-nav .layui-nav-item a {\n' +
                '    color:  ' + bgcolorData.leftMenuColor + ' !important;\n' +
                '}\n' +
                '\n' +
                '/*左侧菜单选中字体颜色 leftMenuColorThis */\n' +
                '.layuimini-menu-left .layui-nav .layui-nav-item a:hover, .layuimini-menu-left .layui-nav .layui-this a, .layuimini-menu-left-zoom.layui-nav .layui-nav-item a:hover, .layuimini-menu-left-zoom.layui-nav .layui-this a {\n' +
                '    color:' + bgcolorData.leftMenuColorThis + ' !important;\n' +
                '}\n' +
                '\n' +
                '/**tab选项卡样式 */\n' +
                (function() {
                    var isDark = localStorage.getItem('layuiminiElemStyleName') === 'dark';
                    var accentColor = bgcolorData.tabActiveColor || '#1e9fff';
                    var headerBg = bgcolorData.tabHeaderBg || bgcolorData.leftMenuChildBg || '#efefef';
                    var tabCss = '';

                    if (isDark) {
                        tabCss += '.layuimini-tab .layui-tabs-header { background-color: rgba(255,255,255,0.03) !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header li { color: rgba(255,255,255,0.55) !important; background: rgba(255,255,255,0.06) !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header li span { color: rgba(255,255,255,0.55) !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header .layui-this { background: ' + accentColor + ' !important; color: #fff !important; transition: none !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header .layui-this span { color: #fff !important; }\n';
                        tabCss += '.layuimini-tab .layui-tab-control > li { color: rgba(255,255,255,0.4) !important; background: transparent !important; }\n';
                    } else if (parseInt(bgcolorId) >= 2) {
                        tabCss += '.layuimini-tab .layui-tabs-header { background-color: transparent !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header li { color: #888 !important; background: rgba(0,0,0,0.04) !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header li span { color: #888 !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header .layui-this { background: ' + accentColor + ' !important; color: #fff !important; transition: none !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header .layui-this span { color: #fff !important; }\n';
                        tabCss += '.layuimini-tab .layui-tab-control > li { color: #999 !important; background: transparent !important; }\n';
                        tabCss += '.layuimini-tab .layui-tab-control > li:hover { color: ' + accentColor + ' !important; }\n';
                    } else {
                        tabCss += '.layuimini-tab .layui-tabs-header { background-color: transparent !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header li { color: #888 !important; background: rgba(0,0,0,0.04) !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header li span { color: #888 !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header .layui-this { background: ' + accentColor + ' !important; color: #fff !important; transition: none !important; }\n';
                        tabCss += '.layuimini-tab .layui-tabs-header .layui-this span { color: #fff !important; }\n';
                        tabCss += '.layuimini-tab .layui-tab-control > li { color: #999 !important; background: transparent !important; }\n';
                        tabCss += '.layuimini-tab .layui-tab-control > li:hover { color: ' + accentColor + ' !important; }\n';
                    }
                    return tabCss;
                })();
            $('#layuimini-bg-color').html(styleHtml);
        },
        configElemStyle() {
            var listElemStyle = [
                {
                    title: '标准',
                    className: 'normal'
                },
                {
                    title: '原型',
                    className: 'demo',
                    defaultColorConfig: '12'
                },
                {
                    title: '科幻',
                    className: 'sicfi'
                },
                {
                    title: 'GTK',
                    className: 'gtk'
                },
                {
                    title: '像素',
                    className: 'nes',
                    defaultColorConfig: '12'
                },
                {
                    title: 'WIN7',
                    className: 'win7',
                    defaultColorConfig: '12'
                },
                {
                    title: '拟物',
                    className: 'neomorphic',

                },
                {
                    title: '暗黑',
                    className: 'dark',
                    defaultColorConfig: '1'

                },
            ]
            return listElemStyle;
        },
        buildBodyElemStyle(className) {
            let listElemStyle = miniTheme.configElemStyle()
            let htmlEle = $('html')
            $.each(listElemStyle, function (index, item) {
                let classNameReal = item.className;
                if (htmlEle.hasClass(classNameReal)) {
                    htmlEle.removeClass(classNameReal);
                }
            })
            htmlEle.addClass(className)
        },
        buildElemStyleHtml(options) {
            var elemStyleName = localStorage.getItem('layuiminiElemStyleName');
            if (!elemStyleName) elemStyleName = options.elemStyleDefault;
            var listElemStyle = miniTheme.configElemStyle()
            var html = '';
            $.each(listElemStyle, function (key, val) {

                if (typeof val.defaultColorConfig == 'undefined') {
                    val.defaultColorConfig = '0'
                }

                if (val.className === elemStyleName) {
                    html += '<li class="layui-this style-item" data-select-style="' + val.className + '" data-default-color-config="' + val.defaultColorConfig + '">\n';
                } else {
                    html += '<li id="' + val.className + '" class="style-item"  data-select-style="' + val.className + '" data-default-color-config="' + val.defaultColorConfig + '">\n';
                }
                html +=
                    val.title +

                    '</li>';
            });
            return html;
        },
        /**
         * 构建主题选择html
         * @param options
         * @returns {string}
         */
        buildBgColorHtml: function (options) {
            options.bgColorDefault = options.bgColorDefault || 0;
            var bgcolorId = parseInt(localStorage.getItem('layuiminiBgColorId'));
            if (isNaN(bgcolorId)) bgcolorId = options.bgColorDefault;
            var bgColorConfig = miniTheme.config();
            var html = '';
            $.each(bgColorConfig, function (key, val) {
                if (key === bgcolorId) {
                    html += '<li class="layui-this" data-select-bgcolor="' + key + '">\n';
                } else {
                    html += '<li  data-select-bgcolor="' + key + '">\n';
                }
                html += '<a href="javascript:;" data-skin="skin-blue" style="" class="clearfix full-opacity-hover">\n' +
                    '<div><span style="display:block; width: 20%; float: left; height: 12px; background: ' + val.headerLogoBg + ';"></span><span style="display:block; width: 80%; float: left; height: 12px; background: ' + val.headerRightBg + ';"></span></div>\n' +
                    '<div><span style="display:block; width: 20%; float: left; height: 40px; background: ' + val.leftMenuBg + ';"></span><span style="display:block; width: 80%; float: left; height: 40px; background: #ffffff;"></span></div>\n' +
                    '</a>\n' +
                    '</li>';
            });
            return html;
        },

        /**
         * 监听
         * @param options
         */
        listen: function (options) {
            $('body').on('click', '[data-bgcolor]', function () {
                var loading = layer.load(0, {shade: false, time: 2 * 1000});
                var clientHeight = (document.documentElement.clientHeight) - 60;
                var bgColorHtml = miniTheme.buildBgColorHtml(options);
                var html = '<div class="layuimini-color">\n' +
                    '<div class="color-title">\n' +
                    '<span>配色方案</span>\n' +
                    '</div>\n' +
                    '<div class="color-content">\n' +
                    '<ul>\n' + bgColorHtml + '</ul>\n' +
                    '</div>\n' +
                    '<div class="more-menu-list">\n' +
                    '<a class="more-menu-item" href="https://gitee.com/wolf18/easyAdmin8" target="_blank"><i class="layui-icon layui-icon-tabs" style="font-size: 16px;"></i> 开源地址</a>\n' +
                    '</div>' +
                    '</div>';
                layer.open({
                    type: 1,
                    title: false,
                    closeBtn: 0,
                    shade: 0.2,
                    anim: 2,
                    shadeClose: true,
                    id: 'layuiminiBgColor',
                    area: ['340px', clientHeight + 'px'],
                    offset: 'rb',
                    content: html,
                    success: function (index, layero) {
                    },
                    end: function () {
                        $('.layuimini-select-bgcolor').removeClass('layui-this');
                    }
                });
                layer.close(loading);
            });

            $('body').on('click', '[data-select-bgcolor]', function () {
                var bgcolorId = $(this).attr('data-select-bgcolor');
                $('.layuimini-color .color-content ul .layui-this').attr('class', '');
                $(this).attr('class', 'layui-this');
                localStorage.setItem('layuiminiBgColorId', bgcolorId);
                miniTheme.render({
                    bgColorDefault: bgcolorId,
                    listen: false,
                });
                miniTheme.changeThemeMainColor()
            });
            $('body').on('click', '[data-select-style]', function () {
                var elemStyleName = $(this).attr('data-select-style');

                $(this).attr('class', 'layui-this').siblings().removeClass('layui-this');

                var defaultColorConfig = $(this).attr('data-default-color-config');

                if (defaultColorConfig && defaultColorConfig.length > 0) {
                    localStorage.setItem('layuiminiBgColorId', defaultColorConfig);

                }

                localStorage.setItem('layuiminiElemStyleName', elemStyleName);
                miniTheme.render({
                    listen: false,
                });
            });
        }
    };

    return miniTheme;
})
;