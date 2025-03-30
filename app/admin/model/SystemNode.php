<?php

namespace app\admin\model;

use app\common\model\TimeModel;

class SystemNode extends TimeModel
{

    public static function getNodeTreeList(): array
    {
        $list = self::select()->toArray();
        return self::buildNodeTree($list);
    }

    protected static function buildNodeTree($list): array
    {
        $newList      = [];
        $repeatString = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        foreach ($list as $vo) {
            if ($vo['type'] == 1) {
                $newList[] = $vo;
                foreach ($list as $v) {
                    if ($v['type'] == 2 && str_contains($v['node'], $vo['node'] . '/')) {
                        $v['node'] = "{$repeatString}├{$repeatString}" . $v['node'];
                        $newList[] = $v;
                    }
                }
            }
        }
        return $newList;
    }


}