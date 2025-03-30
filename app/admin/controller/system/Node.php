<?php

namespace app\admin\controller\system;

use app\admin\model\SystemNode;
use app\admin\service\TriggerService;
use app\common\controller\AdminController;
use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use app\admin\service\NodeService;
use app\Request;
use think\App;
use think\db\exception\DataNotFoundException;
use think\db\exception\DbException;
use think\db\exception\ModelNotFoundException;
use think\response\Json;

#[ControllerAnnotation(title: '系统节点管理')]
class Node extends AdminController
{

    public function __construct(App $app)
    {
        parent::__construct($app);
        self::$model = SystemNode::class;
    }

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        if ($request->isAjax()) {
            if (input('selectFields')) {
                return $this->selectList();
            }
            $count = self::$model::count();
            $list  = self::$model::getNodeTreeList();
            $data  = [
                'code'  => 0,
                'msg'   => '',
                'count' => $count,
                'data'  => $list,
            ];
            return json($data);
        }
        return $this->fetch();
    }

    #[NodeAnnotation(title: '系统节点更新', auth: true)]
    public function refreshNode($force = 0): void
    {

        $this->checkPostRequest();
        $nodeList = (new NodeService())->getNodeList();
        empty($nodeList) && $this->error('暂无需要更新的系统节点');

        try {
            if ($force == 1) {
                $updateNodeList = self::$model::whereIn('node', array_column($nodeList, 'node'))->select();
                $formatNodeList = array_format_key($nodeList, 'node');
                foreach ($updateNodeList as $vo) {
                    isset($formatNodeList[$vo['node']])
                    && self::$model::where('id', $vo['id'])->update(
                        [
                            'title'   => $formatNodeList[$vo['node']]['title'],
                            'is_auth' => $formatNodeList[$vo['node']]['is_auth'],
                        ]
                    );
                }
            }
            $existNodeList = self::$model::field('node,title,type,is_auth')->select();
            foreach ($nodeList as $key => $vo) {
                foreach ($existNodeList as $v) {
                    if ($vo['node'] == $v->node) {
                        unset($nodeList[$key]);
                        break;
                    }
                }
            }
            if (!empty($nodeList)) {
                (new self::$model)->saveAll($nodeList);
                TriggerService::updateNode();
            }
        }catch (\Exception $e) {
            $this->error('节点更新失败');
        }
        $this->success('节点更新成功');
    }

    #[NodeAnnotation(title: '清除失效节点', auth: true)]
    public function clearNode(): void
    {
        $this->checkPostRequest();
        $nodeList = (new NodeService())->getNodeList();
        try {
            $existNodeList  = self::$model::field('id,node,title,type,is_auth')->select()->toArray();
            $formatNodeList = array_format_key($nodeList, 'node');
            foreach ($existNodeList as $vo) {
                !isset($formatNodeList[$vo['node']]) && self::$model::where('id', $vo['id'])->delete();
            }
            TriggerService::updateNode();
        }catch (\Exception $e) {
            $this->error('节点更新失败');
        }
        $this->success('节点更新成功');
    }
}