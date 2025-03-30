<?php

namespace app\common\model;

use think\Model;
use think\model\concern\SoftDelete;

/**
 * 有关时间的模型
 * Class TimeModel
 * @package app\common\model
 */
class TimeModel extends Model
{

    /**
     * 软删除
     */
    use SoftDelete;

    protected function getOptions(): array
    {
        return [
            'autoWriteTimestamp' => true,
            'createTime'         => 'create_time',
            'updateTime'         => 'update_time',
            'deleteTime'         => false,
        ];
    }


}