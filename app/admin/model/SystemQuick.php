<?php

namespace app\admin\model;

use app\common\model\TimeModel;

class SystemQuick extends TimeModel
{

    protected function getOptions(): array
    {
        return array_merge(parent::getOptions(), [
            'deleteTime' => 'delete_time',
        ]);
    }

}