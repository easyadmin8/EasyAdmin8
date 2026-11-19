<?php

namespace app\admin\middleware;

use app\common\traits\JumpTrait;
use app\Request;
use Closure;

/**
 * CSRF 校验中间件
 * 由 .env 的 EASYADMIN.IS_CSRF 开关控制，默认关闭以兼容旧行为。
 * 前端 easy-admin.js 已在请求头中携带 X-CSRF-TOKEN。
 */
class Csrf
{
    use JumpTrait;

    public function handle(Request $request, Closure $next)
    {
        if (!env('EASYADMIN.IS_CSRF', false)) {
            return $next($request);
        }
        if (in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true)) {
            return $next($request);
        }

        $token = (string)$request->header('X-CSRF-TOKEN', '');
        if ($token === '') {
            $token = (string)$request->param('__token__', '');
        }

        if ($token === '' || !hash_equals(csrf_token(), $token)) {
            $this->error('CSRF 校验失败，请刷新页面后重试');
        }

        return $next($request);
    }
}
