<?php

namespace app\admin\model;

use app\admin\service\SystemLogService;
use app\common\model\TimeModel;
use think\model\relation\BelongsTo;

class SystemLog extends TimeModel
{

    protected array $type = [
        'content'  => 'json',
        'response' => 'json',
    ];

    protected function init(): void
    {
        SystemLogService::instance()->detectTable();
    }


    public function admin(): BelongsTo
    {
        return $this->belongsTo('app\admin\model\SystemAdmin', 'admin_id', 'id');
    }


}