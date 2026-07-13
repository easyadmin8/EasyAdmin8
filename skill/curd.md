# CURD 命令生成

EasyAdmin8 内置快速生成 CURD 的命令，可一键生成控制器、模型、视图、JS 文件。

## 基本用法

```bash
# 生成表的 CURD
php think curd -t 表名

# 强制覆盖模式
php think curd -t 表名 -f 1

# 删除生成的 CURD 文件
php think curd -t 表名 -d 1
```

## 参数说明

| 短参数 | 长参数                    | 说明                   |
|--------|---------------------------|------------------------|
| `-t`   | `--table`                 | 主表名（必填）         |
| `-c`   | `--controllerFilename`    | 控制器文件名           |
| `-m`   | `--modelFilename`         | 主表模型文件名         |
| `-f`   | `--force`                 | 强制覆盖模式           |
| `-d`   | `--delete`                | 删除模式               |
| `-r`   | `--relationTable`         | 关联表名               |
|        | `--foreignKey`            | 关联外键               |
|        | `--primaryKey`            | 关联主键               |
|        | `--checkboxFieldSuffix`   | 复选框字段后缀         |
|        | `--radioFieldSuffix`      | 单选框字段后缀         |
|        | `--imageFieldSuffix`      | 单图片字段后缀         |
|        | `--imagesFieldSuffix`     | 多图片字段后缀         |
|        | `--fileFieldSuffix`       | 单文件字段后缀         |
|        | `--filesFieldSuffix`      | 多文件字段后缀         |
|        | `--dateFieldSuffix`       | 时间字段后缀           |
|        | `--switchFields`          | 开关字段               |
|        | `--selectFields`          | 下拉字段               |
|        | `--editorFields`          | 富文本字段             |
|        | `--sortFields`            | 排序字段               |
|        | `--ignoreFields`          | 忽略的字段             |
|        | `--relationModelFilename` | 关联模型文件名         |
|        | `--relationOnlyFields`    | 关联表只显示的字段     |
|        | `--relationBindSelect`    | 关联表字段用于下拉选择 |

## 常用示例

### 基础生成

```bash
# 生成 test_goods 表的 CURD
php think curd -t test_goods

# 生成到指定控制器目录
php think curd -t test_goods -c demo/Goods

# 生成到指定模型目录
php think curd -t test_goods -m demo/Goods
```

### 字段类型设置

```bash
# 设置 logo 字段为单图片上传
php think curd -t test_goods --imageFieldSuffix=logo

# 设置 images 字段为多图片上传
php think curd -t test_goods --imagesFieldSuffix=images

# 设置 content 字段为富文本编辑器
php think curd -t test_goods --editorFields=content

# 设置 status 字段为开关
php think curd -t test_goods --switchFields=status

# 设置 sort 字段为排序
php think curd -t test_goods --sortFields=sort

# 忽略某些字段
php think curd -t test_goods --ignoreFields=remark --ignoreFields=stock
```

### 关联表设置

```bash
# 关联 test_cate 表，设置外键为 cate_id
php think curd -t test_goods -r test_cate --foreignKey=cate_id --primaryKey=id

# 关联表只显示 title, image 字段
php think curd -t test_goods -r test_cate --foreignKey=cate_id --relationOnlyFields=title,image

# 关联表字段用于主表下拉选择
php think curd -t test_goods -r test_cate --foreignKey=cate_id --relationBindSelect=title
```

### 组合示例

```bash
# 完整示例：生成商品表 CURD，关联分类表，设置多种字段类型
php think curd -t test_goods \
  -r test_cate \
  --foreignKey=cate_id \
  --primaryKey=id \
  --relationBindSelect=title \
  --imageFieldSuffix=logo \
  --imagesFieldSuffix=photos \
  --editorFields=content \
  --switchFields=status \
  --sortFields=sort
```

## 数据表字段规范

字段名会自动识别为对应的表单组件：

| 字段名/后缀        | 渲染组件   | 说明                           |
|--------------------|------------|--------------------------------|
| `id`               | 文本       | 主键，自动隐藏                 |
| `weigh`            | 文本       | 排序字段，自动隐藏             |
| `create_time`      | 时间       | 自动识别                       |
| `update_time`      | 时间       | 自动识别                       |
| `*` + `{radio}`    | 单选框     | 注释格式：`(1:选项1, 2:选项2)` |
| `*` + `{select}`   | 下拉框     | 注释格式：`(1:选项1, 2:选项2)` |
| `*` + `{checkbox}` | 复选框     | 注释格式：`(1:选项1, 2:选项2)` |
| `*image`           | 单图上传   | 字段后缀为 image               |
| `*images`          | 多图上传   | 字段后缀为 images              |
| `*file`            | 单文件上传 | 字段后缀为 file                |
| `*files`           | 多文件上传 | 字段后缀为 files               |
| `*switch`          | 开关       | 字段后缀为 switch              |

## 注意事项

1. 表名不需要带前缀，命令会自动添加配置的前缀
2. 使用 `-f 1` 时会提示确认，输入 `yes` 继续
3. 删除操作需要输入 `yes` 确认
4. 关联表设置时，外键和主键需要一一对应
5. 生成后需要在后台添加对应菜单才能访问
