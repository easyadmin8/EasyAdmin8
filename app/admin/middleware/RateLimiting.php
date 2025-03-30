<?php

namespace app\admin\middleware;

use app\common\traits\JumpTrait;
use app\Request;
use Closure;
use Wolfcode\RateLimiting\Bootstrap;

class RateLimiting
{
    use JumpTrait;

    /**
     * 启用限流器需要开启Redis
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): mixed
    {
        // 是否启用限流器
        if (!env('RATE_LIMITING_STATUS', false)) return $next($request);
        if ($request->method() == 'GET') return $next($request);
        $controller      = $request->controller();
        $module          = app('http')->getName();
        $appNamespace    = config('app.app_namespace');
        $controllerClass = "app\\{$module}\\controller\\{$controller}{$appNamespace}";
        $controllerClass = str_replace('.', '\\', $controllerClass);
        $action          = $request->action();
        try {
            Bootstrap::init($controllerClass, $action, [
                # Redis 相关配置
                'host'     => env('REDIS_HOST', '127.0.0.1'),
                'port'     => (int)env('REDIS_PORT', 6379),
                'password' => env('REDIS_PASSWORD', ''),
                'prefix'   => env('REDIS_PREFIX', ''),
                'database' => (int)env('REDIS_DATABASE', 0),
            ]);
        }catch (\Throwable $exception) {
            $this->error($exception->getMessage());
        }
        return $next($request);
    }
}