# 模型基础

## TimeModel

`app/common/model/TimeModel.php`:

```php
class TimeModel extends Model
{
    use SoftDelete;

    protected function getOptions(): array
    {
        return [
            'autoWriteTimestamp' => 'datetime',
            'createTime'         => 'create_time',
            'updateTime'         => 'update_time',
            'deleteTime'         => false, // 默认不启用软删除
        ];
    }
}
```

## 创建模型

```php
<?php
namespace app\admin\model;

use app\common\model\TimeModel;

class MallGoods extends TimeModel
{
    protected $name = 'mall_goods';

    // 启用软删除（TimeModel 默认 deleteTime=false）
    protected function getOptions(): array
    {
        return array_merge(parent::getOptions(), [
            'deleteTime' => 'delete_time',
        ]);
    }

    // 关联分类
    public function cate()
    {
        return $this->belongsTo(MallCate::class, 'cate_id');
    }
}
```

## 关联查询

```php
// 关联预载入
$list = $this->model->with(['cate'])->select();

// 关联统计
$count = $this->model->withCount('orders')->select();
```

## 软删除

```php
// 模型中启用（think-orm 4.x 通过 getOptions 配置）
protected function getOptions(): array
{
    return array_merge(parent::getOptions(), [
        'deleteTime' => 'delete_time',
    ]);
}

// 查询时包含已删除
$model->withTrashed()->find($id);

// 仅查询已删除
$model->onlyTrashed()->select();

// 恢复（先查出已软删除的实例）
$row = $model->withTrashed()->find($id);
$row->restore();

// 真正删除
$model->destroy($id, true);
```

## CURD 操作

```php
// 新增
$model = MallGoods::create($data);

// 修改
$row = $model->find($id);
$row->save($data);

// 删除
$row->delete();

// 批量删除
$model->whereIn('id', $ids)->delete();

// 查询
$count = $model->where($where)->count();
$list = $model->where($where)->page($page, $limit)->select()->toArray();
```

## 命名规范

- 模型名：大驼峰（`MallGoods`）
- 表名：小写下划线前缀（`ea8_mall_goods`）
- 文件名：与类名一致（`MallGoods.php`）

## 注意事项

1. 继承 `TimeModel` 自动支持 datetime 时间字段
2. 在 `getOptions()` 中设置 `deleteTime` 启用软删除
3. 使用 `setSuffix()` 支持分表（如日志表）


## ThinkPHP 文档
[ThinkPHP 官方文档](https://doc.thinkphp.cn/v8_0/orm.html)
