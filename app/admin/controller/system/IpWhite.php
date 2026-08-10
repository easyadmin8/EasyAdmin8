<?php

namespace app\admin\controller\system;

use app\admin\model\SystemIpWhite;
use app\common\controller\AdminController;
use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use think\App;
use think\facade\Cache;

#[ControllerAnnotation(title: 'system_ip_white')]
class IpWhite extends AdminController
{

    private ?array $notes;

    public function __construct(App $app)
    {
        parent::__construct($app);
        $this->model = new SystemIpWhite();
        $notes       = $this->model->notes;
        $this->notes = $notes;
        $this->assign(compact('notes'));
    }

    public function __destruct()
    {
        if (request()->isAjax()) {
            if (in_array(request()->action(), ['add', 'edit', 'recycle', 'delete'])) {
                Cache::delete('ip:white:list');
            }
        }
    }

}