<?php

namespace app\admin\traits;

use app\admin\service\annotation\NodeAnnotation;
use app\admin\service\tool\CommonTool;
use app\Request;
use think\db\exception\PDOException;
use think\facade\Db;
use think\response\Json;

/**
 * 后台CURD复用
 * Trait Curd
 * @package app\admin\traits
 */
trait Curd
{

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        if ($request->isAjax()) {
            if (input('selectFields')) {
                return $this->selectList();
            }
            list($page, $limit, $where) = $this->buildTableParams();
            $count = $this->model->where($where)->count();
            $list  = $this->model->where($where)->page($page, $limit)->order($this->sort)->select()->toArray();
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

    #[NodeAnnotation(title: '添加', auth: true)]
    public function add(Request $request): string
    {
        if ($request->isPost()) {
            $post = $request->post();
            $rule = [];
            $this->validate($post, $rule);
            try {
                Db::transaction(function() use ($post, &$save) {
                    $save = $this->model->strict(false)->insert($post);
                });
            }catch (\Exception $e) {
                $this->error('新增失败:' . $e->getMessage());
            }
            $save ? $this->success('新增成功') : $this->error('新增失败');
        }
        return $this->fetch();
    }

    #[NodeAnnotation(title: '编辑', auth: true)]
    public function edit(Request $request, $id = 0): string
    {
        $row = $this->model->find($id);
        empty($row) && $this->error('数据不存在');
        if ($request->isPost()) {
            $post = $request->post();
            $rule = [];
            $this->validate($post, $rule);
            try {
                Db::transaction(function() use ($post, $row, &$save) {
                    $save = $row->save($post);
                });
            }catch (\Exception $e) {
                $this->error('保存失败');
            }
            $save ? $this->success('保存成功') : $this->error('保存失败');
        }
        $this->assign('row', $row);
        return $this->fetch();
    }

    #[NodeAnnotation(title: '删除', auth: true)]
    public function delete(Request $request): void
    {
        // 如果不是id作为主键 请在对应的控制器中覆盖重写
        $id = $request->param('id', []);
        $this->checkPostRequest();
        $row = $this->model->whereIn('id', $id)->select();
        $row->isEmpty() && $this->error('数据不存在');
        try {
            $save = $row->delete();
        }catch (\Exception $e) {
            $this->error('删除失败');
        }
        $save ? $this->success('删除成功') : $this->error('删除失败');
    }

    #[NodeAnnotation(title: '导出', auth: true)]
    public function export()
    {
        if (env('EASYADMIN.IS_DEMO', false)) {
            $this->error('演示环境下不允许操作');
        }
        list($page, $limit, $where) = $this->buildTableParams();
        $tableName = $this->model->getName();
        $tableName = CommonTool::humpToLine(lcfirst($tableName));
        $prefix    = $this->model->getConfig('prefix');
        $dbList    = Db::connect($this->model->getConnection())->query("show full columns from {$prefix}{$tableName}");
        $header    = [];
        foreach ($dbList as $vo) {
            $comment = !empty($vo['Comment']) ? $vo['Comment'] : $vo['Field'];
            if (!in_array($vo['Field'], $this->noExportFields)) {
                $header[] = [$comment, $vo['Field']];
            }
        }
        $list = $this->model->where($where)
            ->limit(100000)
            ->order($this->sort)
            ->select()
            ->toArray();
        try {
            exportExcel($header, $list);
        }catch (\Throwable $exception) {
            $this->error('导出失败: ' . $exception->getMessage() . PHP_EOL . $exception->getFile() . PHP_EOL . $exception->getLine());
        }
    }

    #[NodeAnnotation(title: '属性修改', auth: true)]
    public function modify(Request $request): void
    {
        $this->checkPostRequest();
        $post = $request->post();
        $rule = [
            'id|ID'      => 'require',
            'field|字段' => 'require',
            'value|值'   => 'require',
        ];
        $this->validate($post, $rule);
        $row = $this->model->find($post['id']);
        if (!$row) {
            $this->error('数据不存在');
        }
        if (!in_array($post['field'], $this->allowModifyFields)) {
            $this->error('该字段不允许修改：' . $post['field']);
        }
        try {
            Db::transaction(function() use ($post, $row) {
                $row->save([
                               $post['field'] => $post['value'],
                           ]);
            });
        }catch (\Exception $e) {
            $this->error($e->getMessage());
        }
        $this->success('保存成功');
    }

    #[NodeAnnotation(title: '回收站', auth: true)]
    public function recycle(Request $request): Json|string
    {
        if (!$request->isAjax()) {
            return $this->fetch();
        }
        $id              = $request->param('id', []);
        $type            = $request->param('type', '');
        $deleteTimeField = $this->model->getOption('deleteTime'); // 获取软删除字段
        $defaultErrorMsg = 'Model 中未设置软删除 deleteTime 对应字段 或 数据表中不存在该字段';
        if (!$deleteTimeField) $this->success($defaultErrorMsg);
        switch ($type) {
            case 'restore':
                $this->model->withTrashed()->whereIn('id', $id)->strict(false)->update([$deleteTimeField => null, 'update_time' => time()]);
                $this->success('success');
                break;
            case 'delete':
                $this->model->destroy($id, true);
                $this->success('success');
                break;
            default:
                list($page, $limit, $where) = $this->buildTableParams();
                try {
                    $count = $this->model->withTrashed()->where($where)->whereNotNull($deleteTimeField)->count();
                    $list  = $this->model->withTrashed()->where($where)->page($page, $limit)->order($this->sort)->whereNotNull($deleteTimeField)->select()->toArray();
                    $data  = [
                        'code'  => 0,
                        'msg'   => '',
                        'count' => $count,
                        'data'  => $list,
                    ];
                } catch (\Throwable $e) {
                    $error = $e->getMessage();
                    if ($e instanceof PDOException) $error .= '<br>' . $defaultErrorMsg;
                    $data = [
                        'code'  => -1,
                        'msg'   => $error,
                        'count' => 0,
                        'data'  => [],
                    ];
                }
                return json($data);
        }

    }
}
