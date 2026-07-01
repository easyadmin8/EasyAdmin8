define(["jquery", "easy-admin"], function ($, ea) {

    let init = {
        analyze_url: 'system.logAnalyzer/analyze',
        diagnose_url: 'system.logAnalyzer/diagnose',
        getLogFiles_url: 'system.logAnalyzer/getLogFiles',
        loadMultipleLogs_url: 'system.logAnalyzer/loadMultipleLogs',
    };

    let selectedFiles = [];
    let treeObj = null;

    function showResult(html) {
        $('#analysisResult').html(html);
    }

    function updateSelection() {
        selectedFiles = [];
        if (treeObj) {
            let checkedNodes = treeObj.getCheckedNodes(true);
            $.each(checkedNodes, function (index, node) {
                if (node.isFile) {
                    selectedFiles.push(node.relative_path);
                }
            });
        }
        $('#selectedCount').text(selectedFiles.length);
        // $('#analyzeBtn,#diagnoseBtn').prop('disabled', selectedFiles.length === 0);
    }

    function convertToZTreeData(directories, parentId) {
        let treeData = [];
        let idCounter = parentId || 0;

        $.each(directories, function (index, dir) {
            idCounter++;
            let node = {
                id: idCounter,
                pId: parentId || 0,
                name: dir.name,
                open: parentId === 0,
                isFile: false,
                icon: '/static/plugs/zTree/img/diy/1_open.png',
                iconOpen: '/static/plugs/zTree/img/diy/1_open.png',
                iconClose: '/static/plugs/zTree/img/diy/1_close.png'
            };

            if (dir.relative_path) {
                node.relative_path = dir.relative_path;
            }

            treeData.push(node);

            // 添加文件节点
            if (dir.files && dir.files.length) {
                $.each(dir.files, function (fIndex, file) {
                    idCounter++;
                    treeData.push({
                        id: idCounter,
                        pId: node.id,
                        name: file.name + ' (' + file.size_format + ')',
                        open: false,
                        isFile: true,
                        relative_path: file.relative_path,
                        icon: '/static/plugs/zTree/img/diy/2.png'
                    });
                });
            }

            // 递归处理子目录
            if (dir.children && dir.children.length) {
                let childrenData = convertToZTreeData(dir.children, node.id);
                treeData = treeData.concat(childrenData);
                idCounter = parseInt(childrenData[childrenData.length - 1].id);
            }
        });

        return treeData;
    }

    function loadLogs() {
        $.ajax({
            url: ea.url(init.getLogFiles_url),
            type: 'GET',
            dataType: 'json',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            success: function (res) {
                if (res.code === 1 && res.data && res.data.directories) {
                    let setting = {
                        check: {
                            enable: true,
                            chkStyle: "checkbox",
                            chkboxType: {"Y": "ps", "N": "ps"}
                        },
                        view: {
                            showIcon: true,
                            showLine: true,
                            selectedMulti: false,
                            dblClickExpand: true,
                            expandSpeed: "fast"
                        },
                        data: {
                            simpleData: {
                                enable: true,
                                idKey: "id",
                                pIdKey: "pId",
                                rootPId: 0
                            }
                        },
                        callback: {
                            onCheck: function (event, treeId, treeNode) {
                                updateSelection();
                            }
                        }
                    };

                    let treeData = convertToZTreeData(res.data.directories, 0);
                    $.fn.zTree.init($("#logTree"), setting, treeData);
                    treeObj = $.fn.zTree.getZTreeObj("logTree");

                    // 添加自定义样式增强层次感
                    $("#logTree").addClass("log-tree");

                } else {
                    $('#logTree').html('<div style="text-align:center;color:#999;padding:50px;"><i class="layui-icon layui-icon-face-cry" style="font-size:30px;"></i><p style="margin-top:10px;">' + (res.msg || '加载失败') + '</p></div>');
                }
            },
            error: function (error) {
                $('#logTree').html('<div style="text-align:center;color:#999;padding:50px;"><i class="layui-icon layui-icon-face-cry" style="font-size:30px;"></i><p style="margin-top:10px;">请求失败</p></div>');
            }
        });
    }

    return {
        index: function () {
            loadLogs();

            $('#refreshFiles').click(loadLogs);

            $('#analyzeBtn').click(function () {
                if (selectedFiles.length === 0) return layer.msg('请选择日志文件', {icon: 0});
                $('#loadingMask').hide();
                let maxLines = parseInt($('#maxLines').val()) || 500;
                ea.request.get({
                    url: ea.url(init.loadMultipleLogs_url),
                    data: {file_names: selectedFiles, max_lines: maxLines},
                }, function (res) {
                    if (res.code !== 1) {
                        ea.msg.error(res.msg);
                        return;
                    }
                    $('#loadingMask').show();
                    $('#analyzeBtn').prop('disabled', true);
                    showResult('<div style="text-align:center;padding:150px 0;"><i class="layui-icon layui-icon-loading-1 layui-anim layui-anim-rotate layui-anim-loop" style="font-size:48px;"></i><p style="margin-top:20px;">正在分析中...</p></div>');
                    ea.request.post({
                        url: ea.url(init.analyze_url),
                        data: {type: $('#analysisType').val()}
                    }, function (res2) {
                        $('#loadingMask').hide();
                        $('#analyzeBtn').prop('disabled', false);
                        if (res.code !== 1) {
                            ea.msg.error(res.msg);
                            return;
                        }
                        showResult('<div class="markdown-body"><div style="background:#e8f4fd;padding:10px;border-radius:8px;margin-bottom:15px;font-size:1rem;color:#666;">已加载 ' + res.data.metadata.total_files + ' 个文件，共 ' + res.data.metadata.total_lines + ' 行</div>' + marked.parse(res2.data.analysis) + '</div>');
                        layer.msg('分析完成', {icon: 1});
                    }, function (err2) {
                        $('#loadingMask').hide();
                        $('#analyzeBtn').prop('disabled', false);
                        ea.msg.error(err2.msg);
                    }, function (ex) {
                        $('#loadingMask').hide();
                        $('#analyzeBtn').prop('disabled', false);
                        console.log(ex)
                    });
                }, function (err) {
                    $('#loadingMask').hide();
                    $('#analyzeBtn').prop('disabled', false);
                    ea.msg.error(err.msg);
                }, function (ex) {
                    $('#loadingMask').hide();
                    $('#analyzeBtn').prop('disabled', false);
                    ea.msg.error(ex.message);
                });
            });

            ea.listen();
        },

        realtime: function () {
            ea.listen();

            function show(content) {
                $('#realtimeResult').html('<pre style="white-space:pre-wrap;word-wrap:break-word;font-size:14px;line-height:1.8;">' + content + '</pre>');
            }

            show('加载中...');
            ea.request.get({url: ea.url('system.logAnalyzer/realtime'), data: {type: 'summary'}}, function (res) {
                show(res.data.summary || res.data.analysis || '暂无数据');
            });

            $('#refreshBtn').click(function () {
                let btn = $(this).prop('disabled', true).html('<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate"></i> 刷新中');
                show('刷新中...');
                ea.request.get({url: ea.url('system.logAnalyzer/realtime'), data: {type: 'summary'}}, function (res) {
                    btn.prop('disabled', false).html('<i class="layui-icon layui-icon-refresh"></i> 刷新');
                    show(res.data.summary || res.data.analysis || '暂无数据');
                });
            });
        },
    };
});
