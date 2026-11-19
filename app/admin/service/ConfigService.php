<?php

namespace app\admin\service;

class ConfigService
{

    public static function getVersion()
    {
        // 直接复用 sysConfig 的 tag 缓存，配置更新时可通过 TriggerService::updateSysConfig() 统一失效
        return sysConfig('site', 'site_version') ?: '';
    }

}