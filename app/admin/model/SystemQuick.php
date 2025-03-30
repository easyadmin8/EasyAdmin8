<?php

namespace app\admin\model;

use app\common\model\TimeModel;

class SystemQuick extends TimeModel
{

    protected function getOptions(): array
    {
        return [
            'deleteTime' => 'delete_time',
        ];
    }

}