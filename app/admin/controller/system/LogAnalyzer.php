<?php

namespace app\admin\controller\system;

use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use app\common\controller\AdminController;
use app\admin\service\ai\LogAnalyzerService;
use app\Request;
use think\facade\Cache;
use think\facade\Log as ThinkLog;
use think\response\Json;
use think\App;

#[ControllerAnnotation(title: '日志分析')]
class LogAnalyzer extends AdminController
{
    public function __construct(App $app)
    {
        parent::__construct($app);
    }

    #[NodeAnnotation(title: '日志分析', auth: true)]
    public function index(Request $request): string
    {
        return $this->fetch();
    }

    #[NodeAnnotation(title: '分析日志', auth: true)]
    public function analyze(): Json|string
    {
        if (!$this->request->isAjax()) $this->error('请求方式错误');

        if ($this->isDemo) {
            sleep(1);
            $demo = <<<EOF
        **提示：演示环境下默认返回以下数据**
        
        ```shell
        请自行配置 .env 配置中的
        DASHSCOPE_API_URL=YOUR_DASHSCOPE_API_URL
        DASHSCOPE_API_KEY=YOUR_DASHSCOPE_API_KEY
        DASHSCOPE_API_MODEL=YOUR_DASHSCOPE_API_MODEL
        ```
        
        好的，作为专业的ThinkPHP日志分析专家，我已对您提供的日志内容进行了全面分析。以下是详细的分析报告。\n\n---\n\n## 日志分析报告\n\n### 1. 错误类型和频率\n\n**结论：日志中未发现任何PHP错误、异常或警告（如 `[error]`、`[warning]` 标记）。** 所有记录均为SQL查询和请求调试信息，系统运行状态表面正常。\n\n**潜在问题（非显式错误）：**\n- **重复的 `SHOW FULL COLUMNS` 查询**：在多个请求中反复出现，例如对 `ea8_system_config`、`ea8_system_admin`、`ea8_system_node` 等表的元数据查询。每个请求平均执行2~3次，频率极高。\n- **重复的权限\/用户查询**：例如 `SELECT * FROM ea8_system_admin WHERE id = '1'` 在单个请求中多次出现（如 `\/admin\/system.admin\/index` 请求中出现了6次），表明权限验证逻辑存在冗余。\n\n### 2. 性能问题\n\n| 问题描述 | 影响 | 示例 |\n|---------|------|------|\n| **未启用数据表字段缓存** | 每次请求都执行 `SHOW FULL COLUMNS`，增加数据库负载和响应时间。单次耗时约0.001~0.002s，但累积后显著。 | 在 `\/admin\/login\/index` 请求中，两次连接均执行了 `SHOW FULL COLUMNS FROM ea8_system_config`。 |\n| **重复查询相同数据** | 同一请求内多次查询同一用户信息（`id=1`）或节点列表，浪费数据库资源。 | `\/admin\/system.admin\/index` 请求中，`SELECT * FROM ea8_system_admin WHERE id=1` 执行了6次。 |\n| **数据库连接时间波动** | 连接耗时从0.0015s到0.023s不等，部分连接较慢（如0.023s），可能未使用持久连接或连接池。 | 多个 `CONNECT` 记录显示 `UseTime` 差异较大。 |\n| **无分页缓存** | 日志列表查询（`\/admin\/system.log\/index`）每次均执行 `COUNT(*)` 和 `LIMIT` 查询，未利用缓存。 | 每次翻页都重新计算总数。 |\n\n### 3. 安全风险\n\n| 风险等级 | 问题描述 | 详细分析 |\n|---------|---------|---------|\n| **高危** | **表名拼接导致的SQL注入风险** | 在 `\/admin\/system.log\/index` 请求中，`filter` 参数为 `{\"month\":\"2026-04\"}`，`op` 为 `{\"month\":\"=\"}`。后续SQL查询直接使用了 `ea8_system_log_202604` 作为表名（`SELECT * FROM ea8_system_log_202604`）。如果 `month` 参数未经过严格过滤，攻击者可以构造恶意值（如 `202604; DROP TABLE ...` 或 `202604 UNION SELECT ...`）来操纵表名，导致SQL注入或数据泄露。 |\n| **中危** | **敏感信息泄露** | 日志中记录了数据库连接信息（`mysql:host=127.0.0.1;port=3306;dbname=easyadmin8;charset=utf8mb4`），如果日志文件权限设置不当（如可被公网访问），攻击者可获取数据库地址和库名。 |\n| **低危** | **请求参数暴露** | `requestDebugInfo` 中记录了完整的URL和参数，包括 `filter`、`op` 等，可能暴露业务逻辑。 |\n\n### 4. 优化建议\n\n#### 4.1 性能优化\n1. **开启数据表字段缓存**  \n   在 `config\/database.php` 中设置：\n   ```php\n   'fields_cache' => true,\n   ```\n   并确保 `runtime` 目录可写。这将避免每次请求都执行 `SHOW FULL COLUMNS`。\n\n2. **减少重复查询**  \n   - 使用缓存（如Redis或文件缓存）存储用户信息、权限节点、系统配置等。例如，将 `ea8_system_admin` 中 `id=1` 的用户信息缓存5分钟。\n   - 优化权限验证中间件，避免在同一个请求中多次查询相同数据。\n\n3. **使用数据库连接池或持久连接**  \n   在 `database.php` 中配置：\n   ```php\n   'params' => [\n       PDO::ATTR_PERSISTENT => true, \/\/ 持久连接\n   ],\n   ```\n   或使用连接池中间件（如Swoole）。\n\n4. **分页查询优化**  \n   对于日志列表，可考虑使用缓存记录总数，或使用近似计数（如 `EXPLAIN` 估算）减少 `COUNT(*)` 开销。\n\n#### 4.2 安全加固\n1. **修复表名拼接漏洞（高危）**  \n   - **严格校验 `month` 参数**：只允许 `YYYY-MM` 格式，且必须匹配正则 `\/^\\d{4}-\\d{2}$\/`。\n   - **使用白名单**：预定义允许的表名后缀（如 `202604`），拒绝任何非预期值。\n   - **使用ORM的 `table()` 方法时进行参数绑定**：ThinkPHP支持 `Db::table('ea8_system_log_' . month)`，但需确保 `month` 经过过滤。更安全的方式是使用 `Db::name('system_log')->whereMonth(month)` 等内置方法。\n\n2. **保护日志文件**  \n   - 确保日志目录权限为 `750` 或 `700`，仅Web服务器用户可读。\n   - 禁止直接通过URL访问日志文件（如配置Nginx\/Apache拒绝 `.log` 文件）。\n\n3. **避免在日志中记录敏感信息**  \n   可修改 `log` 配置，过滤掉数据库连接字符串中的密码（当前日志未显示密码，但需确保生产环境不记录）。\n\n### 5. 根本原因分析\n\n- **性能问题根源**：ThinkPHP默认未开启字段缓存，且开发者在编写代码时未对重复查询进行缓存优化。权限验证逻辑（如 `Auth` 类）在每个控制器初始化时都会重新查询用户和节点，导致冗余。\n- **安全风险根源**：日志管理功能中，开发者为了按月份分表，直接使用用户输入的 `month` 参数拼接表名，未进行任何过滤或参数化处理。这是典型的“表名注入”漏洞，常见于分表场景。\n- **连接时间波动**：可能由于数据库服务器负载波动或未启用持久连接，每次请求都创建新连接。\n\n---\n\n**总结**：当前系统无显式错误，但存在严重的性能瓶颈（重复元数据查询）和高危安全漏洞（表名注入）。建议优先修复表名注入漏洞，然后开启字段缓存和优化查询逻辑。
        EOF;
            $this->success('分析成功', [
                "analysis" => $demo
            ]);
        }

        set_time_limit(300);

        $logContent = Cache::get('log_analyzer_content:' . $this->adminUid);
        if (empty($logContent)) $this->error('请提供日志内容');
        $analysisType = $this->request->param('type/s', 'comprehensive');

        $validTypes = ['comprehensive', 'security', 'performance', 'error', 'debug'];
        if (!in_array($analysisType, $validTypes)) {
            $analysisType = 'comprehensive';
        }
        $analyzer = LogAnalyzerService::make();
        $analyzer->loadCustomLogs($logContent);
        $result = $analyzer->analyze(['type' => $analysisType]);
        if ($result['success']) {
            $this->success($result['message'], ['analysis' => $result['analysis']]);
        } else {
            $this->error($result['message']);
        }
    }

