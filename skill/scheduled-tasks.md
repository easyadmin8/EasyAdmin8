# 定时任务

## 目录结构

```
crontab/
├── demo.php              # 示例任务
├── demo.out.log          # 输出日志
└── .runner.php           # Windows 引导脚本（自动生成）
```

## 创建定时任务

`crontab/demo.php`:

```php
<?php

require dirname(__DIR__) . '/vendor/autoload.php';

use PhpCron\Scheduler;
use PhpCron\Timezone;

/**
 * 任务调度器
 *
 * 请在 Linux 或 MacOS 下运行，Windows 下无法cli模式后台运行
 *
 * 用法:
 *   php .\crontab\demo.php         启动任务（后台运行）
 *   php .\crontab\demo.php status  查看任务状态
 *   php .\crontab\demo.php stop    停止当前任务
 */

Scheduler::run(function (Scheduler $crontab) {

    // 每5秒执行一次
    $crontab->call(function () {
        echo PHP_EOL . date('Y-m-d H:i:s') . " second ping";
    })->second(5)->name('second ping');

    // 每1分钟执行一次
    $crontab->call(function () {
        echo PHP_EOL . date('Y-m-d H:i:s') . " minute ping";
    })->minute(1)->name('minute ping');

    // 每1小时执行一次 df -h
    $crontab->command('df -h')->hourly()->appendOutputTo(__DIR__ . '/disk-usage.log');
    //    $crontab->command('df -h')->hour(1)->appendOutputTo(__DIR__ . '/disk-usage.log');

    // 每个工作日的9点执行一次
    $crontab->call(function () {
        // Send daily report at 9 AM on weekdays
    })->dailyAt('9:00')->weekdays()->name('daily-report');

}, Timezone::ASIA_SHANGHAI); // 设置上海时区
```

## 后台管理

访问"系统管理" → "任务调度器管理"：

- 查看所有任务
- 启动/停止任务
- 查看/清空日志

## Schedule 控制器方法

```php
// app/admin/controller/system/Schedule.php

public function index()           // 任务列表
public function manage()          // 管理页面
public function status()          // 获取状态
public function start()           // 启动任务
public function stop()            // 停止任务
public function log()             // 查看日志
public function clearLog()        // 清空日志
public function downloadLog()     // 下载日志
```

## 跨平台兼容

### Windows

- `tasklist` 检查进程
- `taskkill /F /T /PID` 终止进程
- `start /B` 后台启动

### Linux

- `ps` 检查进程
- `kill` 终止进程
- `nohup` 后台启动

## PID 和日志文件

```
crontab/
├── demo.php
├── .demo.pid           # PID 文件
└── demo.out.log        # 输出日志
```
