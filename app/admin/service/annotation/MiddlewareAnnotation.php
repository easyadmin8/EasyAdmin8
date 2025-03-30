<?php

namespace app\admin\service\annotation;

use Attribute;

#[Attribute(Attribute::IS_REPEATABLE | Attribute::TARGET_METHOD)]
final class MiddlewareAnnotation
{
    /** 过滤日志 */
    const IGNORE_LOG = 'LOG';

    /** 免登录 */
    const IGNORE_LOGIN = 'LOGIN';

    public function __construct(public string $type = '', public string|array $ignore = '')
    {
    }
}