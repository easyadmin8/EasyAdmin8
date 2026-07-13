# 响应方法

## JumpTrait

`app/common/traits/JumpTrait.php` 提供统一的响应方法：

```php
trait JumpTrait
{
    protected function success(?string $msg = null, mixed $data = '', ?string $url = null, int $wait = 3, array $header = []): void;
    protected function error(?string $msg = null, mixed $data = '', ?string $url = null, int $wait = 3): void;
    protected function result(mixed $data, int $code = 0, ?string $msg = '', string $type = '', array $header = []): void;
    protected function redirect(string $url = '', int $code = 302): void;
}
```

## success()

```php
// 简单成功
$this->success('操作成功');

// 带数据
$this->success('操作成功', ['id' => 1]);

// 带跳转地址
$this->success('操作成功', '', 'index/index');

// 带等待时间
$this->success('操作成功', '', '', 5);
```

## error()

```php
// 简单错误
$this->error('操作失败');

// 带数据
$this->error('操作失败', ['field' => '字段验证失败']);

// 带跳转地址
$this->error('操作失败', '', 'javascript:history.back(-1);');
```

## result()

```php
// 自定义 code
$this->result($data, 1, 'success');

// JSON 响应
$this->result($data, 0, 'error', 'json');
```

## redirect()

```php
// 重定向
$this->redirect('index/index');

// 301 永久重定向
$this->redirect('https://example.com', 301);
```

## 响应格式

```json
// 成功
{
    "code": 1,
    "msg": "操作成功",
    "data": {},
    "url": "",
    "wait": 3,
    "__token__": "xxx"
}

// 错误
{
    "code": 0,
    "msg": "操作失败",
    "data": "",
    "url": "javascript:history.back(-1);",
    "wait": 3,
    "__token__": "xxx"
}
```

## 判断响应类型

```php
// 自动判断返回类型
protected function getResponseType(): string
{
    return (request()->isJson() || request()->isAjax() || request()->isPost()) ? 'json' : 'html';
}
```

## 注意事项

1. `success()` 和 `error()` 会抛出 `HttpResponseException`
2. Ajax 请求返回 JSON，普通请求返回 HTML
3. `__token__` 用于 CSRF 防护
