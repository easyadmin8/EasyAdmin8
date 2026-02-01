define(["jquery", "easy-admin"], function ($, ea) {

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'mall.goods/index',
        add_url: 'mall.goods/add',
        edit_url: 'mall.goods/edit',
        delete_url: 'mall.goods/delete',
        export_url: 'mall.goods/export',
        modify_url: 'mall.goods/modify',
        stock_url: 'mall.goods/stock',
        recycle_url: 'mall.goods/recycle',
    };

    return {

        index: function () {
            ea.table.render({
                init: init,
                toolbar: ['refresh',
                    [{
                        text: '添加',
                        url: init.add_url,
                        method: 'open',
                        auth: 'add',
                        class: 'layui-btn layui-btn-normal layui-btn-sm',
                        icon: 'fa fa-plus ',
                        extend: 'data-width="90%" data-height="95%"',
                    }],
                    'delete', 'export', 'recycle'],
                cols: [[
                    {type: "checkbox"},
                    {field: 'id', width: 80, title: 'ID', searchOp: '='},
                    {field: 'sort', width: 80, title: '排序', edit: 'text'},
                    {field: 'cate_id', width: 100, title: '商品分类', search: 'select', selectList: cateSelects, laySearch: true},
                    {field: 'title', width: 100, title: '商品名称'},
                    {field: 'logo', width: 100, title: '分类图片', search: false, templet: ea.table.image},
                    {field: 'market_price', width: 100, title: '市场价', templet: ea.table.price},
                    {field: 'discount_price', width: 100, title: '折扣价', templet: ea.table.price},
                    {field: 'total_stock', width: 100, title: '库存统计'},
                    {field: 'stock', width: 100, title: '剩余库存'},
                    {field: 'virtual_sales', width: 100, title: '虚拟销量'},
                    {field: 'sales', width: 80, title: '销量'},
                    {field: 'status', title: '状态', width: 85, selectList: {0: '禁用', 1: '启用'}, templet: ea.table.switch},
                    // 演示多选，实际数据库并无 status2 字段，搜索后会报错
                    {
                        field: 'status2', title: '演示多选', width: 105, search: 'xmSelect', selectList: {1: '模拟选项1', 2: '模拟选项2', 3: '模拟选项3', 4: '模拟选项4', 5: '模拟选项5'}, hide: true,
                        searchOp: 'in', templet: function (res) {
                            // 根据自己实际项目进行输出
                            return res?.status2 || '模拟数据'
                        }
                    },
                    {field: 'create_time', minWidth: 80, title: '创建时间', search: 'range'},
                    {
                        minWidth: 250,
                        title: '操作',
                        templet: ea.table.tool,
                        operat: [
                            [{
                                templet: function (d) {
                                    return `<button type="button" class="layui-btn layui-btn-xs">自定义 ${d.id}</button>`
                                }
                            }, {
                                text: '编辑',
                                url: init.edit_url,
                                method: 'open',
                                auth: 'edit',
                                class: 'layui-btn layui-btn-xs layui-btn-success',
                                extend: 'data-width="90%" data-height="95%"',
                            }, {
                                text: '入库',
                                url: init.stock_url,
                                method: 'open',
                                auth: 'stock',
                                class: 'layui-btn layui-btn-xs layui-btn-normal',
                                visible: function (row) {
                                    return row.status === 1;
                                },
                            }],
                            'delete']
                    }
                ]],
                done: (res) => {
                    // 状态为1的商品背景高亮 展示写法 可根据自己项目自定义
                    $.each(res.data, function (idx, item) {
                        if (item.status === 1) {
                            $(`tr[data-index="${idx}"]`).css({
                                'background': 'linear-gradient(to left, #77eb7c, #bbffbe, #ffffff, transparent)',
                                'border': 'none',
                            })
                        }
                    })
                }
            });

            ea.listen();
        },
        add: function () {
            layui.util.on({
                AiOptimization: function (data) {
                    let layOn = $(data).attr('lay-on')
                    $(data).attr('lay-on', layOn + 'Loading')
                    aiOptimization(data)
                },
            })

            var demo1 = xmSelect.render({
                el: '#demo1',
                name: 'xxx', // form表单提交的name
                theme: {color: getComputedStyle(document.documentElement).getPropertyValue('--ea8-theme-main-color') || '#16b777'},
                data: [
                    {name: 'Make', value: 1},
                    {name: 'PHP', value: 2},
                    {name: 'Great Again', value: 3},
                ]
            })

            ea.listen();
        },
        edit: function () {
            layui.util.on({
                AiOptimization: function (data) {
                    let layOn = $(data).attr('lay-on')
                    $(data).attr('lay-on', layOn + 'Loading')
                    aiOptimization(data)
                },
            })

            var demo1 = xmSelect.render({
                el: '#demo1',
                name: 'xxx', // form表单提交的name
                theme: {color: getComputedStyle(document.documentElement).getPropertyValue('--ea8-theme-main-color') || '#16b777'},
                data: [
                    {name: 'Make', value: 1},
                    {name: 'PHP', value: 2, selected: true,},
                    {name: 'Great Again', value: 3, selected: true,},
                ]
            })

            ea.listen();
        },
        stock: function () {
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
                    {field: 'id', width: 80, title: 'ID', searchOp: '='},
                    {field: 'sort', width: 80, title: '排序', edit: 'text'},
                    {field: 'cate_id', minWidth: 80, title: '商品分类', search: 'select', selectList: cateSelects, laySearch: true},
                    {field: 'title', minWidth: 80, title: '商品名称'},
                    {field: 'logo', minWidth: 80, title: '分类图片', search: false, templet: ea.table.image},
                    {field: 'status', title: '状态', width: 85, selectList: {0: '禁用', 1: '启用'}},
                    // 演示多选，实际数据库并无 status2 字段，搜索后会报错
                    {
                        field: 'status2', title: '演示多选', width: 105, search: 'xmSelect', selectList: {1: '模拟选项1', 2: '模拟选项2', 3: '模拟选项3', 4: '模拟选项4', 5: '模拟选项5'}, hide: true,
                        searchOp: 'in', templet: function (res) {
                            // 根据自己实际项目进行输出
                            return res?.status2 || '模拟数据'
                        }
                    },
                    {field: 'create_time', minWidth: 80, title: '创建时间', search: 'range'},
                    {field: 'delete_time', minWidth: 80, title: '删除时间', search: 'range'},
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
    };

    function aiOptimization(data) {
        let layOn = $(data).attr('lay-on')
        let title = $('input[name="title"]').val()

        // 告诉AI 你需要做什么
        let message = `优化这个标题 ${title}`

        if ($.trim(title) === '') {
            ea.msg.error('标题不能为空', function () {
                $(data).attr('lay-on', layOn.split('Loading')[0])
            })
            return false
        }
        let url = ea.url('mall.goods/aiOptimization')
        ea.request.post({url: url, data: {message: message}}, function (res) {
            let content = res.data?.choices[0]?.message?.content
            // stream 为true 时，AI 内容会逐字输出
            let stream = true
            ea.ai.chat(content, {stream: stream}, function () {
                $(data).attr('lay-on', layOn.split('Loading')[0])
            })
        }, function (error) {
            ea.msg.error(error.msg, function () {
                $(data).attr('lay-on', layOn.split('Loading')[0])
            })
        })
    }
});