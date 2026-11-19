<?php

namespace app\admin\model;


use app\common\model\TimeModel;

class MallCate extends TimeModel
{

    protected function getOptions(): array
    {
        return array_merge(parent::getOptions(), [
            'deleteTime' => 'delete_time',
        ]);
    }

}