<?php

namespace app\admin\model;


use app\common\model\TimeModel;

class SystemAdmin extends TimeModel
{

    protected function getOptions(): array
    {
        return [
            'deleteTime' => 'delete_time',
        ];
    }

    public array $notes = [
        'login_type' => [
            1 => '密码登录',
            2 => '密码 + 谷歌验证码登录'
        ],
    ];

    public static function getAuthIdsAttr($value): array
    {
        if (!$value) return [];
        return explode(',', $value);
    }

    public static function getAuthList(): array
    {
        return SystemAuth::where('status', 1)->column('title', 'id');
    }

}