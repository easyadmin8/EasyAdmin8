# 系统配置

## 配置文件

| 文件                  | 说明         |
|-----------------------|--------------|
| `.env`                | 环境变量配置 |
| `app/admin/config/admin.php` | 后台配置 |
| `config/database.php` | 数据库配置   |
| `config/cache.php`    | 缓存配置     |

## .env 核心配置

```env
# 应用
APP_DEBUG=true
APP_ADMIN_SYSTEM_LOG=true
DEFAULT_TIMEZONE=Asia/Shanghai

# 数据库
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_NAME=easyadmin8
DB_USER=root
DB_PASS=your_password
DB_PORT=3306
DB_CHARSET=utf8mb4
DB_PREFIX=ea8_

# AI
DASHSCOPE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=xxx
DASHSCOPE_API_MODEL=qwen-plus

# 后台配置项组（通过 env('EASYADMIN.xxx') 读取）
[EASYADMIN]
ADMIN=admin
CAPTCHA=false
IS_DEMO=false
IS_CSRF=false
STATIC_PATH=/static
OSS_STATIC_PREFIX=static_easyadmin
```

> 上传类型 `upload_type`、编辑器类型 `editor_type` 保存在 `system_config` 表中（后台“系统配置”），不在 `.env` 中配置。

## sysConfig() 函数

读取后台系统配置：

```php
// 获取站点配置
$logoTitle = sysConfig('site', 'logo_title');
$editorType = sysConfig('site', 'editor_type');

// 获取上传配置
$uploadConfig = sysConfig('upload');
$uploadType = $uploadConfig['upload_type'];
$allowExt = $uploadConfig['upload_allow_ext'];

// 获取所有配置
$allConfig = sysConfig('upload');
```

## 后台配置项

### 站点配置

- `site.logo_title` - Logo 标题
- `site.logo_image` - Logo 图片
- `site.editor_type` - 编辑器类型
- `site.iframe_open_top` - iframe 顶部

### 上传配置

- `upload.upload_type` - 上传类型（local/oss/cos/qnoss）
- `upload.upload_allow_ext` - 允许扩展名
- `upload.upload_allow_size` - 最大文件大小
- `upload.upload_allow_type` - 允许类型

## 后台应用配置

`app/admin/config/admin.php`（通过 `config('admin')` 读取）:

```php
return [
    // 后台路径
    'alias_name' => env('EASYADMIN.ADMIN'),

    // 不需要权限验证的控制器
    'no_auth_controller' => ['ajax', 'login', 'index'],

    // 不需要权限验证的节点
    'no_auth_node' => ['login/index', 'login/out'],

    // 上传类型选项
    'upload_types' => [
        'local' => '本地存储',
        'oss'   => '阿里云oss',
        'cos'   => '腾讯云cos',
        'qnoss' => '七牛云',
    ],

    // 编辑器选项
    'editor_types' => [
        'ueditor'    => '百度编辑器(不建议使用)',
        'ckeditor'   => 'CK编辑器',
        'wangEditor' => 'wangEditor(推荐使用)',
        'EasyMDE'    => 'EasyMDE(markdown)',
    ],

    // 登录页模板
    'login_templates' => [
        'index' => '经典卡通(默认)',
        'card'  => '简约卡片',
        'split' => '左右分栏',
        'glass' => '毛玻璃',
        'dark'  => '暗色科技',
    ],
];
```

> `upload_types` / `editor_types` 只是选项列表，实际选中的值分别存在 `upload.upload_type` 和 `site.editor_type` 配置项中。

## 缓存使用

```php
use think\facade\Cache;

// 设置缓存
Cache::set('key', $value, 3600);

// 获取缓存
$value = Cache::get('key');

// 清除缓存
Cache::clear();

// 标签缓存
Cache::tag('initAdmin')->set('key', $value);
```
