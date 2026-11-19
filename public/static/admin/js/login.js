define(["jquery", "easy-admin"], function ($, ea) {

    return {
        index: function () {
            if (top.location !== self.location) {
                top.location = self.location;
            }
            $(function () {
                if (typeof backgroundUrl !== 'undefined' && backgroundUrl) {
                    $('body').css('background', 'url(' + backgroundUrl + ') 0% 0% / cover no-repeat')
                }
                $('.bind-password').on('click', function () {
                    if ($(this).hasClass('icon-5')) {
                        $(this).removeClass('icon-5');
                        $("input[name='password']").attr('type', 'password');
                    } else {
                        $(this).addClass('icon-5');
                        $("input[name='password']").attr('type', 'text');
                    }
                });

                $('.icon-nocheck').on('click', function () {
                    if ($(this).hasClass('icon-check')) {
                        $(this).removeClass('icon-check');
                    } else {
                        $(this).addClass('icon-check');
                    }
                });

                $('body').on('click', '.lt-eye', function () {
                    let input = $(this).siblings('input');
                    let show = input.attr('type') === 'password';
                    input.attr('type', show ? 'text' : 'password');
                    $(this).find('i').toggleClass('fa-eye', !show).toggleClass('fa-eye-slash', show);
                });

                document.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter' || event.keyCode === 13) {
                        $('.login-btn').trigger('click')
                    }
                });

                $('.login-tip').on('click', function () {
                    $('.icon-nocheck').click();
                });

                ea.listen(function (data) {
                    let checkbox = $('.icon-nocheck');
                    data['keep_login'] = checkbox.hasClass('icon-check') || checkbox.prop('checked') ? 1 : 0;
                    return data;
                }, function (res) {
                    ea.msg.success(res.msg, function () {
                        window.location = ea.url('index');
                    })
                }, function (res) {
                    let data = res.data
                    if (data?.is_ga_code || false) {
                        let elem = $('#gaCode')
                        elem.removeClass('layui-hide');
                        elem.find('input').focus()
                    }
                    ea.msg.error(res.msg, function () {
                        $('#refreshCaptcha').trigger("click");
                    });
                });
            });
        },
    };
});
