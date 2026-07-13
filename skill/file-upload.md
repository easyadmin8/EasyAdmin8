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

在后台"系统配置" → "上传配置"中设置：

- `upload_type`: local / oss / cos / qnoss
- `upload_allow_ext`: 允许的文件扩展名
- `upload_allow_size`: 最大文件大小
- `upload_allow_type`: 允许的上传类型

## 本地存储

```php
// UploadService.php
public function local(UploadedFile $file, string $type = ''): array
{
    $base_path = '/storage/' . date('Ymd') . '/';
    $destinationPath = public_path() . $base_path;
    $move = $file->move($destinationPath, Str::random(3) . time() . Str::random() . session('admin.id') . '.' . $file->extension());
    $url = $base_path . $move->getFilename();
    // ...
}
```

## 阿里云 OSS

```php
// .env
EASYADMIN_OSS_ACCESS_KEY_ID=xxx
EASYADMIN_OSS_ACCESS_KEY_SECRET=xxx
EASYADMIN_OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
EASYADMIN_OSS_BUCKET=xxx
```

## 腾讯云 COS

```php
// .env
EASYADMIN_COS_SECRET_ID=xxx
EASYADMIN_COS_SECRET_KEY=xxx
EASYADMIN_COS_REGION=ap-guangzhou
EASYADMIN_COS_BUCKET=xxx
```

## 七牛云

```php
// .env
EASYADMIN_QNOSS_ACCESS_KEY=xxx
EASYADMIN_QNOSS_SECRET_KEY=xxx
EASYADMIN_QNOSS_BUCKET=xxx
EASYADMIN_QNOSS_DOMAIN=https://xxx.com
```

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

wangEditor 配置：

```javascript
var E = window.wangEditor;
var editor = new E('#editor');
editor.customConfig.uploadImgUrl = '/admin/ajax/upload?type=editor';
editor.create();
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
