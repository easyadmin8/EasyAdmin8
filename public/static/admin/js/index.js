define(["jquery", "easy-admin", "echarts", "echarts-theme", "miniAdmin", "miniTheme", "miniTab", "miniTongji", "swiper"], function ($, ea, echarts, undefined, miniAdmin, miniTheme, miniTab, miniTongji) {

    return {
        index: function () {
            var options = {
                iniUrl: ea.url('ajax/initAdmin'),    // 初始化接口
                clearUrl: ea.url("ajax/clearCache"), // 缓存清理接口
                urlHashLocation: true,      // 是否打开hash定位
                bgColorDefault: false,      // 主题默认配置
                multiModule: true,          // 是否开启多模块
                menuChildOpen: false,       // 是否默认展开菜单
                loadingTime: 0,             // 初始化加载时间
                pageAnim: true,             // iframe窗口动画
                maxTabNum: 20,              // 最大的tab打开数量
            };
            miniAdmin.render(options);
            miniTongji.render({specific: false});
            $('.login-out').on("click", function () {
                ea.request.get({
                    url: 'login/out',
                    prefix: true,
                }, function (res) {
                    ea.msg.success(res.msg, function () {
                        window.location = ea.url('login/index');
                    })
                });
            });
        },
        welcome: function () {
            miniTab.listen();

            new Swiper('.mySwiper', {
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
            })

            /**
             * 查看公告信息
             **/
            $('body').on('click', '.layuimini-notice', function () {
                var title = $(this).children('.layuimini-notice-title').text(),
                    noticeTime = $(this).children('.layuimini-notice-extra').text(),
                    content = $(this).children('.layuimini-notice-content').html();
                var html = '<div style="padding:15px 20px; text-align:justify; line-height: 22px;border-bottom:1px solid #e2e2e2;background-color: #2f4056;color: #ffffff">\n' +
                    '<div style="text-align: center;margin-bottom: 20px;font-weight: bold;border-bottom:1px solid #718fb5;padding-bottom: 5px"><h4 class="text-danger">' + title + '</h4></div>\n' +
                    '<div style="font-size: 12px">' + content + '</div>\n' +
                    '</div>\n';
                layer.open({
                    type: 1,
                    title: '系统公告' + '<span style="float: right;right: 1px;font-size: 12px;color: #b1b3b9;margin-top: 1px">' + noticeTime + '</span>',
                    area: '300px;',
                    shade: 0.8,
                    id: 'layuimini-notice',
                    btn: ['查看', '取消'],
                    btnAlign: 'c',
                    moveType: 1,
                    content: html,
                    success: function (layero) {
                        var btn = layero.find('.layui-layer-btn');
                        btn.find('.layui-layer-btn0').attr({
                            href: 'https://gitee.com/zhongshaofa/layuimini',
                            target: '_blank'
                        });
                    }
                });
            });

            /**
             * 报表功能
             */
            $(function () {
                $('#layui-version').text('v' + layui.v);
                let echartsRecordsEl = document.getElementById('echarts-records');
                if (echartsRecordsEl) {
                    let echartsRecords = echarts.init(echartsRecordsEl, 'walden');

                    let optionRecords = {
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        legend: {},
                        xAxis: [
                            {
                                type: 'category',
                                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value'
                            }
                        ],
                        series: [
                            {
                                name: 'Direct',
                                type: 'bar',
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [320, 332, 301, 334, 390, 330, 320]
                            },
                            {
                                name: 'Email',
                                type: 'bar',
                                stack: 'Ad',
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [120, 132, 101, 134, 90, 230, 210]
                            },
                            {
                                name: 'Union Ads',
                                type: 'bar',
                                stack: 'Ad',
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [220, 182, 191, 234, 290, 330, 310]
                            },
                            {
                                name: 'Video Ads',
                                type: 'bar',
                                stack: 'Ad',
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [150, 232, 201, 154, 190, 330, 410]
                            },
                            {
                                name: 'Search Engine',
                                type: 'bar',
                                data: [862, 1018, 964, 1026, 1679, 1600, 1570],
                                emphasis: {
                                    focus: 'series'
                                },
                                markLine: {
                                    lineStyle: {
                                        type: 'dashed'
                                    },
                                    data: [[{ type: 'min' }, { type: 'max' }]]
                                }
                            },
                            {
                                name: 'Baidu',
                                type: 'bar',
                                barWidth: 5,
                                stack: 'Search Engine',
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [620, 732, 701, 734, 1090, 1130, 1120]
                            },
                            {
                                name: 'Google',
                                type: 'bar',
                                stack: 'Search Engine',
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [120, 132, 101, 134, 290, 230, 220]
                            },
                            {
                                name: 'Bing',
                                type: 'bar',
                                stack: 'Search Engine',
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [60, 72, 71, 74, 190, 130, 110]
                            },
                            {
                                name: 'Others',
                                type: 'bar',
                                stack: 'Search Engine',
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [62, 82, 91, 84, 109, 110, 120]
                            }
                        ]
                    };
                    setTimeout(function () {
                        echartsRecords.setOption(optionRecords);
                        window.addEventListener("resize", function () {
                            echartsRecords.resize();
                        });
                    }, 100)
                }
            })

            let util = layui.util;
            util.on({
                'layui-tips': function () {
                    layer.tips('需要最新版本的，去 LayUI 官网下载替换本地文件即可', this, {
                        tips: [1, 'var(--ea8-theme-main-color)'],
                        time: 2000,
                    });
                },
                openClawBtn: function () {
                    let width = window.innerWidth
                    let _width = '80%'
                    if (width <= 768) {
                        _width = '95%'
                    }
                    layer.open({
                        type: 2,
                        title: '',
                        area: [_width, '95%'],
                        content: 'https://get.gdo.net.cn/',
                        scrollbar: false,
                        shadeClose: true,
                    })
                },
                showComposerInfo: function () {
                    // <div style="padding: 25px;">12313</div>
                    let html = ``
                    ea.request.get({
                        url: ea.url('ajax/composerInfo'),
                    }, function (success) {
                        let data = success.data
                        data.forEach(function (item) {
                            html += `${item.name}  ${item.version}\r\n`
                        })
                        html = `<pre class="layui-code code-demo">${html}</pre>`
                        layer.open({
                            type: 1,
                            title: 'composer 信息',
                            area: ea.checkMobile() ? ['95%', '90%'] : ['50%', '90%'],
                            shade: 0.8,
                            shadeClose: true,
                            scrollbar: false,
                            content: html,
                            success: function () {
                                layui.code({elem: '.code-demo', theme: 'dark', lang: 'php'});
                            }
                        })
                    }, function (error) {
                        console.error(error)
                        return false;
                    })

                }
            })
        },
        editAdmin: function () {
            let form = layui.form
            form.on('radio(loginType-filter)', function (data) {
                let elem = data.elem
                let value = elem.value
                if (value === '2') {
                    let width = screen.width < 768 ? '85%' : '60%'
                    ea.open('绑定谷歌验证码', ea.url('index/set2fa'), width, '75%')
                }
            });
            ea.listen();
        },
        editPassword: function () {
            ea.listen();
        },
        set2fa: function () {
            ea.listen();
        },
    };
});
