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