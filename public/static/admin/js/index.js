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

            // 代码块高亮 & 页签
            layui.use(['tabs', 'code'], function () {
                layui.code({elem: '.code-install'});
            });

            // 顶部日期
            (function () {
                var el = document.getElementById('w-today');
                if (!el) return;
                var d = new Date();
                var week = ['日', '一', '二', '三', '四', '五', '六'];
                el.textContent = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 星期' + week[d.getDay()];
            })();

            // 向 AI 同事求助提示词浮动层：点击标题栏收起/展开
            (function () {
                var $tip = $('#wAiTip');
                if (!$tip.length) return;
                var $head = $('#wAiTipToggle');

                function toggle() {
                    var collapsed = $tip.toggleClass('is-collapsed').hasClass('is-collapsed');
                    $head.attr('aria-expanded', collapsed ? 'false' : 'true');
                    $head.find('.w-ai-tip-action i').attr('class', collapsed ? 'fa fa-plus' : 'fa fa-minus');
                }

                $head.on('click', toggle).on('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle();
                    }
                });
            })();

            /**
             * 查看公告信息
             **/
            $('body').on('click', '.layuimini-notice', function () {
                var title = $(this).children('.layuimini-notice-title').text(),
                    noticeTime = $(this).children('.layuimini-notice-extra').text(),
                    content = $(this).children('.layuimini-notice-content').html();
                var html = '<div style="padding:15px 20px; text-align:justify; line-height: 22px;border-bottom:1px solid #e2eefb;background-color: #f8fcff;color: #31414a">\n' +
                    '<div style="text-align: center;margin-bottom: 20px;font-weight: bold;border-bottom:1px solid #cfe4fb;padding-bottom: 5px"><h4 class="text-danger">' + title + '</h4></div>\n' +
                    '<div style="font-size: 12px">' + content + '</div>\n' +
                    '</div>\n';
                layer.open({
                    type: 1,
                    title: '系统公告' + '<span style="float: right;right: 1px;font-size: 12px;color: #7b8b95;margin-top: 1px">' + noticeTime + '</span>',
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
                if (!echartsRecordsEl) return;

                let echartsRecords = echarts.init(echartsRecordsEl);

                const week = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                const axisLabel = {color: '#8a9994', fontSize: 12};
                const gradient = (rgb, alphaTop) => new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {offset: 0, color: 'rgba(' + rgb + ',' + alphaTop + ')'},
                    {offset: 1, color: 'rgba(' + rgb + ',0)'}
                ]);

                let optionRecords = {
                    color: ['#1e9fff', '#17d641'],
                    animationDuration: 1200,
                    animationEasing: 'linear',
                    animationDurationUpdate: 700,
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'rgba(47, 54, 60, .92)',
                        borderWidth: 0,
                        padding: [10, 14],
                        textStyle: {color: '#fff', fontSize: 12},
                        axisPointer: {type: 'line', lineStyle: {color: 'rgba(120, 160, 150, .45)', type: 'dashed'}}
                    },
                    legend: {
                        top: 0,
                        right: 0,
                        icon: 'circle',
                        itemWidth: 8,
                        itemHeight: 8,
                        itemGap: 18,
                        textStyle: {color: '#8a9994', fontSize: 12}
                    },
                    grid: {left: 6, right: 12, top: 44, bottom: 0, containLabel: true},
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: week,
                        axisLine: {lineStyle: {color: 'rgba(140, 150, 146, .25)'}},
                        axisTick: {show: false},
                        axisLabel: axisLabel
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: axisLabel,
                        splitLine: {lineStyle: {type: 'dashed', color: 'rgba(140, 150, 146, .16)'}}
                    },
                    series: [
                        {
                            name: '访问量',
                            type: 'line',
                            smooth: true,
                            showSymbol: false,
                            symbol: 'circle',
                            symbolSize: 7,
                            animationDelay: 0,
                            lineStyle: {width: 3},
                            itemStyle: {borderWidth: 2, borderColor: '#ffffff'},
                            areaStyle: {color: gradient('30, 159, 255', 0.30)},
                            data: [1280, 1362, 1290, 1434, 1690, 1730, 1685]
                        },
                        {
                            name: '访客数',
                            type: 'line',
                            smooth: true,
                            showSymbol: false,
                            symbol: 'circle',
                            symbolSize: 7,
                            animationDelay: 100,
                            lineStyle: {width: 3},
                            itemStyle: {borderWidth: 2, borderColor: '#ffffff'},
                            areaStyle: {color: gradient('124, 196, 255', 0.26)},
                            data: [820, 932, 901, 934, 1090, 1130, 1080]
                        }
                    ]
                };

                setTimeout(function () {
                    echartsRecords.setOption(optionRecords);
                    requestAnimationFrame(function () {
                        echartsRecordsEl.classList.add('is-ready');
                    });

                    // 记录初始尺寸，忽略 observe 触发的首次（尺寸未变化）回调，
                    // 避免 resize 打断折线首帧的绘制动画
                    let lastW = echartsRecordsEl.clientWidth;
                    let lastH = echartsRecordsEl.clientHeight;
                    let animating = true;
                    let pendingResize = false;

                    const doResize = function () {
                        if (animating) {
                            pendingResize = true;
                            return;
                        }
                        echartsRecords.resize();
                    };

                    setTimeout(function () {
                        animating = false;
                        if (pendingResize) {
                            pendingResize = false;
                            echartsRecords.resize();
                        }
                    }, 100);

                    window.addEventListener("resize", doResize);
                    // 页签切换导致 iframe 宽度变化时自动重算尺寸
                    if (window.ResizeObserver) {
                        new ResizeObserver(function () {
                            let w = echartsRecordsEl.clientWidth;
                            let h = echartsRecordsEl.clientHeight;
                            if (w === lastW && h === lastH) return;
                            lastW = w;
                            lastH = h;
                            doResize();
                        }).observe(echartsRecordsEl);
                    }
                }, 70);
            });

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
            ea.listen(null, function (res) {
                ea.msg.success(res.msg || '保存成功', function () {
                    // 同步更新父页面右上角头像，无需刷新整个后台
                    let avatar = (res.data && res.data.avatar) || $("input[name='avatar']").val();
                    if (!avatar || window.parent === window) return;
                    let $parent = window.parent.jQuery || window.parent.$ || (window.parent.layui && window.parent.layui.$);
                    if ($parent) {
                        $parent('.layuimini-setting .layui-nav-img').attr('src', avatar);
                    }
                });
                return false;
            });
        },
        editPassword: function () {
            ea.listen();
        },
        set2fa: function () {
            ea.listen();
        },
    };
});
