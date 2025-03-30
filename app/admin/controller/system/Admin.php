<?php

namespace app\admin\controller\system;

use app\admin\model\SystemAdmin;
use app\admin\service\TriggerService;
use app\common\constants\AdminConstant;
use app\common\controller\AdminController;
use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use app\Request;
use think\App;
use think\response\Json;

#[ControllerAnnotation(title: '管理员管理')]
class Admin extends AdminController
{

    protected array $sort = [
        'sort' => 'desc',
        'id'   => 'desc',
    ];

    public function __construct(App $app)
    {
        parent::__construct($app);
        self::$model = SystemAdmin::class;
        $this->assign('auth_list', self::$model::getAuthList());
    }

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        if ($request->isAjax()) {
            if (input('selectFields')) {
                return $this->selectList();
            }
            list($page, $limit, $where) = $this->buildTableParams();
            $count = self::$model::where($where)->count();
            $list  = self::$model::withoutField('password')
                ->where($where)
                ->page($page, $limit)
                ->order($this->sort)
                ->select()->toArray();
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
            $post             = $request->post();
            $authIds          = $request->post('auth_ids', []);
            $post['auth_ids'] = implode(',', array_keys($authIds));
            $rule             = [];
            $this->validate($post, $rule);
            if (empty($post['password'])) $post['password'] = '123456';
            $post['password'] = password($post['password']);
            try {
                $save = self::$model::create($post);
            }catch (\Exception $e) {
                $this->error('保存失败' . $e->getMessage());
            }
            $save ? $this->success('保存成功') : $this->error('保存失败');
        }
        return $this->fetch();
    }

    #[NodeAnnotation(title: '编辑', auth: true)]
    public function edit(Request $request, $id = 0): string
    {
        $row = self::$model::find($id);
        empty($row) && $this->error('数据不存在');
        if ($request->isPost()) {
            $post             = $request->post();
            $authIds          = $request->post('auth_ids', []);
            $post['auth_ids'] = implode(',', array_keys($authIds));
            $rule             = [];
            $this->validate($post, $rule);
            try {
                $save = $row->save($post);
                TriggerService::updateMenu($id);
            }catch (\Exception $e) {
                $this->error('保存失败' . $e->getMessage());
            }
            $save ? $this->success('保存成功') : $this->error('保存失败');
        }
        $this->assign('row', $row);
        return $this->fetch();
    }

    #[NodeAnnotation(title: '设置密码', auth: true)]
    public function password(Request $request, $id): string
    {
        $row = self::$model::find($id);
        empty($row) && $this->error('数据不存在');
        if ($request->isAjax()) {
            $post = $request->post();
            $rule = [
                'password|登录密码'       => 'require',
                'password_again|确认密码' => 'require',
            ];
            $this->validate($post, $rule);
            if ($post['password'] != $post['password_again']) {
                $this->error('两次密码输入不一致');
            }
            try {
                $save = $row->save([
                    'password' => password($post['password']),
                ]);
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
        $this->checkPostRequest();
        $id  = $request->param('id');
        $row = self::$model::whereIn('id', $id)->select();
        $row->isEmpty() && $this->error('数据不存在');
        $id == AdminConstant::SUPER_ADMIN_ID && $this->error('超级管理员不允许修改');
        if (is_array($id)) {
            if (in_array(AdminConstant::SUPER_ADMIN_ID, $id)) {
                $this->error('超级管理员不允许修改');
            }
        }
        try {
            $save = $row->delete();
        }catch (\Exception $e) {
            $this->error('删除失败');
        }
        $save ? $this->success('删除成功') : $this->error('删除失败');
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
        if (!in_array($post['field'], $this->allowModifyFields)) {
            $this->error('该字段不允许修改：' . $post['field']);
        }
        if ($post['id'] == AdminConstant::SUPER_ADMIN_ID && $post['field'] == 'status') {
            $this->error('超级管理员状态不允许修改');
        }
        $row = self::$model::find($post['id']);
        empty($row) && $this->error('数据不存在');
        try {
            $row->save([
                $post['field'] => $post['value'],
            ]);
        }catch (\Exception $e) {
            $this->error($e->getMessage());
        }
        $this->success('保存成功');
    }


}
