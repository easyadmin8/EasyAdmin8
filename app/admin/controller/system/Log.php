<?php

namespace app\admin\controller\system;

use app\admin\model\SystemLog;
use app\admin\service\annotation\MiddlewareAnnotation;
use app\admin\service\tool\CommonTool;
use app\common\controller\AdminController;
use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use app\Request;
use jianyan\excel\Excel;
use think\App;
use think\db\exception\DbException;
use think\db\exception\PDOException;
use think\facade\Db;
use think\response\Json;

#[ControllerAnnotation(title: '操作日志管理')]
class Log extends AdminController
{
    public function __construct(App $app)
    {
        parent::__construct($app);
        self::$model = SystemLog::class;
    }

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        if ($request->isAjax()) {
            if (input('selectFields')) {
                return $this->selectList();
            }
            [$page, $limit, $where, $excludeFields] = $this->buildTableParams(['month']);
            $month = !empty($excludeFields['month']) ? date('Ym', strtotime($excludeFields['month'])) : date('Ym');
            $model = (new self::$model)->setSuffix("_$month")->with('admin')->where($where);
            try {
                $count = $model->count();
                $list  = $model->page($page, $limit)->order($this->sort)->select();
            }catch (PDOException|DbException $exception) {
                $count = 0;
                $list  = [];
            }
            $data = [
                'code'  => 0,
                'msg'   => '',
                'count' => $count,
                'data'  => $list,
            ];
            return json($data);
        }
        return $this->fetch();
    }

    #[NodeAnnotation(title: '导出', auth: true)]
    public function export()
    {
        if (env('EASYADMIN.IS_DEMO', false)) {
            $this->error('演示环境下不允许操作');
        }
        [$page, $limit, $where, $excludeFields] = $this->buildTableParams(['month']);
        $month     = !empty($excludeFields['month']) ? date('Ym', strtotime($excludeFields['month'])) : date('Ym');
        $tableName = (new self::$model)->setSuffix("_$month")->getName();
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
        $model = (new self::$model)->setSuffix("_$month")->with('admin')->where($where);
        try {
            $list = $model
                ->limit(10000)
                ->order('id', 'desc')
                ->select()
                ->toArray();
            foreach ($list as &$vo) {
                $vo['content']  = json_encode($vo['content'], JSON_UNESCAPED_UNICODE);
                $vo['response'] = json_encode($vo['response'], JSON_UNESCAPED_UNICODE);
            }
            exportExcel($header, $list, '操作日志');
        }catch (\Throwable $exception) {
            $this->error($exception->getMessage());
        }
    }


    #[NodeAnnotation(title: '删除指定日志', auth: true)]
    public function deleteMonthLog(Request $request)
    {
        if (!$request->isAjax()) {
            return $this->fetch();
        }

        if ($this->isDemo) $this->error('演示环境下不允许操作');

        $monthsAgo = $request->param('month/d', 0);
        if ($monthsAgo < 1) $this->error('月份错误');

        $currentDate = new \DateTime();
        $currentDate->modify("-$monthsAgo months");

        $dbPrefix   = env('DB_PREFIX');
        $dbLike     = "{$dbPrefix}system_log_";
        $tables     = Db::query("SHOW TABLES LIKE '$dbLike%'");
        $threshold  = date('Ym', strtotime("-$monthsAgo month"));
        $tableNames = [];
        try {
            foreach ($tables as $table) {
                $tableName = current($table);
                if (!preg_match("/^$dbLike\d{6}$/", $tableName)) continue;
                $datePart   = substr($tableName, -6);
                $issetTable = Db::query("SHOW TABLES LIKE '$tableName'");
                if (!$issetTable) continue;
                if ($datePart - $threshold <= 0) {
                    Db::execute("DROP TABLE `$tableName`");
                    $tableNames[] = $tableName;
                }
            }
        }catch (PDOException) {
        }
        if (empty($tableNames)) $this->error('没有需要删除的表');
        $this->success('操作成功 - 共删除 ' . count($tableNames) . ' 张表<br/>' . implode('<br>', $tableNames));
    }

    #[MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOG)]
    #[NodeAnnotation(title: '框架日志', auth: true, ignore: NodeAnnotation::IGNORE_NODE)]
    public function record(): Json|string
    {
        return (new \Wolfcode\PhpLogviewer\thinkphp\LogViewer())->fetch();
    }

}