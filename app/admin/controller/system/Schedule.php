<?php

namespace app\admin\controller\system;

/**
 * 任务调度器管理
 * 将需要定时的任务都写人到 crontab 目录下 参考 demo.php
 * 每个任务脚本文件名就是任务的名称
 * 任务脚本文件内容就是任务的执行命令
 * 任务脚本文件权限需要设置为可执行
 * 任务脚本文件权限需要设置为 755
 */

use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use app\common\controller\AdminController;
use app\Request;
use think\App;
use think\response\Json;
use think\Response;

#[ControllerAnnotation(title: '任务调度器管理', auth: true)]
class Schedule extends AdminController
{

    /**
     * 定时任务脚本目录
     * @var string
     */
    protected string $crontabPath;

    public function __construct(App $app)
    {
        parent::__construct($app);
        $this->crontabPath = root_path() . 'crontab';
    }

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        if ($request->isAjax()) {
            $list = $this->getCrontabFiles();
            return json([
                            'code'  => 0,
                            'msg'   => '',
                            'count' => count($list),
                            'data'  => $list,
                        ]);
        }
        return $this->fetch();
    }

    #[NodeAnnotation(title: '管理', auth: true)]
    public function manage(Request $request): string
    {
        $file = $this->getSafeFile($request->param('name/s', $request->param('file/s', '')));
        $this->assign('file', basename($file));
        $this->assign('filePath', $file);
        return $this->fetch();
    }

    #[NodeAnnotation(title: '任务状态', auth: true)]
    public function status(Request $request): void
    {
        $this->checkPostRequest();
        $file   = $this->getSafeFile($request->param('file/s', ''));
        $output = $this->runCommand($file, 'status');
        $this->success('获取成功', ['output' => $output]);
    }

    #[NodeAnnotation(title: '启动任务', auth: true)]
    public function start(Request $request): void
    {
        $this->checkPostRequest();
        if ($this->isDemo) $this->error('演示环境下不允许操作');
        $file   = $this->getSafeFile($request->param('file/s', ''));
        $output = $this->runCommand($file, 'start');
        $this->success('启动成功', ['output' => $output]);
    }

    #[NodeAnnotation(title: '停止任务', auth: true)]
    public function stop(Request $request): void
    {
        $this->checkPostRequest();
        if ($this->isDemo) $this->error('演示环境下不允许操作');
        $file   = $this->getSafeFile($request->param('file/s', ''));
        $output = $this->runCommand($file, 'stop');
        $this->success('停止成功', ['output' => $output]);
    }

    #[NodeAnnotation(title: '查看日志', auth: true)]
    public function log(Request $request): void
    {
        $file    = $this->getSafeFile($request->param('file/s', ''));
        $lines   = (int)$request->param('lines/d', 200);
        $lines   = max(10, min($lines, 5000));
        $logFile = $this->logFile($file);
        if (!is_file($logFile)) {
            $this->success('暂无日志输出', [
                'output' => '(尚未生成日志文件)',
                'path'   => $logFile,
                'size'   => '0 B',
                'mtime'  => '-',
                'lines'  => $lines,
            ]);
        }
        $content = $this->tail($logFile, $lines);
        $this->success('获取成功', [
            'output' => $content !== '' ? $content : '(日志为空)',
            'path'   => $logFile,
            'size'   => $this->formatSize(@filesize($logFile) ?: 0),
            'mtime'  => date('Y-m-d H:i:s', @filemtime($logFile) ?: time()),
            'lines'  => $lines,
        ]);
    }

    #[NodeAnnotation(title: '清空日志', auth: true)]
    public function clearLog(Request $request): void
    {
        $this->checkPostRequest();
        if ($this->isDemo) $this->error('演示环境下不允许操作');
        $file    = $this->getSafeFile($request->param('file/s', ''));
        $logFile = $this->logFile($file);
        if (is_file($logFile)) {
            $ok = @file_put_contents($logFile, '') !== false;
            if (!$ok) $this->error('清空失败，请检查文件权限');
        }
        $this->success('清空成功', ['output' => '(日志已清空)']);
    }

    #[NodeAnnotation(title: '下载日志', auth: true)]
    public function downloadLog(Request $request): Response
    {
        $file    = $this->getSafeFile($request->param('file/s', ''));
        $logFile = $this->logFile($file);
        if (!is_file($logFile)) {
            $this->error('日志文件不存在');
        }
        return response()
            ->data(file_get_contents($logFile))
            ->contentType('text/plain; charset=utf-8')
            ->header([
                         'Content-Disposition' => 'attachment; filename="' . basename($logFile) . '"',
                         'Content-Length'      => (string)filesize($logFile),
                     ]);
    }

    /**
     * 获取 crontab 目录下所有 PHP 文件
     */
    protected function getCrontabFiles(): array
    {
        $list = [];
        if (!is_dir($this->crontabPath)) return $list;

        $files = glob($this->crontabPath . DIRECTORY_SEPARATOR . '*.php') ?: [];
        $id    = 0;
        foreach ($files as $file) {
            $name    = basename($file);
            $pidFile = $this->pidFile($file);
            $pid     = is_file($pidFile) ? (int)@file_get_contents($pidFile) : 0;
            $running = $pid > 0 && $this->processAlive($pid);
            $list[]  = [
                'id'      => ++$id,
                'name'    => $name,
                'path'    => $file,
                'size'    => $this->formatSize(@filesize($file) ?: 0),
                'mtime'   => date('Y-m-d H:i:s', @filemtime($file) ?: time()),
                'pid'     => $running ? $pid : 0,
                'running' => $running ? 1 : 0,
            ];
        }
        return $list;
    }

    /**
     * 校验文件路径，只允许 crontab 目录下的 PHP 文件
     */
    protected function getSafeFile(string $name): string
    {
        $name = basename(trim($name));
        if ($name === '' || !preg_match('/^[A-Za-z0-9_\-]+\.php$/', $name)) {
            $this->error('非法的脚本文件');
        }
        $file = $this->crontabPath . DIRECTORY_SEPARATOR . $name;
        if (!is_file($file)) {
            $this->error('脚本文件不存在: ' . $name);
        }
        return $file;
    }

    /**
     * 当前脚本对应的 PID 文件（由本控制器维护，跨平台）
     */
    protected function pidFile(string $file): string
    {
        return $this->crontabPath . DIRECTORY_SEPARATOR . '.' . basename($file, '.php') . '.pid';
    }

    /**
     * 当前脚本对应的输出日志
     */
    protected function logFile(string $file): string
    {
        return $this->crontabPath . DIRECTORY_SEPARATOR . basename($file, '.php') . '.out.log';
    }

    /**
     * 判断进程是否存活（跨平台）
     */
    protected function processAlive(int $pid): bool
    {
        if ($pid <= 0) return false;
        if (stripos(PHP_OS, 'WIN') === 0) {
            foreach ($this->commandLines('tasklist /FI "PID eq ' . $pid . '" /NH 2>NUL') as $line) {
                if (stripos($line, (string)$pid) !== false) return true;
            }
            return false;
        }
        if (function_exists('posix_kill')) {
            return @posix_kill($pid, 0);
        }
        return count($this->commandLines('ps -p ' . $pid . ' 2>/dev/null')) > 1;
    }

    /**
     * 执行调度命令（跨平台）
     */
    protected function runCommand(string $file, string $action): string
    {
        @set_time_limit(60);
        $isWin = stripos(PHP_OS, 'WIN') === 0;
        return $isWin ? $this->runWindows($file, $action) : $this->runUnix($file, $action);
    }

    /**
     * Windows 处理逻辑：自行管理 PID，避免依赖 vendor 的 daemon（无 pcntl 不工作）
     */
    protected function runWindows(string $file, string $action): string
    {
        $phpBinary = $this->phpCli();
        $pidFile   = $this->pidFile($file);
        $logFile   = $this->logFile($file);
        $oldPid    = is_file($pidFile) ? (int)@file_get_contents($pidFile) : 0;
        $running   = $oldPid > 0 && $this->processAlive($oldPid);

        switch ($action) {
            case 'status':
                if ($running) {
                    $started = is_file($pidFile) ? date('Y-m-d H:i:s', filemtime($pidFile)) : '-';
                    $log     = is_file($logFile) ? $this->tail($logFile, 30) : '';
                    return "Status:   Running\nPID:      {$oldPid}\nStarted:  {$started}\n" . str_repeat('-', 44)
                           . ($log !== '' ? "\n最近输出:\n{$log}" : '');
                }
                if ($oldPid > 0) @unlink($pidFile);
                return "Status: Stopped";

            case 'start':
                if ($running) {
                    return "Already running (PID: {$oldPid})";
                }
                @unlink($pidFile);
                // 清理 vendor 自带的 pidfile，避免 Scheduler::run 误判“Already running”
                @unlink($this->crontabPath . DIRECTORY_SEPARATOR . '.php-cron.pid');
                @unlink($this->crontabPath . DIRECTORY_SEPARATOR . '.php-cron.pid.tasks.json');
                @file_put_contents($logFile, ''); // 清空旧日志

                // 写入一次性引导脚本：记录自身 PID 后再加载目标脚本
                $runner = $this->ensureRunner();

                // start /B 真正脱离父进程；引导脚本会写自己的 PID
                $cmd = 'start "" /B "' . $phpBinary . '" -d max_execution_time=0 -d memory_limit=-1 '
                       . '"' . $runner . '" '
                       . '"' . $pidFile . '" "' . $file . '" '
                       . '> "' . $logFile . '" 2>&1';
                // 通过 cmd 调用 start 并立即返回（start 自身是异步的）
                pclose(popen('cmd /C ' . $cmd, 'r'));

                // 等待引导脚本写出 PID（最多 ~3 秒）
                $pid = 0;
                for ($i = 0; $i < 30; $i++) {
                    if (is_file($pidFile)) {
                        $pid = (int)@file_get_contents($pidFile);
                        if ($pid > 0) break;
                    }
                    usleep(100_000);
                }
                if ($pid <= 0) {
                    return "启动指令已下发，但未能获取 PID。请稍后点击「查看状态」或检查日志：\n{$logFile}";
                }
                return "Daemon started (PID: {$pid})\n输出日志: {$logFile}";

            case 'stop':
                if (!$running) {
                    if ($oldPid > 0) @unlink($pidFile);
                    return 'Not running';
                }
                $out = $this->commandLines('taskkill /F /T /PID ' . (int)$oldPid . ' 2>&1');
                @unlink($pidFile);
                return $this->toUtf8("Stopped (PID: {$oldPid})\n" . implode("\n", $out));

            default:
                return '不支持的操作: ' . $action;
        }
    }

    /**
     * 创建/获取 Windows 下用于记录子进程 PID 的引导脚本
     */
    protected function ensureRunner(): string
    {
        $runner = $this->crontabPath . DIRECTORY_SEPARATOR . '.runner.php';
        if (!is_file($runner)) {
            $code = <<<'PHP'
<?php
// 由 Schedule 控制器自动生成：记录自身 PID 后加载目标定时任务脚本
@set_time_limit(0);
@ini_set('max_execution_time', '0');
@ini_set('memory_limit', '-1');
$pidFile = $argv[1] ?? '';
$target  = $argv[2] ?? '';
if ($pidFile === '' || $target === '' || !is_file($target)) {
    fwrite(STDERR, "Invalid runner arguments\n");
    exit(1);
}
@file_put_contents($pidFile, (string)getmypid());
$_SERVER['argv']           = [$target, 'start'];
$_SERVER['argc']           = 2;
$_SERVER['SCRIPT_FILENAME'] = $target;
$_SERVER['SCRIPT_NAME']     = $target;
$argv                      = $_SERVER['argv'];
$argc                      = $_SERVER['argc'];
chdir(dirname($target));
require $target;
PHP;
            @file_put_contents($runner, $code);
        }
        return $runner;
    }

    /**
     * Unix/Linux 处理逻辑：异步启动，避免 Web 请求被 daemon 输出管道阻塞
     */
    protected function runUnix(string $file, string $action): string
    {
        $phpBinary = $this->phpCli();
        $pidFile   = $this->pidFile($file);
        $logFile   = $this->logFile($file);
        $oldPid    = is_file($pidFile) ? (int)@file_get_contents($pidFile) : 0;
        $running   = $oldPid > 0 && $this->processAlive($oldPid);

        switch ($action) {
            case 'status':
                if ($running) {
                    $started = is_file($pidFile) ? date('Y-m-d H:i:s', filemtime($pidFile)) : '-';
                    $log     = is_file($logFile) ? $this->tail($logFile, 30) : '';
                    return "Status:   Running\nPID:      {$oldPid}\nStarted:  {$started}\n" . str_repeat('-', 44)
                           . ($log !== '' ? "\n最近输出:\n{$log}" : '');
                }
                if ($oldPid > 0) @unlink($pidFile);
                return 'Status: Stopped';

            case 'start':
                if ($running) {
                    return "Already running (PID: {$oldPid})";
                }
                @unlink($pidFile);
                @unlink($this->crontabPath . DIRECTORY_SEPARATOR . '.php-cron.pid');
                @unlink($this->crontabPath . DIRECTORY_SEPARATOR . '.php-cron.pid.tasks.json');
                @file_put_contents($logFile, '');
                $runner = $this->ensureRunner();
                $cmd    = 'nohup ' . escapeshellarg($phpBinary)
                          . ' -d max_execution_time=0 -d memory_limit=-1 '
                          . escapeshellarg($runner) . ' '
                          . escapeshellarg($pidFile) . ' '
                          . escapeshellarg($file)
                          . ' > ' . escapeshellarg($logFile) . ' 2>&1 &';
                $this->runDetached($cmd);

                $pid = 0;
                for ($i = 0; $i < 30; $i++) {
                    if (is_file($pidFile)) {
                        $pid = (int)@file_get_contents($pidFile);
                        if ($pid > 0) break;
                    }
                    usleep(100_000);
                }
                if ($pid <= 0) {
                    return "启动指令已下发，但未能获取 PID。请稍后点击「查看状态」或检查日志：\n{$logFile}";
                }
                return "Daemon started (PID: {$pid})\n输出日志: {$logFile}";

            case 'stop':
                if (!$running) {
                    if ($oldPid > 0) @unlink($pidFile);
                    return 'Not running';
                }
                $out = $this->commandLines('kill ' . (int)$oldPid . ' 2>&1');
                @unlink($pidFile);
                return $this->toUtf8("Stopped (PID: {$oldPid})\n" . implode("\n", $out));

            default:
                return '不支持的操作: ' . $action;
        }
    }

    /**
     * 直接使用系统 PATH 中的 php 命令；可在 .env 设置 SCHEDULE_PHP_CLI 覆盖
     */
    protected function phpCli(): string
    {
        $env = env('SCHEDULE_PHP_CLI', '');
        return $env !== '' ? $env : 'php';
    }

    /**
     * 读取文件尾部 N 行
     */
    protected function tail(string $file, int $lines = 30): string
    {
        if (!is_file($file)) return '';
        $content = @file_get_contents($file);
        if ($content === false) return '';
        $arr = preg_split("/\r?\n/", rtrim($content, "\r\n"));
        if (!$arr) return '';
        return $this->toUtf8(implode("\n", array_slice($arr, -$lines)));
    }

    /**
     * 执行后台命令，不等待输出
     */
    protected function runDetached(string $cmd): void
    {
        if (function_exists('proc_open')) {
            $process = @proc_open($cmd, [], $pipes);
            if (is_resource($process)) {
                proc_close($process);
            }
            return;
        }
        if (function_exists('popen')) {
            $handle = @popen($cmd, 'r');
            if ($handle) pclose($handle);
            return;
        }
        if (function_exists('shell_exec')) {
            @shell_exec($cmd);
        }
    }

    /**
     * 执行系统命令并返回输出行，兼容禁用 exec 的环境
     */
    protected function commandLines(string $cmd): array
    {
        if (function_exists('exec')) {
            $output = [];
            @\exec($cmd, $output);
            return array_map(fn($line) => $this->toUtf8((string)$line), $output);
        }

        $output = '';
        if (function_exists('proc_open')) {
            $descriptors = [
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w'],
            ];
            $process     = @proc_open($cmd, $descriptors, $pipes);
            if (is_resource($process)) {
                $output .= stream_get_contents($pipes[1]);
                $output .= stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                proc_close($process);
            }
        } elseif (function_exists('popen')) {
            $handle = @popen($cmd, 'r');
            if ($handle) {
                while (!feof($handle)) {
                    $output .= fgets($handle);
                }
                pclose($handle);
            }
        } elseif (function_exists('shell_exec')) {
            $output = (string)@shell_exec($cmd);
        }

        $output = $this->toUtf8($output);
        if ($output === '') return [];
        return preg_split('/\r?\n/', rtrim($output, "\r\n")) ?: [];
    }

    /**
     * 转 UTF-8（兼容 Windows GBK 命令输出 / 任意外部进程输出）
     */
    protected function toUtf8(string $text): string
    {
        if ($text === '' || preg_match('//u', $text)) return $text;
        if (function_exists('mb_convert_encoding')) {
            $detected  = mb_detect_encoding($text, ['UTF-8', 'GB18030', 'GBK', 'CP936', 'BIG5', 'ISO-8859-1'], true);
            $converted = @mb_convert_encoding($text, 'UTF-8', $detected ?: 'GB18030');
            if ($converted !== false && $converted !== '') return $converted;
        }
        if (function_exists('iconv')) {
            $converted = @iconv('GB18030', 'UTF-8//IGNORE', $text);
            if ($converted !== false) return $converted;
        }
        // 兜底：剔除非法字节
        return preg_replace('/[\x80-\xff]+/', '?', $text);
    }

    /**
     * 格式化文件大小
     */
    protected function formatSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i     = 0;
        $size  = $bytes;
        while ($size >= 1024 && $i < 3) {
            $size /= 1024;
            $i++;
        }
        return round($size, 2) . ' ' . $units[$i];
    }

}
