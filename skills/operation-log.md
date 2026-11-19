# 操作日志

## 日志表结构

EasyAdmin8 按月份分表记录日志，表名为 `{DB_PREFIX}system_log_{Ym}`（前缀默认 `ea8_`），由 `SystemLogService` 自动检测并创建：

```
ea8_system_log_202401  # 2024年1月日志
ea8_system_log_202611  # 2026年11月日志
```

## 日志字段

字段定义见 `app/admin/service/SystemLogService.php`：

| 字段        | 类型     | 说明                       |
|-------------|----------|----------------------------|
| id          | int      | 主键                       |
| admin_id    | int      | 操作人 ID                  |
| url         | varchar  | 操作页面                   |
| method      | varchar  | 请求方法                   |
| title       | varchar  | 日志标题（控制器 - 方法）  |
| content     | json     | 请求数据（敏感字段已脱敏） |
| response    | json     | 响应结果（截断 3000 字符） |
| ip          | varchar  | IP 地址                    |
| useragent   | varchar  | User-Agent                 |
| create_time | datetime | 操作时间                   |

## 中间件记录

`app/admin/middleware/SystemLog.php` 自动记录操作日志。

## 跳过日志记录

```php
use app\admin\service\annotation\MiddlewareAnnotation;

// 跳过日志记录
#[MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOG)]
public function checkIpAddress(Request $request): void
{
    // 此方法不会记录操作日志
}
```

## 框架日志查看

```php
// app/admin/controller/system/Log.php

#[MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOG)]
public function record(): Json|string
{
    return (new \Wolfcode\PhpLogviewer\thinkphp\LogViewer())->fetch();
}
```

访问地址：`system.log/record`

## 删除历史日志

```php
// app/admin/controller/system/Log.php

public function deleteMonthLog(Request $request)
{
    $monthsAgo = $request->param('month/d', 0);
    // 删除指定月数前的日志表
}
```

## 日志表后缀

使用 `setSuffix()` 方法切换日志表，`$month` 为 `Ym` 格式（如 `202611`）：

```php
$model = $this->model->setSuffix("_$month");
```

## 注意事项

1. 日志按月份自动分表
2. 敏感信息会自动脱敏
3. 使用 `#[MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOG)]` 跳过记录
4. 框架日志使用 `Wolfcode\PhpLogviewer` 查看
