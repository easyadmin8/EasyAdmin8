<?php

namespace app\admin\model;

use app\common\model\TimeModel;

class SystemIpWhite extends TimeModel
{

    protected function getOptions(): array
    {
        return [
            'deleteTime' => "delete_time",
        ];
    }

    public array $notes = [
        'status' => [
            1 => '启用',
            2 => '禁用',
        ],
    ];

}