    #[NodeAnnotation(title: '获取日志文件列表', auth: true)]
    public function getLogFiles(): Json|string
    {
        if (!$this->request->isAjax()) {
            return $this->fetch();
        }
        $runtimeDir = app()->getRuntimePath();
        if (!is_dir($runtimeDir)) {
            $this->error('Runtime 目录不存在: ' . $runtimeDir);
        }
        if (!is_readable($runtimeDir)) {
            $this->error('Runtime 目录不可读: ' . $runtimeDir);
        }
        $result = [];
        $this->scanLogStructure($runtimeDir, $result, 3);
        $this->success('共找到 ' . count($result) . ' 个目录', [
            'directories' => $result,
        ]);

    }

    protected function scanLogStructure(string $dir, array &$result, int $depth = 3): void
    {
        if ($depth <= 0) {
            return;
        }

        $runtimePath = app()->getRuntimePath();

        try {
            $subDirs = glob($dir . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR);
            if ($subDirs === false) {
                return;
            }

            foreach ($subDirs as $subDir) {
                if (!is_readable($subDir)) {
                    continue;
                }

                $dirName = basename($subDir);
                $dirData = [
                    'name'          => $dirName,
                    'path'          => $subDir,
                    'relative_path' => ltrim(str_replace($runtimePath, '', $subDir), DIRECTORY_SEPARATOR),
                    'has_logs'      => false,
                    'files'         => [],
                    'children'      => [],
                ];

                $logFiles = glob($subDir . DIRECTORY_SEPARATOR . '*.log');
                if ($logFiles !== false && !empty($logFiles)) {
                    $dirData['has_logs'] = true;
                    foreach ($logFiles as $file) {
                        if (is_file($file) && is_readable($file)) {
                            $stat               = stat($file);
                            $dirData['files'][] = [
                                'name'          => basename($file),
                                'path'          => $file,
                                'relative_path' => ltrim(str_replace($runtimePath, '', $file), DIRECTORY_SEPARATOR),
                                'size'          => $stat['size'],
                                'size_format'   => $this->formatFileSize($stat['size']),
                                'mtime'         => $stat['mtime'],
                                'mtime_format'  => date('Y-m-d H:i:s', $stat['mtime']),
                            ];
                        }
                    }
                    if (!empty($dirData['files'])) {
                        usort($dirData['files'], function ($a, $b) {
                            return $b['mtime'] - $a['mtime'];
                        });
                    }
                }

                $this->scanLogStructure($subDir, $dirData['children'], $depth - 1);
                $result[] = $dirData;
            }
        } catch (\Exception $e) {
            ThinkLog::warning('扫描日志目录失败: ' . $dir . ' | ' . $e->getMessage());
        }
    }

