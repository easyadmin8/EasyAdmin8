<?php

namespace app\admin\model;

use app\common\constants\MenuConstant;
use app\common\model\TimeModel;
use think\db\exception\DataNotFoundException;
use think\db\exception\DbException;
use think\db\exception\ModelNotFoundException;

class SystemMenu extends TimeModel
{
    protected function getOptions(): array
    {
        return [
            'deleteTime' => 'delete_time',
        ];
    }


    /**
     * @throws ModelNotFoundException
     * @throws DbException
     * @throws DataNotFoundException
     */
    public static function getPidMenuList(): array
    {
        $list = self::field('id,pid,title')->where([
            ['pid', '<>', MenuConstant::HOME_PID],
            ['status', '=', 1],
        ])->select()->toArray();

        $pidMenuList = self::buildPidMenu(0, $list);
        return array_merge([[
            'id'    => 0,
            'pid'   => 0,
            'title' => '顶级菜单',
        ]], $pidMenuList);
    }

    protected static function buildPidMenu($pid, $list, $level = 0): array
    {
        $newList = [];
        foreach ($list as $vo) {
            if ($vo['pid'] == $pid) {
                $level++;
                foreach ($newList as $v) {
                    if ($vo['pid'] == $v['pid'] && isset($v['level'])) {
                        $level = $v['level'];
                        break;
                    }
                }
                $vo['level'] = $level;
                if ($level > 1) {
                    $repeatString = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    $markString   = str_repeat("{$repeatString}├{$repeatString}", $level - 1);
                    $vo['title']  = $markString . $vo['title'];
                }
                $newList[] = $vo;
                $childList = self::buildPidMenu($vo['id'], $list, $level);
                !empty($childList) && $newList = array_merge($newList, $childList);
            }

        }
        return $newList;
    }

}