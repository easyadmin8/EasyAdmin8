define(["jquery", "easy-admin"], function ($, ea) {

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.admin/index',
        add_url: 'system.admin/add',
        edit_url: 'system.admin/edit',
        delete_url: 'system.admin/delete',
        modify_url: 'system.admin/modify',
        export_url: 'system.admin/export',
        recycle_url: 'system.admin/recycle',
        password_url: 'system.admin/password',
    };

    return {

        index: function () {

            let _table = ea.table.render({
                init: init,
                cols: [[
                    {type: "checkbox"},
                    {field: 'id', width: 80, title: 'ID', searchOp: '='},
                    {field: 'sort', width: 80, title: '排序', edit: 'text'},
                    {field: 'username', minWidth: 80, title: '登录账户'},
                    {field: 'head_img', minWidth: 80, title: '头像', search: false, templet: ea.table.image},
                    {field: 'phone', minWidth: 80, title: '手机'},
                    {field: 'login_num', minWidth: 80, title: '登录次数'},
                    {
                        field: 'role', minWidth: 80, title: '角色权限', align: 'left', search: 'none', templet: function (d) {
                            let auth_ids = d.auth_ids || []
                            let html = ``
                            $.each(auth_ids, (idx, item) =>
                                html += `<span class="layui-badge">${auth_list[item] || '-'}</span> `
                            )
                            return html
                        }
                    },
                    {field: 'remark', minWidth: 80, title: '备注信息'},
                    {field: 'status', title: '状态', width: 85, search: 'select', selectList: {0: '禁用', 1: '启用'}, templet: ea.table.switch},
                    {field: 'create_time', minWidth: 80, title: '创建时间', search: 'range'},
                    {
                        width: 250,
                        title: '操作',
                        templet: ea.table.tool,
                        operat: [
                            'edit',
                            [{
                                text: '设置密码',
                                url: init.password_url,
                                method: 'open',
                                auth: 'password',
                                class: 'layui-btn layui-btn-normal layui-btn-xs',
                            }],
                            'delete'
                        ]
                    }
                ]],
            });

            $('body').on('click', '[data-table-reset]', function () {
                $('.layui-menu li').removeClass('layui-menu-item-checked').animate(
                    {}, 0, () => $('.layui-menu li:eq(0)').addClass('layui-menu-item-checked')
                )
            })
            layui.util.on({
                authSearch: function (e) {
                    let auth_id = $(this).data('auth_id')
                    $('.layui-menu li').removeClass('layui-menu-item-checked').animate(
                        {}, 0, () => $(this).parents('li').addClass('layui-menu-item-checked')
                    )
                    let _where = auth_id ? {
                        filter: JSON.stringify({auth_ids: auth_id}),
                        op: JSON.stringify({auth_ids: 'find_in_set'})
                    } : {}
                    _table.reload({where: _where})
                },
            })

            ea.listen();
        },
        add: function () {
            ea.listen();
        },
        edit: function () {
            ea.listen();
        },
        recycle: function () {
            init.index_url = init.recycle_url;
            ea.table.render({
                init: init,
                toolbar: ['refresh',
                    [{
                        class: 'layui-btn layui-btn-sm',
                        method: 'get',
                        field: 'id',
                        icon: 'fa fa-refresh',
                        text: '全部恢复',
                        title: '确定恢复？',
                        auth: 'recycle',
                        url: init.recycle_url + '?type=restore',
                        checkbox: true
                    }, {
                        class: 'layui-btn layui-btn-danger layui-btn-sm',
                        method: 'get',
                        field: 'id',
                        icon: 'fa fa-delete',
                        text: '彻底删除',
                        title: '确定彻底删除？',
                        auth: 'recycle',
                        url: init.recycle_url + '?type=delete',
                        checkbox: true
                    }], 'export',
                ],
                cols: [[
                    {type: "checkbox"},
                    {field: 'sort', width: 80, title: '排序', edit: 'text'},
                    {field: 'username', minWidth: 80, title: '登录账户'},
                    {field: 'head_img', minWidth: 80, title: '头像', search: false, templet: ea.table.image},
                    {field: 'phone', minWidth: 80, title: '手机'},
                    {field: 'login_num', minWidth: 80, title: '登录次数'},
                    {field: 'remark', minWidth: 80, title: '备注信息'},
                    {field: 'create_time', minWidth: 80, title: '创建时间', search: 'range'},
                    {
                        width: 250,
                        title: '操作',
                        templet: ea.table.tool,
                        operat: [
                            [{
                                title: '确认恢复？',
                                text: '恢复数据',
                                filed: 'id',
                                url: init.recycle_url + '?type=restore',
                                method: 'get',
                                auth: 'recycle',
                                class: 'layui-btn layui-btn-xs layui-btn-success',
                            }, {
                                title: '想好了吗？',
                                text: '彻底删除',
                                filed: 'id',
                                method: 'get',
                                url: init.recycle_url + '?type=delete',
                                auth: 'recycle',
                                class: 'layui-btn layui-btn-xs layui-btn-normal layui-bg-red',
                            }]]
                    }
                ]],
            });
            ea.listen();
        },
        password: function () {
            ea.listen();
        }
    };
});