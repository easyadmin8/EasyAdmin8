<?php

namespace app\admin\model;

use app\common\model\TimeModel;
use think\db\exception\DataNotFoundException;
use think\db\exception\DbException;
use think\db\exception\ModelNotFoundException;

class SystemAuth extends TimeModel
{

    protected function getOptions(): array
    {
        return [
            'deleteTime' => 'delete_time',
        ];
    }

    /**
     * 根据角色ID获取授权节点
     * @param $authId
     * @return array
     * @throws DataNotFoundException
     * @throws DbException
     * @throws ModelNotFoundException
     */
    public static function getAuthorizeNodeListByAdminId($authId): array
    {
        $checkNodeList = (new SystemAuthNode())
            ->where('auth_id', $authId)
            ->column('node_id');
        $systemNode    = new SystemNode();
        $nodeList      = $systemNode
            ->where('is_auth', 1)
            ->field('id,node,title,type,is_auth')
            ->select()
            ->toArray();
        $newNodeList   = [];
        foreach ($nodeList as $vo) {
            if ($vo['type'] == 1) {
                $vo            = array_merge($vo, ['field' => 'node', 'spread' => true]);
                $vo['checked'] = false;
                $vo['title']   = "{$vo['title']}【{$vo['node']}】";
                $children      = [];
                foreach ($nodeList as $v) {
                    if ($v['type'] == 2 && strpos($v['node'], $vo['node'] . '/') !== false) {
                        $v            = array_merge($v, ['field' => 'node', 'spread' => true]);
                        $v['checked'] = in_array($v['id'], $checkNodeList) ? true : false;
                        $v['title']   = "{$v['title']}【{$v['node']}】";
                        $children[]   = $v;
                    }
                }
                !empty($children) && $vo['children'] = $children;
                $newNodeList[] = $vo;
            }
        }
        return $newNodeList;
    }

}