<?php

namespace app\admin\controller\system;

use app\admin\model\SystemConfig;
use app\admin\service\TriggerService;
use app\common\controller\AdminController;
use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use app\Request;
use think\App;
use think\facade\Cache;
use think\response\Json;

#[ControllerAnnotation(title: '系统配置管理')]
class Config extends AdminController
{

    public function __construct(App $app)
    {
        parent::__construct($app);
        $this->model = new SystemConfig();
        $this->assign('upload_types', config('admin.upload_types'));
        $this->assign('editor_types', config('admin.editor_types'));
        $this->assign('login_templates', config('admin.login_templates'));
        $this->assign('login_template', sysConfig('site', 'login_template') ?: 'index');
    }

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        return $this->fetch();
    }

    #[NodeAnnotation(title: '保存', auth: true)]
    public function save(Request $request): void
    {
        $this->checkPostRequest();
        $post         = $request->post();
        $notAddFields = ['_token', 'file', 'group'];
        try {
            $group = $post['group'] ?? '';
            if (!is_string($group) || !preg_match('/^[A-Za-z0-9_]+$/', $group)) $this->error('保存失败');
            if ($group == 'upload') {
                $upload_types = config('admin.upload_types');
                // 兼容旧版本
                $this->model->where('name', 'upload_allow_type')->where('group', 'upload')->update(['value' => implode(',', array_keys($upload_types))]);
            }
            foreach ($post as $key => $val) {
                if (in_array($key, $notAddFields)) continue;
                if (!is_string($key) || !preg_match('/^[A-Za-z0-9_]+$/', $key)) continue;
                if (is_array($val)) {
                    $this->error('配置值格式错误：' . $key);
                }
                // name 在数据库中唯一：存在时校验分组，避免跨分组误覆盖
                $exist = $this->model->where('name', $key)->find();
                if ($exist) {
                    if ((string)$exist['group'] !== $group) {
                        $this->error('配置项 ' . $key . ' 属于其他分组，禁止在此处修改');
                    }
                    $exist->save(['value' => $val]);
                } else {
                    $this->model::create(
                        [
                            'name'  => $key,
                            'value' => $val,
                            'group' => $group,
                        ]);
                }
            }
            TriggerService::updateMenu();
            TriggerService::updateSysConfig();
        }catch (\Exception $e) {
            $this->error('保存失败' . $e->getMessage());
        }
        $this->success('保存成功');
    }

}