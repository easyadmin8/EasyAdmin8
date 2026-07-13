# PHP 8 注解使用

## 三种注解

| 注解                   | 位置       | 作用                         |
|------------------------|------------|------------------------------|
| `ControllerAnnotation` | 控制器类   | 控制器标题、权限开关         |
| `NodeAnnotation`       | 控制器方法 | 方法标题、权限开关、节点过滤 |
| `MiddlewareAnnotation` | 控制器方法 | 跳过登录验证、跳过日志记录   |

## ControllerAnnotation

```php
#[ControllerAnnotation(title: '商城商品管理', auth: true)]
class Goods extends AdminController
{
    // ...
}
```

- `title`: 控制器标题
- `auth`: 是否需要权限验证（默认 true）
- `ignore`: 过滤的节点

## NodeAnnotation

```php
// 需要权限验证
#[NodeAnnotation(title: '列表', auth: true)]
public function index(Request $request): Json|string
{
    // ...
}

// 不需要权限验证
#[NodeAnnotation(title: 'AI优化', auth: true)]
public function aiOptimization(Request $request): void
{
    // ...
}

// 过滤某些节点不生成
#[NodeAnnotation(ignore: ['export'])]
protected array $ignoreNode;
```

### ignoreNode 常量

```php
#[NodeAnnotation(title: '框架日志', auth: true, ignore: NodeAnnotation::IGNORE_NODE)]
public function record(): Json|string
{
    // IGNORE_NODE = 'NODE'
    // 此方法不生成权限节点
}
```

## MiddlewareAnnotation

### 跳过登录验证

```php
#[MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOGIN)]
public function no_check_login(Request $request): string
{
    return '不需要登录验证';
}
```

### 跳过操作日志记录

```php
#[MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOG)]
public function checkIpAddress(Request $request): void
{
    // IGNORE_LOG = 'LOG'
    // 此方法不记录操作日志
}
```

### 组合使用

```php
#[
    MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOG),
    NodeAnnotation(title: '框架日志', auth: true, ignore: NodeAnnotation::IGNORE_NODE),
]
public function record(): Json|string
{
    // 同时跳过日志记录和节点生成
}
```

## 常量说明

```php
// MiddlewareAnnotation
MiddlewareAnnotation::IGNORE_LOG   = 'LOG';   // 跳过日志记录
MiddlewareAnnotation::IGNORE_LOGIN = 'LOGIN'; // 跳过登录验证

// NodeAnnotation
NodeAnnotation::IGNORE_NODE = 'NODE'; // 跳过节点生成
```

## 权限验证流程

1. 请求到达控制器方法
2. `CheckAuth` 中间件检查当前节点
3. 查找方法上的 `#[NodeAnnotation]` 注解
4. 如果 `auth: false`，跳过权限验证
5. 如果在 `no_auth_controller` 或 `no_auth_node` 列表，跳过验证

## 配置文件

`config/admin.php`:

```php
return [
    // 不需要权限验证的控制器
    'no_auth_controller' => ['ajax', 'login', 'index'],
    
    // 不需要权限验证的节点
    'no_auth_node' => ['login/index', 'login/out'],
];
```