    protected function formatFileSize(int $bytes): string
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

    #[NodeAnnotation(title: '加载多个日志文件', auth: true)]
    public function loadMultipleLogs(): Json|string
    {
        if (!$this->request->isAjax()) {
            return $this->fetch();
        }

        $fileNames = $this->request->param('file_names/a', []);
        $maxLines  = $this->request->param('max_lines/d', 200);

        if (empty($fileNames)) {
            $this->error('请选择至少一个日志文件');
        }

        $runtimePath = app()->getRuntimePath();
        $loadedFiles = [];
        $totalLines  = 0;
        $logText     = '';
        foreach ($fileNames as $relativePath) {
            $remainingLines = $maxLines - $totalLines;
            if ($remainingLines <= 0) {
                break;
            }

            $filePath = $runtimePath . $relativePath;

            if (!file_exists($filePath)) {
                continue;
            }

            $content = file_get_contents($filePath);
            if ($content === false) {
                continue;
            }
            $lines         = explode("\n", $content);
            $lines         = array_filter($lines, fn($line) => !empty(trim($line)));
            $lineCount     = min(count($lines), $remainingLines);
            $selectedLines = array_slice($lines, -$lineCount);

            $logText .= "=== 文件：{$relativePath} ===\n";
            $logText .= implode("\n", $selectedLines);
            $logText .= "\n\n";

            $loadedFiles[] = [
                'file'  => $relativePath,
                'count' => $lineCount,
            ];

            $totalLines += $lineCount;
        }

        if (empty($loadedFiles)) {
            $this->error('未找到任何有效的日志文件');
        }
        Cache::set('log_analyzer_content:' . $this->adminUid, $logText, 600);
        $this->success('成功加载 ' . count($loadedFiles) . ' 个文件，共 ' . $totalLines . ' 行', [
            'metadata' => [
                'files'       => $loadedFiles,
                'total_files' => count($loadedFiles),
                'total_lines' => $totalLines,
            ],
        ]);
    }

}