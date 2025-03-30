<?php

declare(strict_types = 1);

namespace app\common\utils;

class Helper
{

    /**
     * 获取当前IP地址
     * @return string
     */
    public static function getIp(): string
    {
        return request()->ip();
    }

    /**
     * 获取当前登录用户ID
     * @return int|string
     */
    public static function getAdminUid(): int|string
    {
        return session('admin.id') ?: 0;
    }

}