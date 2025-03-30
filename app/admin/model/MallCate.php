<?php

namespace app\admin\model;


use app\common\model\TimeModel;

class MallCate extends TimeModel
{

    protected function getOptions(): array
    {
        return [
            'deleteTime' => 'delete_time',
        ];
    }

}