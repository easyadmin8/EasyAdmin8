define(["jquery", "easy-admin"], function ($, ea) {


    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.log/index',
        export_url: 'system.log/export',
        deleteMonthLog_url: 'system.log/deleteMonthLog',
    };

    return {
        index: function () {
            var util = layui.util;
            ea.table.render({
                init: init,
                lineStyle: 'height: auto;word-break: break-all;',
                toolbar: ['refresh', 'export',
                    [{
                        text: '框架日志',
                        url: 'system.log/record',
                        method: 'open',
                        auth: 'record',
                        class: 'layui-btn layui-btn-sm',
                        icon: 'fa fa-book',
                        extend: 'data-width="95%" data-height="95%"'
                    }, {
                        text: '删除部分日志',
                        url: 'system.log/deleteMonthLog',
                        method: 'open',
                        auth: 'deleteMonthLog',
                        class: 'layui-btn layui-btn-sm layui-btn-danger',
                        icon: 'fa fa-remove',
                        extend: 'data-width="35%" data-height="42%"'
                    },]
                ],
                cols: [[
                    {field: 'id', width: 80, title: 'ID', search: false},
                    {field: 'month', width: 80, title: '日志月份', hide: true, search: 'time', timeType: 'month', searchValue: util.toDateString(new Date(), 'yyyy-MM')},
                    {
                        field: 'admin.username', width: 100, title: '后台用户', search: false, templet: function (res) {
                            let admin = res.admin
                            return admin ? admin.username : '-'
                        }
                    },
                    {field: 'method', width: 100, title: '请求方法'},
                    {field: 'title', minWidth: 180, title: '请求标题'},
                    {field: 'ip', width: 150, title: 'IP地址'},
                    {field: 'url', minWidth: 150, title: '路由地址', align: "left"},
                    {
                        field: 'content', minWidth: 200, title: '请求数据', align: "left", templet: function (res) {
                            let html = '<div class="layui-colla-item">' +
                                '<div class="layui-colla-title">点击预览</div>' +
                                '<div class="layui-colla-content">' + prettyFormat(JSON.stringify(res.content)) + '</div>' +
                                '</div>'
                            return '<div class="layui-collapse" lay-accordion>' + html + '</div>'
                        }
                    },
                    {
                        field: 'response', minWidth: 200, title: '回调数据', align: "left", templet: function (res) {
                            let html = '<div class="layui-colla-item">' +
                                '<div class="layui-colla-title">点击预览</div>' +
                                '<div class="layui-colla-content">' + prettyFormat(JSON.stringify(res.response)) + '</div>' +
                                '</div>'
                            return '<div class="layui-collapse" lay-accordion>' + html + '</div>'
                        }
                    },
                    {field: 'create_time', minWidth: 100, title: '创建时间', search: 'range'},
                ]],
                done: function () {
                    layui.element.render('collapse')
                }
            });
            ea.listen();
        },
        deleteMonthLog: function () {
            layui.form.on('submit(submit)', function (data) {
                let field = data.field
                let options = {
                    url: ea.url(init.deleteMonthLog_url),
                    data: field,
                }
                ea.msg.confirm('确认执行该操作？重要数据请先做好相关备份！', function () {
                    ea.request.post(options, function (rs) {
                        let msg = rs.msg || '未知~'
                        layer.msg(msg.replace(/\n/g, '<br>'), {shade: 0.3, shadeClose: true, time: 2000})
                    })
                })
            })
        }
    };
});
