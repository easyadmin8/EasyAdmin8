<?php

namespace app\admin\service;

use app\admin\model\SystemIpWhite;
use think\facade\Cache;

class IpService
{

    public static function whiteCheck(?string $ip = null): bool
    {
        if (empty($ip)) {
            // 如果使用了cdn服务 需要自行获取真实IP
            $ip = request()->ip();
        }
        $key      = 'ip:white:list';
        $ruleList = Cache::get($key);
        if (empty($ruleList)) {
            $ruleList = SystemIpWhite::where('status', 1)->column('ip');
            Cache::set($key, $ruleList, 3600);
        }
        $pass = false;
        foreach ($ruleList as $rule) {
            if (fnmatch($rule, $ip)) {
                $pass = true;
                break;
            }
        }
        return $pass;
    }

}