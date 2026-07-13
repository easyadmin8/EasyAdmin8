# RBAC 权限

## 数据表

| 表名             | 说明            |
|------------------|-----------------|
| system_admin     | 管理员表        |
| system_auth      | 角色表          |
| system_node      | 节点表          |
| system_auth_node | 角色-节点关联表 |

## 权限验证流程

1. 请求到达 `CheckAuth` 中间件
2. 获取当前用户 ID
3. 判断是否在 `no_auth_controller` 或 `no_auth_node` 列表
4. 调用 `AuthService::checkNode()` 验证权限
5. 检查方法上的 `#[NodeAnnotation]` 注解

## CheckAuth 中间件

`app/admin/middleware/CheckAuth.php`:

```php
public function handle(Request $request, Closure $next)
{
    $adminUserInfo = $request->adminUserInfo;
    if (empty($adminUserInfo)) return $next($request);
    
    $adminConfig = config('admin');
    $adminId = $adminUserInfo['id'];
    $authService = app(AuthService::class, ['adminId' => $adminId]);
    $currentNode = $authService->getCurrentNode();
    $currentController = parse_name($request->controller());
    
    if (!in_array($currentController, $adminConfig['no_auth_controller']) 
        && !in_array($currentNode, $adminConfig['no_auth_node'])) {
        $check = $authService->checkNode($currentNode);
        !$check && $this->error('无权限访问');
    }
    return $next($request);
}
```

## AuthService

`app/common/service/AuthService.php`:

```php
// 检查节点权限
$authService = new AuthService($adminId);
$hasPermission = $authService->checkNode('admin/goods/index');

// 获取当前节点
$currentNode = $authService->getCurrentNode();

// 获取用户所有权限节点
$adminNodes = $authService->getAdminNode();
```

## 超级管理员

ID=1 的管理员自动跳过所有权限验证。

## 节点格式

```
模块/控制器/操作
admin/goods/index
admin/goods/add
```

## 生成节点命令

```bash
php think node:scan
```

## 视图中判断权限

```php
// 全局函数
if (auth('admin/goods/add')) {
    // 有权限
}

// 模板中
{if condition="auth('admin/goods/add')"}
<button>添加</button>
{/if}
```

## 演示模式限制

```php
// CheckAuth.php
if (env('EASYADMIN.IS_DEMO', false) && $request->isPost()) {
    if (!in_array($currentNode, [
        'system.log/record',
        'system.log_analyzer/analyze',
        'mall.goods/aiOptimization',
    ])) $this->error('演示环境下不允许修改');
}
```
