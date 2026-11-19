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
        return array_merge(parent::getOptions(), [
            'deleteTime' => 'delete_time',
        ]);
    }


    /**
     * @throws ModelNotFoundException
     * @throws DbException
     * @throws DataNotFoundException
     */
    public function getPidMenuList(): array
    {
        $list = self::field('id,pid,title')->where([
                                                       ['pid', '<>', MenuConstant::HOME_PID],
                                                       ['status', '=', 1],
                                                   ])->select()->toArray();

        $pidMenuList = self::buildPidMenu(0, $list);
        return array_merge([[
                                'id'            => 0,
                                'pid'           => 0,
                                'title'         => '顶级菜单',
                                'title_display' => '顶级菜单',
                            ]], $pidMenuList);
    }

    protected static function buildPidMenu($pid, $list, $level = 0, array $visited = []): array
    {
        $newList = [];
        foreach ($list as $vo) {
            if ($vo['pid'] != $pid) continue;
            $nodeId = (int)$vo['id'];
            // 防止异常数据形成环导致无限递归
            if (isset($visited[$nodeId])) continue;
            $nextVisited          = $visited;
            $nextVisited[$nodeId] = true;

            $level++;
            foreach ($newList as $v) {
                if ($vo['pid'] == $v['pid'] && isset($v['level'])) {
                    $level = $v['level'];
                    break;
                }
            }
            $vo['level'] = $level;
            // title_display 用于模板 raw 输出，标题本身已转义，拼入的分隔符是安全的
            $titleDisplay = htmlspecialchars((string)$vo['title'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            if ($level > 1) {
                $repeatString = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                $markString   = str_repeat("{$repeatString}├{$repeatString}", $level - 1);
                $vo['title']  = $markString . $vo['title'];
            }
            $vo['title_display'] = $level > 1 ? str_repeat("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", $level - 1) . $titleDisplay : $titleDisplay;
            $newList[] = $vo;
            $childList = self::buildPidMenu($vo['id'], $list, $level, $nextVisited);
            !empty($childList) && $newList = array_merge($newList, $childList);
        }
        return $newList;
    }

}