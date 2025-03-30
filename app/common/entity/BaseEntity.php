<?php

namespace app\common\entity;

use think\Entity;
use think\model\type\DateTime;

class BaseEntity extends Entity
{

    protected function getOptions(): array
    {
        return [
            'type' => [
                'create_time' => DateTime::class,
                'update_time' => DateTime::class,
                'delete_time' => DateTime::class,
            ],
        ];
    }

}