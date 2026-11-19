# 文件上传

## 上传接口

统一上传接口：`ajax/upload`

```php
// Ajax.php
public function upload(Request $request): Json|null
{
    $type = $request->param('type', '');
    $data = [
        'upload_type' => $request->post('upload_type'),
        'file' => $request->file($type == 'editor' ? 'upload' : 'file'),
    ];
    // ...
}
```

## 上传配置

配置保存在 `system_config` 表中，通过 `sysConfig('upload')` 读取（后台“系统配置” → “上传配置”）：

- `upload_type`: local / oss / cos / qnoss
- `upload_allow_ext`: 允许的文件扩展名
- `upload_allow_size`: 最大文件大小
- `upload_allow_type`: 允许的上传类型（保存上传配置时会根据 `config('admin.upload_types')` 自动生成，无需手动维护）

## 本地存储

```php
// UploadService.php
public function local(UploadedFile $file, string $type = ''): array
{
    $base_path = '/storage/' . date('Ymd') . '/';
    $destinationPath = public_path() . $base_path;
    $move = $file->move($destinationPath, Str::random(3) . time() . Str::random() . '.' . $file->extension());
    $url = $base_path . $move->getFilename();
    // ...
    return ['code' => 1, 'data' => ['url' => $url]];
}
```

## 阿里云 OSS

后台“上传配置”中的配置项（`sysConfig('upload')`）：

- `oss_access_key_id`：AccessKeyId
- `oss_access_key_secret`：AccessKeySecret
- `oss_endpoint`：如 `https://oss-cn-hangzhou.aliyuncs.com`
- `oss_bucket`：Bucket 名称

对象键前缀在 `.env` 中配置：

```env
[EASYADMIN]
OSS_STATIC_PREFIX=easyadmin8
```

## 腾讯云 COS

后台“上传配置”中的配置项（`sysConfig('upload')`）：

- `cos_secret_id`
- `cos_secret_key`
- `cos_region`：如 `ap-guangzhou`
- `cos_bucket`

## 七牛云

后台“上传配置”中的配置项（`sysConfig('upload')`）：

- `qnoss_access_key`
- `qnoss_secret_key`
- `qnoss_bucket`
- `qnoss_domain`：如 `https://xxx.com`

## 前端使用

```javascript
layui.use(['upload'], function() {
    var upload = layui.upload;
    
    upload.render({
        elem: '#uploadBtn',
        url: '/admin/ajax/upload',
        done: function(res) {
            if (res.code === 1) {
                console.log(res.data.url);
            }
        }
    });
});
```

## 编辑器上传

wangEditor（项目使用 v5，非 v3 的 `customConfig`）：

```javascript
const editor = window.wangEditor.createEditor({
    selector: '#editor',
    html: '',
    config: {
        MENU_CONF: {
            uploadImage: {
                server: window.CONFIG.ADMIN_UPLOAD_URL, // ajax/upload
                fieldName: 'file',
                maxFileSize: window.CONFIG.MAX_FILE_SIZE,
                customInsert(res, insertFn) {
                    if (res.code !== 1) {
                        layer.msg(res.msg || '上传失败', {icon: 2});
                        return;
                    }
                    insertFn(res.data.url, '', '');
                },
            },
        },
    },
});
```

UEditor 配置：

```php
// Ajax.php - uploadUEditor 方法
public function uploadUEditor(Request $request): Json
{
    $action = $request->param('action/s', '');
    // action: image / attachment / video / listImage
}
```
