define(["jquery", "easy-admin"], function ($, ea) {

    var form = layui.form;

    return {
        index: function () {
            var _group = 'site'
            let tabs = layui.tabs
            var TABS_ID = 'docDemoTabBrief';
            tabs.on(`afterChange(${TABS_ID})`, function (data) {
                _group = $(this).data('group')
            })
            let _upload_type = upload_type || 'local'
            $('.upload_type').addClass('layui-hide')
            $('.' + _upload_type).removeClass('layui-hide')

            form.on("radio(upload_type)", function (data) {
                _upload_type = this.value;
                $('.upload_type').addClass('layui-hide')
                $('.' + _upload_type).removeClass('layui-hide')
            });

            form.on("submit", function (data) {
                data.field['group'] = _group
            });

            ea.listen('', function (res) {
                ea.msg.success(res.msg);
            }, function (err) {
                ea.msg.error(err.msg);
            });
        }
    };
});