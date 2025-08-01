define(["jquery", "tableSelect", "switchSelect", "miniTheme", "xmSelect", "lazyload"], function ($, tableSelect, switchSelect, miniTheme, xmSelect, lazyload) {

    //切换日夜模式
    window.onInitElemStyle = function () {
        try {
            miniTheme.renderElemStyle();
            $('iframe').each(function (index, iframe) {
                if (typeof iframe.contentWindow.onInitElemStyle == "function") {
                    iframe.contentWindow.onInitElemStyle();
                }
            });
            miniTheme.changeThemeMainColor();
        } catch (e) {
        }
    };
    window.onInitElemStyle();

    var form = layui.form,
        layer = layui.layer,
        table = layui.table,
        laydate = layui.laydate,
        upload = layui.upload,
        element = layui.element,
        laytpl = layui.laytpl,
        tableSelect = layui.tableSelect,
        switchSelect = layui.switchSelect,
        util = layui.util;

    layer.config({
        skin: 'layui-layer-easy'
    });

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        upload_url: 'ajax/upload',
        upload_exts: 'doc|gif|ico|icon|jpg|mp3|mp4|p12|pem|png|rar',
        csrf_token: window.CONFIG.CSRF_TOKEN,
        wait_submit: false,
        xmSelectList: {},
        xmSelectModel: {},
    };


    var admin = {
        config: {
            shade: [0.02, '#000'],
        },
        url: function (url) {
            return '/' + CONFIG.ADMIN + '/' + url;
        },
        headers: function () {
            return {'X-CSRF-TOKEN': init.csrf_token};
        },
        //js版empty，判断变量是否为空
        empty: function (r) {
            var n, t, e, f = [void 0, null, !1, 0, "", "0"];
            for (t = 0, e = f.length; t < e; t++) if (r === f[t]) return !0;
            if ("object" == typeof r) {
                for (n in r) if (r.hasOwnProperty(n)) return !1;
                return !0
            }
            return !1
        },
        checkAuth: function (node, elem) {
            if (CONFIG.IS_SUPER_ADMIN) {
                return true;
            }
            if ($(elem).attr('data-auth-' + node) === '1') {
                return true;
            } else {
                return false;
            }
        },
        parame: function (param, defaultParam) {
            return param !== undefined ? param : defaultParam;
        },
        request: {
            post: function (option, ok, no, ex) {
                return admin.request.ajax('post', option, ok, no, ex);
            },
            get: function (option, ok, no, ex) {
                return admin.request.ajax('get', option, ok, no, ex);
            },
            ajax: function (type, option, ok, no, ex) {
                type = type || 'get';
                option.url = option.url || '';
                option.data = option.data || {};
                option.prefix = option.prefix || false;
                option.statusName = option.statusName || 'code';
                option.statusCode = option.statusCode || 1;
                ok = ok || function (res) {
                };
                no = no || function (res) {
                    var msg = res.msg == undefined ? '返回数据格式有误' : res.msg;
                    admin.msg.error(msg);
                    return false;
                };
                ex = ex || function (res) {
                };
                if (option.url == '') {
                    admin.msg.error('请求地址不能为空');
                    return false;
                }
                if (option.prefix == true) {
                    option.url = admin.url(option.url);
                }
                var index = admin.msg.loading('加载中');
                $.ajax({
                    url: option.url,
                    type: type,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    dataType: "json",
                    headers: admin.headers(),
                    data: option.data,
                    timeout: 60000,
                    success: function (res) {
                        admin.msg.close(index);
                        if (eval('res.' + option.statusName) == option.statusCode) {
                            return ok(res);
                        } else {
                            return no(res);
                        }
                    },
                    error: function (xhr, textstatus, thrown) {
                        admin.msg.error('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！', function () {
                            ex(this);
                        });
                        return false;
                    },
                    complete: function (data) {
                        // @todo 刷新csrf-token
                        let token = data.responseJSON ? data.responseJSON.__token__ : ''
                        init.csrf_token = token
                        init.wait_submit = false
                    }
                });
            }
        },
        common: {
            parseNodeStr: function (node) {
                var array = node.split('/');
                $.each(array, function (key, val) {
                    if (key === 0) {
                        val = val.split('.');
                        $.each(val, function (i, v) {
                            val[i] = admin.common.humpToLine(v.replace(v[0], v[0].toLowerCase()));
                        });
                        val = val.join(".");
                        array[key] = val;
                    }
                });
                node = array.join("/");
                return node;
            },
            lineToHump: function (name) {
                return name.replace(/\_(\w)/g, function (all, letter) {
                    return letter.toUpperCase();
                });
            },
            humpToLine: function (name) {
                return name.replace(/([A-Z])/g, "_$1").toLowerCase();
            },
        },
        msg: {
            // 成功消息
            success: function (msg, callback) {
                if (callback === undefined) {
                    callback = function () {
                    }
                }
                var index = layer.msg(msg, {icon: 1, shade: admin.config.shade, scrollbar: false, time: 2000, shadeClose: true}, callback);
                return index;
            },
            // 失败消息
            error: function (msg, callback) {
                if (callback === undefined) {
                    callback = function () {
                    }
                }
                var index = layer.msg(msg, {icon: 2, shade: admin.config.shade, scrollbar: false, time: 3000, shadeClose: true}, callback);
                return index;
            },
            // 警告消息框
            alert: function (msg, callback) {
                var index = layer.alert(msg, {end: callback, scrollbar: false});
                return index;
            },
            // 对话框
            confirm: function (msg, ok, no) {
                var index = layer.confirm(msg, {title: '操作确认', btn: ['确认', '取消']}, function () {
                    typeof ok === 'function' && ok.call(this);
                }, function () {
                    typeof no === 'function' && no.call(this);
                    self.close(index);
                });
                return index;
            },
            // 消息提示
            tips: function (msg, time, callback) {
                var index = layer.msg(msg, {time: (time || 3) * 1000, shade: this.shade, end: callback, shadeClose: true});
                return index;
            },
            // 加载中提示
            loading: function (msg, callback) {
                var index = msg ? layer.msg(msg, {icon: 16, scrollbar: false, shade: this.shade, time: 0, end: callback}) : layer.load(2, {time: 0, scrollbar: false, shade: this.shade, end: callback});
                return index;
            },
            // 关闭消息框
            close: function (index) {
                return layer.close(index);
            }
        },
        table: {
            render: function (options) {
                options.init = options.init || init;
                options.modifyReload = admin.parame(options.modifyReload, true);
                options.elem = options.elem || options.init.table_elem;
                options.id = options.id || options.init.table_render_id;
                options.layFilter = options.id + '_LayFilter';
                options.url = options.url || admin.url(options.init.index_url);
                options.headers = admin.headers();
                options.page = admin.parame(options.page, true);
                options.search = admin.parame(options.search, true);
                options.skin = options.skin || 'line';
                options.limit = options.limit || 15;
                options.limits = options.limits || [10, 15, 20, 25, 50, 100];
                options.cols = options.cols || [];
                let searchBtn = options.search ? {
                    title: '搜索',
                    layEvent: 'TABLE_SEARCH',
                    icon: 'layui-icon-search',
                    extend: 'data-table-id="' + options.id + '"'
                } : []
                options.defaultToolbar = options.defaultToolbar !== false ? (
                    (options.defaultToolbar === undefined ? ['filter', 'print', 'exports'].concat(searchBtn) : options.defaultToolbar.concat(searchBtn))
                ) : false;
                // 判断是否为移动端
                if (admin.checkMobile()) {
                    options.defaultToolbar = options.defaultToolbar !== false ? (
                        !options.search ? ['filter'] : ['filter', {
                            title: '搜索',
                            layEvent: 'TABLE_SEARCH',
                            icon: 'layui-icon-search',
                            extend: 'data-table-id="' + options.id + '"'
                        }]) : false;
                }

                // 判断元素对象是否有嵌套的
                options.cols = admin.table.formatCols(options.cols, options.init);

                // 初始化表格lay-filter
                $(options.elem).attr('lay-filter', options.layFilter);

                // 初始化表格搜索
                if (options.search === true) {
                    admin.table.renderSearch(options.cols, options.elem, options.id);
                }

                // 初始化表格左上方工具栏
                options.toolbar = options.toolbar || ['refresh', 'add', 'delete', 'export', 'recycle'];
                options.toolbar = admin.table.renderToolbar(options.toolbar, options.elem, options.id, options.init);

                // 判断是否有操作列表权限
                options.cols = admin.table.renderOperat(options.cols, options.elem);

                // 判断是否有初始默认搜索条件
                options.where = {}
                $.each(options.cols, function (_, colsV) {
                    let formatFilter = {}
                    let formatOp = {}
                    $.each(colsV, function (i, v) {
                        if (v.field) {
                            if (v.searchValue) {
                                formatFilter[v.field] = v.searchValue
                                formatOp[v.field] = v.searchOp || '='
                                options.where['filter'] = JSON.stringify(formatFilter);
                                options.where['op'] = JSON.stringify(formatOp);
                            }
                        }
                    })
                })

                // 初始化表格
                var newTable = table.render(options);

                // 监听表格搜索开关显示
                admin.table.listenToolbar(options.layFilter, options.id);

                // 监听表格开关切换
                admin.table.renderSwitch(options.cols, options.init, options.id, options.modifyReload);

                // 监听表格开关切换
                admin.table.listenEdit(options.init, options.layFilter, options.id, options.modifyReload);

                // 监听表格排序
                admin.table.listenSort(options);

                return newTable;
            },
            renderToolbar: function (data, elem, tableId, init) {
                data = data || [];
                if (typeof data == "object") {
                    var toolbarHtml = '';
                    $.each(data, function (i, v) {
                        if (v === 'refresh') {
                            toolbarHtml += ' <button class="layui-btn layui-btn-sm layuimini-btn-primary" data-table-refresh="' + tableId + '"><i class="fa fa-refresh"></i> </button>\n';
                        } else if (v === 'add') {
                            if (admin.checkAuth('add', elem)) {
                                toolbarHtml += '<button class="layui-btn layui-btn-normal layui-btn-sm" data-open="' + init.add_url + '" data-title="添加"><i class="fa fa-plus"></i> 添加</button>\n';
                            }
                        } else if (v === 'delete') {
                            if (admin.checkAuth('delete', elem)) {
                                toolbarHtml += '<button class="layui-btn layui-btn-sm layui-btn-danger" data-url="' + init.delete_url + '" data-table-delete="' + tableId + '"><i class="fa fa-trash"></i> 删除</button>\n';
                            }
                        } else if (v === 'export') {
                            if (admin.checkAuth('export', elem)) {
                                toolbarHtml += '<button class="layui-btn layui-btn-sm layui-btn-success easyadmin-export-btn" data-url="' + init.export_url + '" data-table-export="' + tableId + '"><i class="fa fa-file-excel"></i> 导出</button>\n';
                            }
                        } else if (v === 'recycle') {
                            if (init.recycle_url === undefined) {
                                console.warn('未定义回收站地址 init.recycle_url')
                                return false
                            }
                            if (admin.checkAuth('recycle', elem)) {
                                toolbarHtml += '<button class="layui-btn layui-btn-sm layui-bg-orange" data-open="' + init.recycle_url + '" data-title="回收站"><i class="fa fa-recycle"></i> 回收站</button>\n';
                            }
                        } else if (typeof v === "object") {
                            $.each(v, function (ii, vv) {
                                vv.class = vv.class || '';
                                vv.icon = vv.icon || '';
                                vv.auth = vv.auth || '';
                                vv.url = vv.url || '';
                                vv.method = vv.method || 'open';
                                vv.title = vv.title || vv.text;
                                vv.text = vv.text || vv.title;
                                vv.extend = vv.extend || '';
                                vv.checkbox = vv.checkbox || false;
                                if (admin.checkAuth(vv.auth, elem)) {
                                    toolbarHtml += admin.table.buildToolbarHtml(vv, tableId);
                                }
                            });
                        }
                    });
                    return '<div>' + toolbarHtml + '</div>';
                }
                return data
            },
            renderSearch: function (cols, elem, tableId) {
                // TODO 只初始化第一个table搜索字段，如果存在多个(绝少数需求)，得自己去扩展
                cols = cols[0] || {};
                var newCols = [];
                var formHtml = '';
                $.each(cols, function (i, d) {
                    d.field = d.field || false;
                    d.fieldAlias = admin.parame(d.fieldAlias, d.field);
                    d.title = d.title || d.field || '';
                    d.selectList = d.selectList || {};
                    d.search = admin.parame(d.search, true);
                    d.searchTip = d.searchTip || '请输入' + d.title || '';
                    d.searchValue = d.searchValue || '';
                    d.laySearch = d.laySearch || false;
                    d.searchOp = d.searchOp || '%*%';
                    d.timeType = d.timeType || 'datetime';
                    if (d.field !== false && d.search !== false) {
                        switch (d.search) {
                            case true:
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<input id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '" data-search-op="' + d.searchOp + '" value="' + d.searchValue + '" placeholder="' + d.searchTip + '" class="layui-input">\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                            case  'select':
                                d.searchOp = '=';
                                var selectHtml = '';
                                $.each(d.selectList, function (sI, sV) {
                                    var selected = '';
                                    if (sI == d.searchValue) {
                                        selected = 'selected=""';
                                    }
                                    selectHtml += '<option value="' + sI + '" ' + selected + '>' + sV + '</option>/n';
                                });
                                var laySearch = ''
                                if (true === d.laySearch) {
                                    laySearch = 'lay-search'
                                }
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<select class="layui-select" id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '"  data-search-op="' + d.searchOp + '" ' + laySearch + '>\n' +
                                    '<option value="">- 全部 -</option> \n' +
                                    selectHtml +
                                    '</select>\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                            case 'xmSelect':
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<div id="c-' + d.fieldAlias + '" class="tableSearch-xmSelect xmSelect-' + d.fieldAlias + '" name="' + d.fieldAlias + '" data-search-op="' + d.searchOp + '" data-search-value="' + d.searchValue + '"></div>\n' +
                                    '</div>\n' +
                                    '</div>';
                                init.xmSelectList[d.fieldAlias] = d.selectList
                                break;
                            case 'range':
                                d.searchOp = 'range';
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<input style="width: 275px;font-size: 0.82rem" id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '"  data-search-op="' + d.searchOp + '"  value="' + d.searchValue + '" placeholder="' + d.searchTip + '" class="layui-input">\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                            case 'time':
                                d.searchOp = '=';
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<input id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '"  data-search-op="' + d.searchOp + '"  value="' + d.searchValue + '" placeholder="' + d.searchTip + '" class="layui-input">\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                            case 'date':
                                d.searchOp = '=';
                                formHtml += `<div class="layui-form-item layui-inline">
                                                <label class="layui-form-label">${d.title}</label>
                                                <div class="layui-input-inline">
                                                    <input data-date data-date-type="date" id="c-${d.fieldAlias}" name="${d.fieldAlias}" data-search-op="${d.searchOp}"  value="${d.searchValue}" placeholder="${d.searchTip}" class="layui-input">
                                                </div>
                                            </div>`
                                break;
                            case 'datetime':
                                // 适用于日期格式：yyyy-MM-dd HH:mm:ss
                                d.searchOp = 'datetime';
                                formHtml += '<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<input style="width: 275px;font-size: 0.82rem" id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '"  data-search-op="' + d.searchOp + '"  value="' + d.searchValue + '" placeholder="' + d.searchTip + '" class="layui-input">\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                        }
                        newCols.push(d);
                    }
                });
                if (formHtml !== '') {

                    // 默认显示搜索表单
                    let searchTableShow = $(elem).attr('searchTableShow') || 'true'
                    // 默认关闭搜索表单自动补全功能
                    let searchTableAutocomplete = $(elem).attr('searchTableAutocomplete') || 'false'

                    let tableSearchClass = searchTableShow === 'false' ? 'table-search-fieldset layui-hide' : 'table-search-fieldset'
                    $(elem).before('<fieldset id="searchFieldset_' + tableId + '" class="' + tableSearchClass + '">\n' +
                        '<legend>条件搜索</legend>\n' +
                        '<form class="layui-form layui-form-pane form-search">\n' +
                        formHtml +
                        '<div class="layui-form-item layui-inline" style="margin-left: 115px">\n' +
                        '<button type="submit" class="layui-btn layui-btn-normal" data-type="tableSearch" data-table="' + tableId + '" lay-submit lay-filter="' + tableId + '_filter"> 搜 索</button>\n' +
                        '<button type="reset" class="layui-btn layui-btn-primary" data-table-reset="' + tableId + '"> 重 置 </button>\n' +
                        ' </div>' +
                        '</form>' +
                        '</fieldset>');

                    admin.table.listenTableSearch(tableId);

                    // 初始化form表单
                    form.set({
                        // 是否阻止 input 框默认的自动输入完成功能
                        autocomplete: searchTableAutocomplete == 'false' ? 'off' : 'on'
                    })
                    form.render();
                    $.each(newCols, function (ncI, ncV) {
                        if (ncV.search === 'range' || ncV.search === 'datetime') {
                            laydate.render({
                                range: true, type: ncV.timeType, elem: '[name="' + ncV.fieldAlias + '"]', rangeLinked: true,
                                shortcuts: getRangeShortcuts()
                            });
                        }
                        if (ncV.search === 'time') {
                            laydate.render({type: ncV.timeType, elem: '[name="' + ncV.fieldAlias + '"]'});
                        }
                    });
                }
            },
            renderSwitch: function (cols, tableInit, tableId, modifyReload) {
                tableInit.modify_url = tableInit.modify_url || false;
                cols = cols[0] || {};
                tableId = tableId || init.table_render_id;
                if (cols.length > 0) {
                    $.each(cols, function (i, v) {
                        v.filter = v.filter || false;
                        if (v.filter !== false && tableInit.modify_url !== false) {
                            admin.table.listenSwitch({filter: v.filter, url: tableInit.modify_url, tableId: tableId, modifyReload: modifyReload});
                        }
                    });
                }
            },
            renderOperat(data, elem) {
                for (dk in data) {
                    var col = data[dk];
                    var operat = col[col.length - 1].operat;
                    if (operat !== undefined) {
                        var check = false;
                        for (key in operat) {
                            var item = operat[key];
                            if (typeof item === 'string') {
                                if (admin.checkAuth(item, elem)) {
                                    check = true;
                                    break;
                                }
                            } else {
                                for (k in item) {
                                    var v = item[k];
                                    if (v.auth !== undefined && admin.checkAuth(v.auth, elem)) {
                                        check = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!check) {
                            data[dk].pop()
                        }
                    }
                }
                return data;
            },
            buildToolbarHtml: function (toolbar, tableId) {
                var html = '';
                toolbar.class = toolbar.class || '';
                toolbar.icon = toolbar.icon || '';
                toolbar.auth = toolbar.auth || '';
                toolbar.url = toolbar.url || '';
                toolbar.extend = toolbar.extend || '';
                toolbar.method = toolbar.method || 'open';
                toolbar.field = toolbar.field || 'id';
                toolbar.title = toolbar.title || toolbar.text;
                toolbar.text = toolbar.text || toolbar.title;
                toolbar.checkbox = toolbar.checkbox || false;

                var formatToolbar = toolbar;
                formatToolbar.icon = formatToolbar.icon !== '' ? '<i class="' + formatToolbar.icon + '"></i> ' : '';
                formatToolbar.class = formatToolbar.class !== '' ? 'class="' + formatToolbar.class + '" ' : '';
                if (toolbar.method === 'open') {
                    formatToolbar.method = formatToolbar.method !== '' ? 'data-open="' + formatToolbar.url + '" data-title="' + formatToolbar.title + '" ' : '';
                } else if (toolbar.method === 'none') { // 常用于与extend配合，自定义监听按钮
                    formatToolbar.method = '';
                } else {
                    formatToolbar.method = formatToolbar.method !== '' ? 'data-request="' + formatToolbar.url + '" data-title="' + formatToolbar.title + '" ' : '';
                }
                formatToolbar.checkbox = toolbar.checkbox ? ' data-checkbox="true" ' : '';
                formatToolbar.tableId = tableId !== undefined ? ' data-table="' + tableId + '" ' : '';
                html = '<button ' + formatToolbar.class + formatToolbar.method + formatToolbar.extend + formatToolbar.checkbox + formatToolbar.tableId + '>' + formatToolbar.icon + formatToolbar.text + '</button>';

                return html;
            },
            buildOperatHtml: function (operat, data) {
                var html = '';
                operat.class = operat.class || '';
                operat.icon = operat.icon || '';
                operat.auth = operat.auth || '';
                operat.url = operat.url || '';
                operat.extend = operat.extend || '';
                operat.method = operat.method || 'open';
                operat.field = operat.field || 'id';
                operat.title = operat.title || operat.text;
                operat.text = operat.text || operat.title;
                operat.visible = typeof operat.visible !== 'undefined' ? operat.visible : true;

                var formatOperat = operat;
                formatOperat.icon = formatOperat.icon !== '' ? '<i class="' + formatOperat.icon + '"></i> ' : '';
                formatOperat.class = formatOperat.class !== '' ? 'class="' + formatOperat.class + '" ' : '';
                if (operat.method === 'open') {
                    formatOperat.method = formatOperat.method !== '' ? 'data-open="' + formatOperat.url + '" data-title="' + formatOperat.title + '" ' : '';
                } else if (operat.method === 'none') { // 常用于与extend配合，自定义监听按钮
                    formatOperat.method = '';
                } else {
                    formatOperat.method = formatOperat.method !== '' ? 'data-request="' + formatOperat.url + '" data-title="' + formatOperat.title + '" ' : '';
                }
                html = '<a ' + formatOperat.class + formatOperat.method + formatOperat.extend + '>' + formatOperat.icon + formatOperat.text + '</a>';

                if ('function' === typeof formatOperat.visible) {
                    let visible = formatOperat.visible(data);
                    if (typeof visible === 'boolean') {
                        if (!visible) html = ''
                    }
                } else {
                    if (typeof formatOperat.visible === 'boolean') {
                        if (!formatOperat.visible) html = ''
                    }
                }

                return html;
            },
            toolSpliceUrl(url, field, data) {
                url = url.indexOf("?") !== -1 ? url + '&' + field + '=' + data[field] : url + '?' + field + '=' + data[field];
                return url;
            },
            formatCols: function (cols, init) {
                for (i in cols) {
                    var col = cols[i];
                    for (index in col) {
                        var val = col[index];

                        // 判断是否包含初始化数据
                        if (val.init === undefined) {
                            cols[i][index]['init'] = init;
                        }

                        // 格式化列操作栏
                        if (val.templet === admin.table.tool && val.operat === undefined) {
                            cols[i][index]['operat'] = ['edit', 'delete'];
                        }

                        // 判断是否包含开关组件
                        if (val.templet === admin.table.switch && val.filter === undefined) {
                            cols[i][index]['filter'] = val.field;
                        }

                        // 判断是否含有搜索下拉列表
                        if (val.selectList !== undefined && val.search === undefined) {
                            cols[i][index]['search'] = 'select';
                        }

                        // 判断是否初始化对齐方式
                        if (val.align === undefined) {
                            cols[i][index]['align'] = 'center';
                        }

                        // 部分字段开启排序
                        var sortDefaultFields = ['id', 'sort'];
                        if (val.sort === undefined && sortDefaultFields.indexOf(val.field) >= 0) {
                            cols[i][index]['sort'] = true;
                        }

                        // 初始化图片高度
                        if (val.templet === admin.table.image && val.imageHeight === undefined) {
                            cols[i][index]['imageHeight'] = 40;
                        }

                        // 判断是否多层对象
                        if (val.field !== undefined && val.field.split(".").length > 1) {
                            if (val.templet === undefined) {
                                cols[i][index]['templet'] = admin.table.value;
                            }
                        }

                        // 判断是否列表数据转换
                        if (val.selectList !== undefined && val.templet === undefined) {
                            cols[i][index]['templet'] = admin.table.list;
                        }

                    }
                }
                return cols;
            },
            tool: function (data, option) {
                var option = data.LAY_COL || {};
                option.operat = option.operat || ['edit', 'delete'];
                var elem = option.init.table_elem || init.table_elem;
                var html = '';
                $.each(option.operat, function (i, item) {
                    if (typeof item === 'string') {
                        switch (item) {
                            case 'edit':
                                var operat = {
                                    class: 'layui-btn layui-btn-success layui-btn-xs',
                                    method: 'open',
                                    field: 'id',
                                    icon: '',
                                    text: '编辑',
                                    title: '编辑信息',
                                    auth: 'edit',
                                    url: option.init.edit_url,
                                    extend: ""
                                };
                                operat.url = admin.table.toolSpliceUrl(operat.url, operat.field, data);
                                if (admin.checkAuth(operat.auth, elem)) {
                                    html += admin.table.buildOperatHtml(operat, data);
                                }
                                break;
                            case 'delete':
                                var operat = {
                                    class: 'layui-btn layui-btn-danger layui-btn-xs',
                                    method: 'get',
                                    field: 'id',
                                    icon: '',
                                    text: '删除',
                                    title: '确定删除？',
                                    auth: 'delete',
                                    url: option.init.delete_url,
                                    extend: ""
                                };
                                operat.url = admin.table.toolSpliceUrl(operat.url, operat.field, data);
                                if (admin.checkAuth(operat.auth, elem)) {
                                    html += admin.table.buildOperatHtml(operat, data);
                                }
                                break;
                        }

                    } else if (typeof item === 'object') {

                        $.each(item, function (i, operat) {
                            if (typeof operat !== 'object') return

                            if ('function' === typeof operat.templet) {
                                html += operat.templet(data);
                                return true;
                            }

                            operat.class = operat.class || '';
                            operat.icon = operat.icon || '';
                            operat.auth = operat.auth || '';
                            operat.url = operat.url || '';
                            operat.method = operat.method || 'open';
                            operat.field = operat.field || 'id';
                            operat.title = operat.title || operat.text;
                            operat.text = operat.text || operat.title;
                            operat.extend = operat.extend || '';

                            // 自定义表格opreat按钮的弹窗标题风格，extra是表格里的欲加入标题中的字段
                            operat.extra = operat.extra || '';
                            if (data[operat.extra] !== undefined) {
                                operat.title = data[operat.extra] + ' - ' + operat.title;
                            }

                            operat.url = admin.table.toolSpliceUrl(operat.url, operat.field, data);
                            if (admin.checkAuth(operat.auth, elem)) {
                                html += admin.table.buildOperatHtml(operat, data);
                            }
                        });
                    }
                });
                return html;
            },
            list: function (data, option) {
                var option = data.LAY_COL || {};
                option.selectList = option.selectList || {};
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                if (option.selectList[value] === undefined || option.selectList[value] === '' || option.selectList[value] === null) {
                    return value;
                } else {
                    return option.selectList[value];
                }
            },
            image: function (data, option) {
                var option = data.LAY_COL || {};
                option.imageWidth = option.imageWidth || 200;
                option.imageHeight = option.imageHeight || 40;
                option.imageSplit = option.imageSplit || '|';
                option.imageJoin = option.imageJoin || '<br>';
                option.title = option.title || option.field;
                var field = option.field,
                    title = data[option.title];
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                if (value === undefined || value === null) {
                    return '<img style="max-width: ' + option.imageWidth + 'px; max-height: ' + option.imageHeight + 'px;" src="' + value + '" data-image="' + title + '">';
                } else {
                    var values = value.split(option.imageSplit),
                        valuesHtml = [];
                    values.forEach((value, index) => {
                        valuesHtml.push('<img style="max-width: ' + option.imageWidth + 'px; max-height: ' + option.imageHeight + 'px;" class="lazyload" src="/static/common/images/loading.gif" data-src="' + value + '" data-image="' + title + '">');
                    });
                    $(function () {
                        $("img.lazyload").lazyload({threshold: 1});
                    })
                    return valuesHtml.join(option.imageJoin);
                }
            },
            url: function (data, option) {
                var option = data.LAY_COL || {};
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                return '<a class="layuimini-table-url" href="' + value + '" target="_blank" class="label bg-green">' + value + '</a>';
            },
            switch: function (data, option) {
                var option = data.LAY_COL || {};
                option.filter = option.filter || option.field || null;
                option.checked = option.checked || 1;
                option.tips = option.tips || '开|关';
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                var checked = value === option.checked ? 'checked' : '';
                return laytpl('<input type="checkbox" name="' + option.field + '" value="' + data.id + '" lay-skin="switch" lay-text="' + option.tips + '" lay-filter="' + option.filter + '" ' + checked + ' >').render(data);
            },
            price: function (data, option) {
                var option = data.LAY_COL || {};
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                return '<span>￥' + value + '</span>';
            },
            percent: function (data, option) {
                var option = data.LAY_COL || {};
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                return '<span>' + value + '%</span>';
            },
            icon: function (data, option) {
                var option = data.LAY_COL || {};
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                return '<i class="' + value + '"></i>';
            },
            text: function (data, option) {
                var option = data.LAY_COL || {};
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                return '<span class="line-limit-length">' + value + '</span>';
            },
            value: function (data, option) {
                var option = data.LAY_COL || {};
                try {
                    var value = admin.table.defaultValue(data);
                } catch (e) {
                    var value = undefined;
                }
                return '<span>' + value + '</span>';
            },
            //时间戳转日期
            date: function (data, option) {
                var option = data.LAY_COL || {};
                var field = option.field, value = '';
                try {
                    value = eval("data." + field);
                } catch (e) {
                }
                if (!admin.empty(value)) {
                    value = util.toDateString(value * 1000, option.format || 'yyyy-MM-dd HH:mm:ss');
                }
                return '<span>' + value + '</span>';
            },
            // 统一列返回数据处理
            defaultValue(data, field, _value) {
                if (!data.LAY_COL) {
                    return '';
                }
                var option = data.LAY_COL || {};
                field = field || option.field;
                _value = _value || option.defaultValue;
                var valueParser = option.valueParser;
                var value = _value;
                try {
                    value = eval("data." + field);
                } catch (e) {
                    value = undefined;
                }

                if (_value != undefined && admin.empty(value)) {
                    value = defaultValue;
                }

                if (typeof valueParser == 'function') {
                    value = valueParser(value, data);
                }

                return value;
            },
            listenTableSearch: function (tableId) {
                if (Object.keys(init.xmSelectList).length > 0) {
                    $.each(init.xmSelectList, function (index, value) {
                        let xmSearchValue = $('#c-' + index).data('search-value') || [];
                        if (!Array.isArray(xmSearchValue)) xmSearchValue = (xmSearchValue.toString()).split(',')
                        const keysArray = Object.keys(value).map((key) => {
                            return {name: value[key], value: key, selected: xmSearchValue.indexOf(key) !== -1}
                        })
                        init.xmSelectModel[index] = xmSelect.render({
                            el: '.xmSelect-' + index, language: 'zn', data: keysArray, name: index,
                            filterable: true, paging: true, pageSize: 10, toolbar: {show: true},
                            theme: {color: getComputedStyle(document.documentElement).getPropertyValue('--ea8-theme-main-color') || '#16b777'}
                        })
                    })
                }
                form.on('submit(' + tableId + '_filter)', function (data) {
                    var dataField = data.field;
                    var formatFilter = {},
                        formatOp = {};
                    $.each(dataField, function (key, val) {
                        if (val !== '') {
                            formatFilter[key] = val;
                            var op = $('#c-' + key).attr('data-search-op');
                            op = op || '%*%';
                            formatOp[key] = op;
                        }
                    });
                    table.reload(tableId, {
                        page: {
                            curr: 1
                        }
                        , where: {
                            filter: JSON.stringify(formatFilter),
                            op: JSON.stringify(formatOp)
                        }
                    }, 'data');
                    return false;
                });
            },
            listenSwitch: function (option, ok) {
                option.filter = option.filter || '';
                option.url = option.url || '';
                option.field = option.field || option.filter || '';
                option.tableId = option.tableId || init.table_render_id;
                option.modifyReload = option.modifyReload || false;
                form.on('switch(' + option.filter + ')', function (obj) {
                    var checked = obj.elem.checked ? 1 : 0;
                    if (typeof ok === 'function') {
                        return ok({
                            id: obj.value,
                            checked: checked,
                        });
                    } else {
                        var data = {
                            id: obj.value,
                            field: option.field,
                            value: checked,
                        };
                        admin.request.post({
                            url: option.url,
                            prefix: true,
                            data: data,
                        }, function (res) {
                            if (option.modifyReload) {
                                table.reload(option.tableId);
                            }
                        }, function (res) {
                            admin.msg.error(res.msg, function () {
                                table.reload(option.tableId);
                            });
                        }, function () {
                            table.reload(option.tableId);
                        });
                    }
                });
            },
            listenToolbar: function (layFilter, tableId) {
                table.on('toolbar(' + layFilter + ')', function (obj) {

                    // 搜索表单的显示
                    switch (obj.event) {
                        case 'TABLE_SEARCH':
                            var searchFieldsetId = 'searchFieldset_' + tableId;
                            var _that = $("#" + searchFieldsetId);
                            if (_that.hasClass("layui-hide")) {
                                _that.removeClass('layui-hide');
                            } else {
                                _that.addClass('layui-hide');
                            }
                            break;
                    }
                });
            },
            listenEdit: function (tableInit, layFilter, tableId, modifyReload) {
                tableInit.modify_url = tableInit.modify_url || false;
                tableId = tableId || init.table_render_id;
                if (tableInit.modify_url !== false) {
                    table.on('edit(' + layFilter + ')', function (obj) {
                        var value = obj.value,
                            data = obj.data,
                            id = data.id,
                            field = obj.field;
                        var _data = {
                            id: id,
                            field: field,
                            value: value,
                        };
                        admin.request.post({
                            url: tableInit.modify_url,
                            prefix: true,
                            data: _data,
                        }, function (res) {
                            if (modifyReload) {
                                table.reload(tableId);
                            }
                        }, function (res) {
                            admin.msg.error(res.msg, function () {
                                table.reload(tableId);
                            });
                        }, function () {
                            table.reload(tableId);
                        });
                    });
                }
            },
            listenSort: function (options) {
                table.on('sort(' + options.layFilter + ')', function (obj) {
                    let defaultWhere = {}
                    $.each(options.cols, function (_, colsV) {
                        let formatFilter = {}
                        let formatOp = {}
                        $.each(colsV, function (i, v) {
                            if (v.field) {
                                if ($('#c-' + v.field).val()) {
                                    formatFilter[v.field] = $('#c-' + v.field).val()
                                    formatOp[v.field] = v.searchOp || '='
                                    defaultWhere['filter'] = JSON.stringify(formatFilter);
                                    defaultWhere['op'] = JSON.stringify(formatOp);
                                }
                            }
                        })
                    })
                    let sortWhere = {tableOrder: obj.field + ' ' + obj.type}
                    table.reload(options.id, {
                        where: {...defaultWhere, ...sortWhere}
                    });
                });
            }
        },
        checkMobile: function () {
            var userAgentInfo = navigator.userAgent;
            var mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
            var mobile_flag = false;
            //根据userAgent判断是否是手机
            for (var v = 0; v < mobileAgents.length; v++) {
                if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
                    mobile_flag = true;
                    break;
                }
            }
            var screen_width = window.screen.width;
            var screen_height = window.screen.height;
            //根据屏幕分辨率判断是否是手机
            if (screen_width < 600 && screen_height < 800) {
                mobile_flag = true;
            }
            return mobile_flag;
        },
        open: function (title, url, width, height, isResize, shadeClose = false) {
            isResize = isResize === undefined ? true : isResize;
            var index = layer.open({
                title: title,
                type: 2,
                area: [width, height],
                content: url,
                maxmin: true,
                anim: 0,
                moveOut: true,
                shade: 0.3,
                shadeClose: shadeClose,
                scrollbar: false,
                before: function () {
                },
                success: function (layero, index) {
                    if (window.CONFIG.IFRAME_OPEN_TOP == '1') {
                        let iframeUrl = ``
                        try {
                            let iframeId = $('iframe:eq(0)').attr('id')
                            let iframe = document.getElementById(iframeId)
                            iframeUrl = iframe.contentWindow.location.href
                        } catch (e) {
                            iframeUrl = location.href
                        }
                        let _winTopBtn = `
                            <span class="_winTopBtn layui-btn layui-btn-primary layui-btn-xs" 
                            style="position: absolute;top: 14px;right: 120px;color: #fff;border-color: #fff;" onclick="window.open('${iframeUrl}')">
                            新标签页打开
                            </span>`
                        $('.layui-layer-iframe').append(_winTopBtn)
                    }
                },
                end: function () {
                    index = null
                }
            });
            if (admin.checkMobile()) {
                layer.full(index);
            }

            if (isResize) {
                $(window).on("resize", function () {
                    index && layer.full(index);
                })
            }
        },
        listen: function (preposeCallback, ok, no, ex) {

            // 监听表单是否为必填项
            admin.api.formRequired();

            // 监听表单提交事件
            admin.api.formSubmit(preposeCallback, ok, no, ex);

            // 初始化图片显示以及监听上传事件
            admin.api.upload();

            // 监听富文本初始化
            admin.api.editor();

            // 监听下拉选择生成
            admin.api.select();

            // 监听时间控件生成
            admin.api.date();

            form.render();

            // 表格修改
            $("body").on("mouseenter", ".table-edit-tips", function () {
                var openTips = layer.tips('点击行内容可以进行修改', $(this), {tips: [2, '#e74c3c'], time: 4000});
            });

            // 监听弹出层的打开
            $('body').on('click', '[data-open]', function () {

                var clienWidth = $(this).attr('data-width'),
                    clientHeight = $(this).attr('data-height'),
                    dataFull = $(this).attr('data-full'),
                    checkbox = $(this).attr('data-checkbox'),
                    url = $(this).attr('data-open'),
                    external = $(this).attr('data-external') || false,
                    tableId = $(this).attr('data-table');

                if (checkbox === 'true') {
                    tableId = tableId || init.table_render_id;
                    var checkStatus = table.checkStatus(tableId),
                        data = checkStatus.data;
                    if (data.length <= 0) {
                        admin.msg.error('请勾选需要操作的数据');
                        return false;
                    }
                    var ids = [];
                    $.each(data, function (i, v) {
                        ids.push(v.id);
                    });
                    if (url.indexOf("?") === -1) {
                        url += '?id=' + ids.join(',');
                    } else {
                        url += '&id=' + ids.join(',');
                    }
                }

                if (clienWidth === undefined || clientHeight === undefined) {
                    clienWidth = '65%';
                    clientHeight = '85%';
                }
                if (dataFull === 'true') {
                    clienWidth = '100%';
                    clientHeight = '100%';
                }

                admin.open(
                    $(this).attr('data-title'),
                    external ? url : admin.url(url),
                    clienWidth,
                    clientHeight,
                );
            });

            // 放大图片
            $('body').on('click', '[data-image]', function () {
                var title = $(this).attr('data-image'),
                    src = $(this).attr('src'),
                    alt = $(this).attr('alt');
                var photos = {
                    "title": title,
                    "id": Math.random(),
                    "data": [
                        {
                            "alt": alt,
                            "pid": Math.random(),
                            "src": src,
                            "thumb": src
                        }
                    ]
                };
                layer.photos({
                    photos: photos,
                    anim: 5
                });
                return false;
            });

            // 放大一组图片
            $('body').on('click', '[data-images]', function () {
                var title = $(this).attr('data-images'),
                    // 从当前元素向上找layuimini-upload-show找到第一个后停止, 再找其所有子元素li
                    doms = $(this).closest(".layuimini-upload-show").children("li"),
                    // 被点击的图片地址
                    now_src = $(this).attr('src'),
                    alt = $(this).attr('alt'),
                    data = [];
                $.each(doms, function (key, value) {
                    var src = $(value).find('img').attr('src');
                    if (src != now_src) {
                        // 压入其他图片地址
                        data.push({
                            "alt": alt,
                            "pid": Math.random(),
                            "src": src,
                            "thumb": src
                        });
                    } else {
                        // 把当前图片插入到头部
                        data.unshift({
                            "alt": alt,
                            "pid": Math.random(),
                            "src": now_src,
                            "thumb": now_src
                        });
                    }
                });
                var photos = {
                    "title": title,
                    "id": Math.random(),
                    "data": data,
                };
                layer.photos({
                    photos: photos,
                    anim: 5
                });
                return false;
            });


            // 监听动态表格刷新
            $('body').on('click', '[data-table-refresh]', function () {
                var tableId = $(this).attr('data-table-refresh');
                if (tableId === undefined || tableId === '' || tableId == null) {
                    tableId = init.table_render_id;
                }
                table.reload(tableId);
            });

            // 监听搜索表格重置
            $('body').on('click', '[data-table-reset]', function () {
                var tableId = $(this).attr('data-table-reset');
                if (tableId === undefined || tableId === '' || tableId == null) {
                    tableId = init.table_render_id;
                }
                if (Object.keys(init.xmSelectModel).length > 0) {
                    $.each(init.xmSelectModel, function (index, value) {
                        init.xmSelectModel[index].setValue([])
                    })
                }
                table.reload(tableId, {
                    page: {
                        curr: 1
                    }
                    , where: {
                        filter: '{}',
                        op: '{}'
                    }
                }, 'data');
            });

            // 监听请求
            $('body').on('click', '[data-request]', function () {
                var title = $(this).attr('data-title'),
                    url = $(this).attr('data-request'),
                    tableId = $(this).attr('data-table'),
                    addons = $(this).attr('data-addons'),
                    checkbox = $(this).attr('data-checkbox'),
                    direct = $(this).attr('data-direct'),
                    field = $(this).attr('data-field') || 'id';

                title = title || '确定进行该操作？';

                if (direct === 'true') {
                    admin.msg.confirm(title, function () {
                        window.location.href = url;
                    });
                    return false;
                }

                var postData = {};
                if (checkbox === 'true') {
                    tableId = tableId || init.table_render_id;
                    var checkStatus = table.checkStatus(tableId),
                        data = checkStatus.data;
                    if (data.length <= 0) {
                        admin.msg.error('请勾选需要操作的数据');
                        return false;
                    }
                    var ids = [];
                    $.each(data, function (i, v) {
                        ids.push(v[field]);
                    });
                    postData[field] = ids;
                }

                if (addons !== true && addons !== 'true') {
                    url = admin.url(url);
                }
                tableId = tableId || init.table_render_id;
                admin.msg.confirm(title, function () {
                    admin.request.post({
                        url: url,
                        data: postData,
                    }, function (res) {
                        admin.msg.success(res.msg, function () {
                            table.reload(tableId);
                            $('[data-treetable-refresh]').trigger("click");
                        });
                    })
                });
                return false;
            });

            // excel导出
            $('body').on('click', '[data-table-export]', function () {
                var tableId = $(this).attr('data-table-export'),
                    url = $(this).attr('data-url');

                let par = $("#searchFieldset_" + tableId).find('form').serialize();
                let parArr = par.split('&')
                var formatFilter = {}, formatOp = {};
                [formatData] = parArr.map((arr) => {
                    [key, val] = arr.split('=');
                    if (val !== '') {
                        formatFilter[key] = val;
                        var op = $('#c-' + key).attr('data-search-op');
                        op = op || '%*%';
                        formatOp[key] = op;
                    }
                    return {formatFilter, formatOp};
                })
                let schPar = 'filter=' + JSON.stringify(formatData.formatFilter) + '&' + 'op=' + JSON.stringify(formatData.formatOp);
                url = (url.includes('?')) ? url + '&' + schPar : url + '?' + schPar;
                var index = admin.msg.confirm('根据查询进行导出，确定导出？', function () {
                    window.location = admin.url(url);
                    layer.close(index);
                });
            });

            // 数据表格多删除
            $('body').on('click', '[data-table-delete]', function () {
                var tableId = $(this).attr('data-table-delete'),
                    url = $(this).attr('data-url');
                tableId = tableId || init.table_render_id;
                url = url !== undefined ? admin.url(url) : window.location.href;
                var checkStatus = table.checkStatus(tableId),
                    data = checkStatus.data;
                if (data.length <= 0) {
                    admin.msg.error('请勾选需要删除的数据');
                    return false;
                }
                var ids = [];
                $.each(data, function (i, v) {
                    ids.push(v.id);
                });
                admin.msg.confirm('确定删除？', function () {
                    admin.request.post({
                        url: url,
                        data: {
                            id: ids
                        },
                    }, function (res) {
                        admin.msg.success(res.msg, function () {
                            table.reload(tableId);
                        });
                    });
                });
                return false;
            });

        },
        api: {
            form: function (url, data, ok, no, ex, refreshTable) {
                if (refreshTable === undefined) {
                    refreshTable = true;
                }
                ok = ok || function (res) {
                    res.msg = res.msg || '';
                    admin.msg.success(res.msg, function () {
                        admin.api.closeCurrentOpen({
                            refreshTable: refreshTable
                        });
                    });
                    return false;
                };
                admin.request.post({
                    url: url,
                    data: data,
                }, ok, no, ex);
                return false;
            },
            closeCurrentOpen: function (option) {
                option = option || {};
                option.refreshTable = option.refreshTable || false;
                option.refreshFrame = option.refreshFrame || false;
                if (option.refreshTable === true) {
                    option.refreshTable = init.table_render_id;
                }
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
                if (option.refreshTable !== false) {
                    parent.layui.table.reload(option.refreshTable);
                }
                if (option.refreshFrame) {
                    parent.location.reload();
                }
                return false;
            },
            refreshFrame: function () {
                parent.location.reload();
                return false;
            },
            refreshTable: function (tableName) {
                tableName = tableName || 'currentTable';
                table.reload(tableName);
            },
            formRequired: function () {
                var verifyList = document.querySelectorAll("[lay-verify]");
                if (verifyList.length > 0) {
                    $.each(verifyList, function (i, v) {
                        var verify = $(this).attr('lay-verify');

                        // todo 必填项处理
                        if (verify.includes('required')) {
                            var label = $(this).parent().prev();
                            if (label.is('label') && !label.hasClass('required')) {
                                label.addClass('required');
                            }
                            if ($(this).attr('lay-reqtext') === undefined && $(this).attr('placeholder') !== undefined) {
                                $(this).attr('lay-reqtext', $(this).attr('placeholder'));
                            }
                            if ($(this).attr('placeholder') === undefined && $(this).attr('lay-reqtext') !== undefined) {
                                $(this).attr('placeholder', $(this).attr('lay-reqtext'));
                            }
                        }

                    });
                }
            },
            formSubmit: function (preposeCallback, ok, no, ex) {
                var formList = document.querySelectorAll("[lay-submit]");

                // 表单提交自动处理
                if (formList.length > 0) {
                    $.each(formList, function (i, v) {
                        var filter = $(this).attr('lay-filter'),
                            type = $(this).attr('data-type'),
                            refresh = $(this).attr('data-refresh'),
                            url = $(this).attr('lay-submit');
                        // 表格搜索不做自动提交
                        if (type === 'tableSearch') {
                            return false;
                        }
                        // 判断是否需要刷新表格
                        if (refresh === 'false') {
                            refresh = false;
                        } else {
                            refresh = true;
                        }
                        // 自动添加layui事件过滤器
                        if (filter === undefined || filter === '') {
                            filter = 'save_form_' + (i + 1);
                            $(this).attr('lay-filter', filter)
                        }
                        if (url === undefined || url === '' || url === null) {
                            url = window.location.href;
                        } else {
                            url = admin.url(url);
                        }
                        form.on('submit(' + filter + ')', function (data) {
                            if (init.wait_submit) {
                                layer.msg('你点击太快了', {icon: 16, shade: 0.3, shadeClose: false, time: 1000})
                                return false
                            }
                            var dataField = data.field;
                            var editorList = document.querySelectorAll(".editor");
                            // 富文本数据处理
                            if (editorList.length > 0) {
                                $.each(editorList, function (i, v) {
                                    switch (window.CONFIG.EDITOR_TYPE) {
                                        case 'ckeditor':
                                            var name = $(this).attr("name");
                                            dataField[name] = CKEDITOR.instances[name].getData();
                                            break;
                                        case 'wangEditor':
                                            var name = $(this).attr("name");
                                            dataField[name] = (window["wangEditor_" + i]).getHtml()
                                            break;
                                        case 'EasyMDE':
                                            var name = $(this).attr("name");
                                            dataField[name] = (window["easyMDE" + i]).value()
                                            break;
                                        default:
                                            var name = $(this).attr("id");
                                            dataField[name] = UE.getEditor(name).getContent();
                                    }
                                });
                            }
                            if (typeof preposeCallback === 'function') {
                                dataField = preposeCallback(dataField);
                            }
                            init.wait_submit = true
                            admin.api.form(url, dataField, ok, no, ex, refresh);
                            return false;
                        });
                    });
                }

            },
            upload: function () {
                var uploadList = document.querySelectorAll("[data-upload]");
                var uploadSelectList = document.querySelectorAll("[data-upload-select]");

                if (uploadList.length > 0) {
                    $.each(uploadList, function (i, v) {
                        var uploadExts = $(this).attr('data-upload-exts') || init.upload_exts,
                            uploadName = $(this).attr('data-upload'),
                            uploadNumber = $(this).attr('data-upload-number') || 'one',
                            uploadSign = $(this).attr('data-upload-sign') || '|',
                            uploadAccept = $(this).attr('data-upload-accept') || 'file',
                            uploadAcceptMime = $(this).attr('data-upload-mimetype') || '',
                            elem = "input[name='" + uploadName + "']",
                            uploadElem = this;

                        // 监听上传事件
                        upload.render({
                            elem: this,
                            url: admin.url(init.upload_url),
                            exts: uploadExts,
                            accept: uploadAccept,//指定允许上传时校验的文件类型
                            acceptMime: uploadAcceptMime,//规定打开文件选择框时，筛选出的文件类型
                            multiple: uploadNumber !== 'one',//是否多文件上传
                            headers: admin.headers(),
                            before: function () {
                                this.headers['X-CSRF-TOKEN'] = init.csrf_token
                            },
                            done: function (res) {
                                if (res.code === 1) {
                                    var url = res.data.url;
                                    if (uploadNumber !== 'one') {
                                        var oldUrl = $(elem).val();
                                        if (oldUrl !== '') {
                                            url = oldUrl + uploadSign + url;
                                        }
                                    }
                                    $(elem).val(url);
                                    $(elem).trigger("input");
                                    admin.msg.success(res.msg);
                                } else {
                                    admin.msg.error(res.msg);
                                }
                                let token = res ? res.__token__ : ''
                                init.csrf_token = token
                                return false;
                            }
                        });

                        // 监听上传input值变化
                        $(elem).bind("input propertychange", function (event) {
                            var urlString = $(this).val(),
                                urlArray = urlString.split(uploadSign),
                                uploadIcon = $(uploadElem).attr('data-upload-icon') || "file";

                            $('#bing-' + uploadName).remove();
                            if (urlString.length > 0) {
                                var parant = $(this).parent('div');
                                var liHtml = '';
                                $.each(urlArray, function (i, v) {
                                    liHtml += '<li><a><img src="' + v + '" data-image  onerror="this.src=\'' + BASE_URL + 'admin/images/upload-icons/' + uploadIcon + '.png\';this.onerror=null"></a><small class="uploads-delete-tip bg-red badge" data-upload-delete="' + uploadName + '" data-upload-url="' + v + '" data-upload-sign="' + uploadSign + '">×</small></li>\n';
                                });
                                parant.after('<ul id="bing-' + uploadName + '" class="layui-input-block layuimini-upload-show">\n' + liHtml + '</ul>');
                            }

                        });

                        // 非空初始化图片显示
                        if ($(elem).val() !== '') {
                            $(elem).trigger("input");
                        }
                    });

                    // 监听上传文件的删除事件
                    $('body').on('click', '[data-upload-delete]', function () {
                        var uploadName = $(this).attr('data-upload-delete'),
                            deleteUrl = $(this).attr('data-upload-url'),
                            sign = $(this).attr('data-upload-sign');
                        var confirm = admin.msg.confirm('确定删除？', function () {
                            var elem = "input[name='" + uploadName + "']";
                            var currentUrl = $(elem).val();
                            var url = '';
                            if (currentUrl !== deleteUrl) {
                                url = currentUrl.search(deleteUrl) === 0 ? currentUrl.replace(deleteUrl + sign, '') : currentUrl.replace(sign + deleteUrl, '');
                                $(elem).val(url);
                                $(elem).trigger("input");
                            } else {
                                $(elem).val(url);
                                $('#bing-' + uploadName).remove();
                            }
                            admin.msg.close(confirm);
                        });
                        return false;
                    });
                }

                if (uploadSelectList.length > 0) {
                    $.each(uploadSelectList, function (i, v) {
                        var uploadName = $(this).attr('data-upload-select'),
                            uploadNumber = $(this).attr('data-upload-number') || 'one',
                            uploadSign = $(this).attr('data-upload-sign') || '|';

                        var selectCheck = uploadNumber === 'one' ? 'radio' : 'checkbox';
                        var elem = "input[name='" + uploadName + "']",
                            uploadElem = $(this).attr('id');

                        tableSelect.render({
                            elem: "#" + uploadElem,
                            checkedKey: 'id',
                            searchType: 'more',
                            searchList: [
                                {searchKey: 'title', searchPlaceholder: '请输入文件名'},
                            ],
                            table: {
                                url: admin.url('ajax/getUploadFiles'),
                                cols: [[
                                    {type: selectCheck},
                                    {field: 'id', title: 'ID'},
                                    {field: 'url', minWidth: 80, search: false, title: '图片信息', imageHeight: 30, align: "center", templet: admin.table.image},
                                    {field: 'original_name', width: 150, title: '文件原名', align: "center"},
                                    {field: 'mime_type', width: 120, title: 'mime类型', align: "center"},
                                    {field: 'create_time', width: 200, title: '创建时间', align: "center", search: 'range'},
                                ]]
                            },
                            done: function (e, data) {
                                var urlArray = [];
                                $.each(data.data, function (index, val) {
                                    urlArray.push(val.url)
                                });
                                var url = urlArray.join(uploadSign);
                                admin.msg.success('选择成功', function () {
                                    $(elem).val(url);
                                    $(elem).trigger("input");
                                });
                            }
                        })
                    });
                }
            },
            editor: function () {
                let editorList = document.querySelectorAll(".editor");
                if (editorList.length > 0) {
                    let wangEditors = {}
                    $.each(editorList, function (i, v) {
                        switch (window.CONFIG.EDITOR_TYPE) {
                            case 'ckeditor':
                                CKEDITOR.tools.setCookie('ckCsrfToken', init.csrf_token);
                                CKEDITOR.replace($(this).attr("name"), {
                                    height: $(this).height(),
                                    filebrowserImageUploadUrl: admin.url('ajax/upload?type=editor'),
                                });
                                break;
                            case 'wangEditor':
                                var wangEditor = window.wangEditor;
                                var wangEditorName = "wangEditor_" + i
                                window[wangEditorName] = wangEditor.createEditor({
                                    selector: '#editor_' + $(this).attr('name'),
                                    html: $(this).text(),
                                    config: {
                                        MENU_CONF: {
                                            // 上传图片
                                            uploadImage: {
                                                server: window.CONFIG.ADMIN_UPLOAD_URL,
                                                fieldName: 'file',
                                                meta: {
                                                    editor: 'editor',
                                                },
                                                async customInsert(res, insertFn) {
                                                    let code = res.code || 0
                                                    if (code != '1') {
                                                        layer.msg(res.msg || '上传失败', {icon: 2});
                                                        return
                                                    }
                                                    let url = res.data?.url || ''
                                                    let alt = ''
                                                    let href = ''
                                                    insertFn(url, alt, href)
                                                }
                                            },
                                            // 上传视频
                                            uploadVideo: {
                                                server: window.CONFIG.ADMIN_UPLOAD_URL,
                                                fieldName: 'file',
                                                meta: {editor: 'editor',},
                                                async customInsert(res, insertFn) {
                                                    let code = res.code || 0
                                                    if (code != '1') {
                                                        layer.msg(res.msg || '上传失败', {icon: 2});
                                                        return
                                                    }
                                                    let url = res.data?.url || ''
                                                    let alt = ''
                                                    let href = ''
                                                    insertFn(url, alt, href)
                                                }
                                            }
                                        },
                                    }
                                })
                                let editor = window[wangEditorName]
                                wangEditor.createToolbar({
                                    editor,
                                    selector: '#editor_toolbar_' + $(this).attr("name"),
                                    config: {}
                                })
                                break;
                            case 'EasyMDE':
                                const easyMDEName = "easyMDE" + i
                                window[easyMDEName] = new EasyMDE({
                                    element: document.getElementById($(this).attr("name")),
                                    initialValue: $(this).text(),
                                });
                                break;
                            default:
                                let name = $(this).attr("name");
                                let content = $(this).data('content')
                                let editorOption = {
                                    initialFrameWidth: '100%',
                                    initialFrameHeight: 420,
                                    initialContent: content,
                                    toolbars: [['fullscreen', 'source', '|', 'undo', 'redo', '|',
                                        'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
                                        'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                                        'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
                                        'directionalityltr', 'directionalityrtl', 'indent', '|',
                                        'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
                                        'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
                                        'insertimage', 'emotion', 'scrawl', 'insertvideo', 'music', 'attachment', 'map', 'gmap', 'insertframe', 'insertcode', 'webapp', 'pagebreak', 'template', 'background', '|',
                                        'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|',
                                        'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
                                        'print', 'preview', 'searchreplace', 'help', 'drafts']
                                    ],
                                }
                                setTimeout(function () {
                                    let _UEditor = new baidu.editor.ui.Editor(editorOption);
                                    _UEditor.render(name);
                                }, 100)
                                break;
                        }
                    });
                }
            },
            select: function () {
                var selectList = document.querySelectorAll("[data-select]");
                $.each(selectList, function (i, v) {
                    var url = $(this).attr('data-select'),
                        selectFields = $(this).attr('data-fields'),
                        value = $(this).attr('data-value'),
                        that = this,
                        html = '<option value=""></option>';
                    var fields = selectFields.replace(/\s/g, "").split(',');
                    if (fields.length !== 2) {
                        return admin.msg.error('下拉选择字段有误');
                    }
                    admin.request.get(
                        {
                            url: url,
                            data: {
                                selectFields: selectFields
                            },
                        }, function (res) {
                            var list = res.data;
                            list.forEach(val => {
                                var key = val[fields[0]];
                                if (value !== undefined && key.toString() === value) {
                                    html += '<option value="' + key + '" selected="">' + val[fields[1]] + '</option>';
                                } else {
                                    html += '<option value="' + key + '">' + val[fields[1]] + '</option>';
                                }
                            });
                            $(that).html(html);
                            form.render();
                        }
                    );
                });

                let switchSelectList = document.querySelectorAll("[data-show]");
                $.each(switchSelectList, function (i, v) {
                    let _show = $(this).attr('data-show');
                    if (_show === 'switchSelect') {
                        let _data = $(this).attr('data-list');
                        let _value = $(this).attr('data-value') || ''
                        let _target = $(this).attr('data-target') || ''
                        let _name = $(this).attr('data-name') || ''
                        try {
                            new switchSelect({
                                elem: $(this), data: JSON.parse(_data), default: _value, target: _target, name: _name
                            });
                        } catch (e) {
                            console.error(e)
                        }
                    }
                });
            },
            date: function () {
                var dateList = document.querySelectorAll("[data-date]");
                if (dateList.length > 0) {
                    $.each(dateList, function (i, v) {
                        var format = $(this).attr('data-date'),
                            type = $(this).attr('data-date-type'),
                            range = $(this).attr('data-date-range');
                        if (type === undefined || type === '' || type === null) {
                            type = 'datetime';
                        }
                        var options = {
                            elem: this,
                            type: type,
                        };
                        if (format !== undefined && format !== '' && format !== null) {
                            options['format'] = format;
                        }
                        if (range !== undefined) {
                            if (range === null || range === '') {
                                range = '-';
                            }
                            options['range'] = range;
                        }
                        laydate.render(options);
                    });
                }
            },
        },
        ai: {
            chat: function (content, options, cancel) {
                let id = 'chat_' + (new Date()).getTime()
                layer.open({
                    'title': options?.title || 'AI建议',
                    type: 1,
                    area: options?.area || (admin.checkMobile() ? ['95%', '60%'] : ['50%', '60%']),
                    shade: options?.shade || 0,
                    shadeClose: options?.shadeClose || false,
                    scrollbar: options?.scrollbar || false,
                    maxmin: options?.maxmin || true,
                    anim: options?.anim || 0,
                    content: `<div style="padding: 20px;white-space: pre-wrap;" id="${id}"></div>`,
                    success: function (layero, index) {
                        let elem = document.getElementById(id)
                        if (options?.stream) {
                            let index = 0;
                            let lastTime = performance.now();
                            const interval = options.interval || 100;

                            function typeCharacter(currentTime) {
                                if (index < content.length) {
                                    if (currentTime - lastTime >= interval) {
                                        elem.innerHTML += content.charAt(index);
                                        index++;
                                        lastTime = currentTime;
                                        elem.scrollIntoView({behavior: "smooth", block: "end"});
                                    }
                                    requestAnimationFrame(typeCharacter);
                                }
                            }

                            requestAnimationFrame(typeCharacter);
                        } else {
                            content = content.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>')
                            setTimeout(() => {
                                elem.innerHTML = content
                            }, 100)
                        }
                    },
                    cancel: function (index, layero) {
                        cancel()
                    }
                })
            },
        },
    };

    return admin;
});
