layui.define(['table'], function (exports) {
    let $ = layui.jquery;
    let table = layui.table;
    let originRender = table.render;

    table.render = function (options) {
        if (!options.page) {
            return originRender.call(this, options);
        }

        let originDone = options.done;

        options.done = function (res, curr, count) {
            if (typeof originDone === 'function') {
                originDone.call(this, res, curr, count);
            }

            setTimeout(function () {
                try {
                    let $view = $(options.elem).next('.layui-table-view');
                    if (!$view.length) return;

                    let $bottomPage = $view.children('.layui-table-page');
                    if (!$bottomPage.length) return;

                    $view.children('.layui-table-page-top').remove();

                    let $topPage = $bottomPage.clone(false);
                    $topPage.addClass('layui-table-page-top');
                    $view.prepend($topPage);

                    $topPage.on('click', 'li', function () {
                        $bottomPage.find('li').eq($(this).index()).trigger('click');
                    });

                    $topPage.on('change', 'select', function () {
                        $bottomPage.find('select').val(this.value).trigger('change');
                    });

                    $topPage.on('keydown', 'input[type="number"]', function (e) {
                        if (e.keyCode === 13) {
                            let i = $topPage.find('input[type="number"]').index(this);
                            $bottomPage.find('input[type="number"]').eq(i).val(this.value).trigger('keydown');
                        }
                    });
                } catch (e) {
                }
            }, 0);
        };

        return originRender.call(this, options);
    };

    layui.link('../tablePageTop/tablePageTop.css');

    exports('tablePageTop', {});
});
