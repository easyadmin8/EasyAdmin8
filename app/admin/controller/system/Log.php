<?php

namespace app\admin\controller\system;

use app\admin\model\SystemLog;
use app\admin\service\annotation\MiddlewareAnnotation;
use app\admin\service\tool\CommonTool;
use app\common\controller\AdminController;
use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use app\Request;
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
        $this->model = new SystemLog();
    }

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        if ($request->isAjax()) {
            if (input('selectFields')) {
                return $this->selectList();
            }
            [$page, $limit, $where, $excludeFields] = $this->buildTableParams(['month']);
            $month = $this->parseMonth($excludeFields['month'] ?? null);
            $model = $this->model->setSuffix("_$month")->with('admin')->where($where);
            try {
                $count = $model->count();
                $list  = $model->page($page, $limit)->order($this->sort)->select();
            } catch (PDOException|DbException $exception) {
                \think\facade\Log::error(__METHOD__
                                         . PHP_EOL . $exception->getMessage()
                                         . PHP_EOL . $exception->getFile()
                                         . PHP_EOL . $exception->getLine()
                                         . PHP_EOL . $exception->getCode()
                );
                $count = 0;
                $list  = [];
            }
            return $this->jsonSuccess($list, $count);
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
        $month     = $this->parseMonth($excludeFields['month'] ?? null);
        $driver    = (string)config('database.default');
        $prefix    = (string)config("database.connections.{$driver}.prefix", '');
        $baseName  = CommonTool::humpToLine(lcfirst($this->model->getName()));
        $tableName = $prefix . $baseName . "_{$month}";
        $header = [];
        try {
            if ($driver === 'pgsql') {
                $dbList = Db::query(
                    "SELECT column_name AS \"Field\", '' AS \"Comment\" FROM information_schema.columns WHERE table_name = :table ORDER BY ordinal_position",
                    ['table' => $tableName]
                );
            } else {
                $dbList = Db::query("show full columns from `{$tableName}`");
            }
            foreach ($dbList as $vo) {
                $comment = !empty($vo['Comment']) ? $vo['Comment'] : $vo['Field'];
                if (!in_array($vo['Field'], $this->noExportFields)) {
                    $header[] = [$comment, $vo['Field']];
                }
            }
        } catch (\Throwable $exception) {
            $this->error('日志表不存在或读取失败');
        }
        $model = $this->model->setSuffix("_$month")->with('admin')->where($where);
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
        } catch (\Throwable $exception) {
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

        $driver     = (string)config('database.default');
        $dbPrefix   = (string)env('DB_PREFIX', '');
        $dbLike     = "{$dbPrefix}system_log_";
        $like       = addcslashes($dbLike, '_%\\') . '%';
        $threshold  = date('Ym', strtotime("-$monthsAgo month"));
        $tableNames = [];
        try {
            if ($driver === 'pgsql') {
                $tables  = Db::query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE :like", ['like' => $like]);
                $nameKey = 'tablename';
                $quote   = '"';
            } else {
                $tables  = Db::query("SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE :like", ['like' => $like]);
                $nameKey = 'name';
                $quote   = '`';
            }
            $regex = '/^' . preg_quote($dbLike, '/') . '\d{6}$/';
            foreach ($tables as $table) {
                $tableName = $nameKey !== null ? ($table[$nameKey] ?? '') : (string)current($table);
                if ($tableName === '' || !preg_match($regex, $tableName)) continue;
                $datePart = substr($tableName, -6);
                if ($datePart - $threshold <= 0) {
                    Db::execute("DROP TABLE {$quote}{$tableName}{$quote}");
                    $tableNames[] = $tableName;
                }
            }
        } catch (PDOException) {
        }
        if (empty($tableNames)) $this->error('没有需要删除的表');
        $this->success('操作成功 - 共删除 ' . count($tableNames) . ' 张表<br/>' . implode('<br>', $tableNames));
    }

    /**
     * 解析月份筛选参数为 Ym 格式
     * @param mixed $value
     * @return string
     */
    protected function parseMonth($value): string
    {
        if (empty($value)) {
            return date('Ym');
        }
        if (!is_string($value) || !preg_match('/^\d{4}-\d{2}(-\d{2})?$/', $value)) {
            $this->error('月份参数格式错误');
        }
        $ts = strtotime($value);
        if ($ts === false) {
            $this->error('月份参数格式错误');
        }
        return date('Ym', $ts);
    }

    #[
        MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOG),
        NodeAnnotation(title: '框架日志', auth: true, ignore: NodeAnnotation::IGNORE_NODE),
    ]
    public function record(): Json|string
    {
        return (new \Wolfcode\PhpLogviewer\thinkphp\LogViewer())->fetch();
    }

}