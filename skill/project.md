# EasyAdmin8 ThinkPHP 项目介绍

## 项目概述

`EasyAdmin8` 是基于 `EasyAdmin` 重构的后台管理系统，使用 `ThinkPHP 8.1+` 和 `Layui 2.x` 构建。

- 官网：http://easyadmin8.top
- 演示：http://thinkphp.easyadmin8.top/admin
- PHP 版本要求：>= 8.2
- 数据库：MySQL >= 5.7

## 技术栈

| 技术     | 版本   | 说明         |
|----------|--------|--------------|
| PHP      | >= 8.2 | 服务端语言   |
| ThinkPHP | 8.1+   | PHP 框架     |
| Layui    | 2.x    | 前端 UI 框架 |
| MySQL    | >= 5.7 | 数据库       |

## 项目特性

- **快速 CURD 命令行**：一键生成控制器、模型、视图、JS 文件
- **权限管理**：基于注解的 auth 权限节点管理
- **菜单管理**：分模块、无限极菜单
- **前端组件**：封装 form、table、弹窗、上传等组件
- **操作日志**：按月分表记录
- **后台路径自定义**：防止被猜解

## 目录结构

```
├── app/                # 应用目录
│   ├── admin/          # 后台应用
│   ├── api/            # API 应用
│   └── common/         # 公共文件
├── config/             # 配置目录
├── public/             # 对外访问目录
├── route/              # 路由定义
├── view/               # 视图目录
├── skill/              # AI 技能文档
├── think               # 命令行入口
└── composer.json       # 依赖配置
```

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://gitee.com/EasyAdmin8/EasyAdmin8

# 安装依赖
composer install --ignore-platform-reqs

# 复制环境配置 修改数据库配置
cp .example.env .env
```

### 生成 CURD

```bash
# 生成表的 CRUD
php think curd -t 表名

# 查看所有可用命令
php think
```

## 相关文档

- ThinkPHP 8.1：https://doc.thinkphp.cn
- Layui 2.x：https://layui.dev/docs
- EasyAdmin8：https://edocs.easyadmin8.top

## 其他版本

| 框架     | GitHub                                                                 | Gitee                                                                 |
|----------|------------------------------------------------------------------------|-----------------------------------------------------------------------|
| ThinkPHP | [EasyAdmin8](https://github.com/EasyAdmin8/EasyAdmin8)                 | [EasyAdmin8](https://gitee.com/EasyAdmin8/EasyAdmin8)                 |
| Laravel  | [EasyAdmin8-Laravel](https://github.com/EasyAdmin8/EasyAdmin8-Laravel) | [EasyAdmin8-Laravel](https://gitee.com/EasyAdmin8/EasyAdmin8-Laravel) |
| webman   | [EasyAdmin8-webman](https://github.com/EasyAdmin8/EasyAdmin8-webman)   | [EasyAdmin8-webman](https://gitee.com/EasyAdmin8/EasyAdmin8-webman)   |
