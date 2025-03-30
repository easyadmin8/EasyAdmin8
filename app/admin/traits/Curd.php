<?php

namespace app\admin\traits;

use app\admin\service\annotation\NodeAnnotation;
use app\admin\service\tool\CommonTool;
use app\Request;
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
            $count = self::$model::where($where)->count();
            $list  = self::$model::where($where)->page($page, $limit)->order($this->sort)->select()->toArray();
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
                    $save = self::$model::create($post);
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
        $row = self::$model::find($id);
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
        $row = self::$model::whereIn('id', $id)->select();
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
        $tableName = (new self::$model)->getName();
        $tableName = CommonTool::humpToLine(lcfirst($tableName));
        $prefix    = config('database.connections.mysql.prefix');
        $dbList    = Db::query("show full columns from {$prefix}{$tableName}");
        $header    = [];
        foreach ($dbList as $vo) {
            $comment = !empty($vo['Comment']) ? $vo['Comment'] : $vo['Field'];
            if (!in_array($vo['Field'], $this->noExportFields)) {
                $header[] = [$comment, $vo['Field']];
            }
        }
        $list = self::$model::where($where)
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
        $row = self::$model::find($post['id']);
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

}
