define(["jquery", "easy-admin", "treetable", "iconPickerFa", "autocomplete"], function ($, ea) {

    var table = layui.table,
        treetable = layui.treetable,
        iconPickerFa = layui.iconPickerFa,
        autocomplete = layui.autocomplete;

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.menu/index',
        add_url: 'system.menu/add',
        delete_url: 'system.menu/delete',
        edit_url: 'system.menu/edit',
        modify_url: 'system.menu/modify',
    };

    return {
        index: function () {

            var renderTable = function () {
                layer.load(2);
                treetable.render({
                    where: {limit: 9999},
                    treeColIndex: 1,
                    treeSpid: 0,
                    homdPid: 99999999,
                    treeIdName: 'id',
                    treePidName: 'pid',
                    url: ea.url(init.index_url),
                    elem: init.table_elem,
                    id: init.table_render_id,
                    toolbar: '#toolbar',
                    page: false,
                    skin: 'line',

                    // @todo 不直接使用ea.table.render(); 进行表格初始化, 需要使用 ea.table.formatCols(); 方法格式化`cols`列数据
                    cols: ea.table.formatCols([[
                        {type: 'checkbox'},
                        {field: 'title', width: 250, title: '菜单名称', align: 'left'},
                        {field: 'icon', width: 80, title: '图标', templet: ea.table.icon},
                        {field: 'href', minWidth: 120, title: '菜单链接'},
                        {
                            field: 'is_home',
                            width: 80,
                            title: '类型',
                            templet: function (d) {
                                if (d.pid === 99999999) {
                                    return '<span class="layui-badge layui-bg-blue">首页</span>';
                                }
                                if (d.pid === 0) {
                                    return '<span class="layui-badge layui-bg-gray">模块</span>';
                                } else {
                                    return '<span class="layui-badge-rim">菜单</span>';
                                }
                            }
                        },
                        {field: 'status', title: '状态', width: 85, templet: ea.table.switch},
                        {field: 'sort', width: 80, title: '排序', edit: 'text'},
                        {
                            width: 230,
                            title: '操作',
                            templet: ea.table.tool,
                            operat: [
                                [{
                                    text: '添加下级',
                                    url: init.add_url,
                                    method: 'open',
                                    auth: 'add',
                                    class: 'layui-btn layui-btn-xs layui-btn-normal',
                                }, {
                                    text: '编辑',
                                    url: init.edit_url,
                                    method: 'open',
                                    auth: 'edit',
                                    class: 'layui-btn layui-btn-xs layui-btn-success',
                                }],
                                'delete'
                            ]
                        }
                    ]], init),
                    done: function () {
                        layer.closeAll('loading');
                    }
                });
            };

            renderTable();

            $('body').on('click', '[data-treetable-refresh]', function () {
                renderTable();
            });

            $('body').on('click', '[data-treetable-delete]', function () {
                var tableId = $(this).attr('data-treetable-delete'),
                    url = $(this).attr('data-url');
                tableId = tableId || init.table_render_id;
                url = url != undefined ? ea.url(url) : window.location.href;
                var checkStatus = table.checkStatus(tableId),
                    data = checkStatus.data;
                if (data.length <= 0) {
                    ea.msg.error('请勾选需要删除的数据');
                    return false;
                }
                var ids = [];
                $.each(data, function (i, v) {
                    ids.push(v.id);
                });
                ea.msg.confirm('确定删除？', function () {
                    ea.request.post({
                        url: url,
                        data: {
                            id: ids
                        },
                    }, function (res) {
                        ea.msg.success(res.msg, function () {
                            renderTable();
                        });
                    });
                });
                return false;
            });

            $('body').on('click', '[data-treetable-arrow]', function () {
                const $icon = $(this).find('i');
                const $textNode = $icon[0].nextSibling;
                if ($icon.hasClass('fa-arrow-up')) {
                    treetable.foldAll(init.table_elem);
                    $icon.removeClass('fa-arrow-up').addClass('fa-arrow-down');
                    $textNode.textContent = ' 一键展开';
                    $(this).attr('data-arrow', 'down');
                } else {
                    treetable.expandAll(init.table_elem);
                    $icon.removeClass('fa-arrow-down').addClass('fa-arrow-up');
                    $textNode.textContent = ' 一键折叠';
                    $(this).attr('data-arrow', 'up');
                }
            })

            ea.table.listenSwitch({filter: 'status', url: init.modify_url});

            ea.table.listenEdit(init, 'currentTable', init.table_render_id, true);

            ea.listen();
        },
        add: function () {
            $(function () {
                iconPickerFa.render({
                    elem: '#icon',
                    url: PATH_CONFIG.iconLess,
                    limit: 12,
                    click: function (data) {
                        $('#icon').val('fa ' + data.icon);
                    },
                    success: function (d) {
                        console.log(d);
                    }
                });
            })
            autocomplete.render({
                elem: $('#href')[0],
                url: ea.url('system.menu/getMenuTips'),
                template_val: '{{d.node}}',
                template_txt: '{{d.node}} <span class=\'layui-badge layui-bg-gray\'>{{d.title}}</span>',
                onselect: function (resp) {
                }
            });

            ea.listen(function (data) {
                return data;
            }, function (res) {
                ea.msg.success(res.msg, function () {
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                    parent.$('[data-treetable-refresh]').trigger("click");
                });
            });
        },
        edit: function () {
            $(function () {
                iconPickerFa.render({
                    elem: '#icon',
                    url: PATH_CONFIG.iconLess,
                    limit: 12,
                    click: function (data) {
                        $('#icon').val('fa ' + data.icon);
                    },
                    success: function (d) {
                        console.log(d);
                    }
                });
            })
            autocomplete.render({
                elem: $('#href')[0],
                url: ea.url('system.menu/getMenuTips'),
                template_val: '{{d.node}}',
                template_txt: '{{d.node}} <span class=\'layui-badge layui-bg-gray\'>{{d.title}}</span>',
                onselect: function (resp) {
                }
            });

            ea.listen(function (data) {
                return data;
            }, function (res) {
                ea.msg.success(res.msg, function () {
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                    parent.$('[data-treetable-refresh]').trigger("click");
                });
            });
        }
    };
});