define(["jquery", "easy-admin"], function ($, ea) {

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.schedule/index',
        manage_url: 'system.schedule/manage',
        status_url: 'system.schedule/status',
        start_url: 'system.schedule/start',
        stop_url: 'system.schedule/stop',
        log_url: 'system.schedule/log',
        clear_log_url: 'system.schedule/clearLog',
        download_log_url: 'system.schedule/downloadLog',
    };

    return {

        index: function () {
            ea.table.render({
                init: init,
                toolbar: ['refresh'],
                page: false,
                limit: 1000,
                defaultToolbar: ['filter', 'print'],
                cols: [[
                    {field: 'id', width: 80, title: '序号', align: 'center', search: false},
                    {field: 'name', minWidth: 180, title: '脚本文件', align: 'left', search: false},
                    {field: 'path', minWidth: 260, title: '完整路径', align: 'left', search: false},
                    {field: 'size', width: 120, title: '文件大小', search: false},
                    {field: 'mtime', width: 180, title: '最后修改时间', search: false},
                    {
                        width: 220,
                        title: '操作',
                        templet: ea.table.tool,
                        operat: [
                            [{
                                text: '管理',
                                url: init.manage_url,
                                method: 'open',
                                field: 'name',
                                extra: 'name',
                                auth: 'manage',
                                class: 'layui-btn layui-btn-normal layui-btn-xs',
                                icon: 'fa fa-cogs',
                                extend: 'data-width="60%" data-height="80%"'
                            }]
                        ]
                    }
                ]]
            });

            ea.listen();
        },

        manage: function () {
            var file = $('#scheduleFile').text();
            var $output = $('#scheduleOutput');
            var $log = $('#scheduleLog');
            var $logMeta = $('#scheduleLogMeta');
            var $lines = $('#logLines');
            var autoTimer = null;

            function setOutput(text, color) {
                $output.css('color', color || '#d4d4d4').text(text || '');
            }

            function setLog(text, color) {
                $log.css('color', color || '#c7d0d9').text(text || '');
                // 滚动到底部
                $log.scrollTop($log[0].scrollHeight);
            }

            function loading(action) {
                setOutput('正在执行 ' + action + ' ...', '#ffd166');
            }

            function exec(url, action) {
                loading(action);
                ea.request.post({
                    url: ea.url(url),
                    data: {file: file},
                    loading: false
                }, function (res) {
                    var text = (res.data && res.data.output) ? res.data.output : (res.msg || '');
                    setOutput(text, '#9ece6a');
                }, function (err) {
                    setOutput((err && err.msg) ? err.msg : '执行失败', '#f7768e');
                }, function (ex) {
                    setOutput('请求异常: ' + (ex && ex.message ? ex.message : ''), '#f7768e');
                });
            }

            function loadLog(silent) {
                if (!silent) setLog('正在加载日志...', '#ffd166');
                ea.request.get({
                    url: ea.url(init.log_url),
                    data: {file: file, lines: $lines.val()},
                    loading: false
                }, function (res) {
                    var d = res.data || {};
                    setLog(d.output || '(日志为空)', '#c7d0d9');
                    $logMeta.text('日志路径：' + (d.path || '-')
                        + ' | 大小：' + (d.size || '-')
                        + ' | 更新时间：' + (d.mtime || '-')
                        + ' | 显示：尾部 ' + (d.lines || '-') + ' 行');
                }, function (err) {
                    setLog((err && err.msg) ? err.msg : '加载失败', '#f7768e');
                }, function (ex) {
                    setLog('请求异常: ' + (ex && ex.message ? ex.message : ''), '#f7768e');
                });
            }

            function clearLog() {
                ea.request.post({
                    url: ea.url(init.clear_log_url),
                    data: {file: file},
                    loading: false
                }, function () {
                    setLog('(日志已清空)', '#9ece6a');
                    $logMeta.text('日志路径：- | 大小：0 B | 更新时间：' + new Date().toLocaleString());
                });
            }

            function stopAutoRefresh() {
                if (autoTimer) {
                    clearInterval(autoTimer);
                    autoTimer = null;
                }
                $('#btnAutoRefresh').attr('data-on', '0')
                    .removeClass('layui-btn-danger').addClass('layui-btn-primary')
                    .html('<i class="fa fa-play-circle-o"></i> 自动刷新');
            }

            function startAutoRefresh() {
                stopAutoRefresh();
                autoTimer = setInterval(function () {
                    loadLog(true);
                }, 3000);
                $('#btnAutoRefresh').attr('data-on', '1')
                    .removeClass('layui-btn-primary').addClass('layui-btn-danger')
                    .html('<i class="fa fa-pause-circle-o"></i> 停止刷新');
            }

            $('#btnStatus').on('click', function () {
                exec(init.status_url, 'status');
            });

            $('#btnStart').on('click', function () {
                ea.msg.confirm('确认启动该定时任务？', function () {
                    exec(init.start_url, 'start');
                    setTimeout(function () {
                        loadLog(true);
                    }, 1500);
                });
            });

            $('#btnStop').on('click', function () {
                ea.msg.confirm('确认停止该定时任务？', function () {
                    stopAutoRefresh();
                    exec(init.stop_url, 'stop');
                    setTimeout(function () {
                        loadLog(true);
                    }, 800);
                });
            });

            $('#btnLog').on('click', function () {
                loadLog(false);
            });

            $('#btnAutoRefresh').on('click', function () {
                if ($(this).attr('data-on') === '1') {
                    stopAutoRefresh();
                } else {
                    startAutoRefresh();
                }
            });

            $('#btnClearLog').on('click', function () {
                ea.msg.confirm('确认清空该任务的日志文件？', function () {
                    clearLog();
                });
            });

            $('#btnDownloadLog').on('click', function () {
                window.open(ea.url(init.download_log_url) + '?file=' + encodeURIComponent(file));
            });

            $lines.on('change', function () {
                loadLog(false);
            });

            // 关闭页面时清理定时器
            $(window).on('beforeunload', function () {
                stopAutoRefresh();
            });

            // 默认加载状态与日志
            exec(init.status_url, 'status');
            loadLog(false);

            ea.listen();
        }
    };
});
