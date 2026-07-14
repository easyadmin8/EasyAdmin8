<?php

namespace app\common\traits;

use think\exception\HttpResponseException;
use think\Response;
use think\response\Json;

/**
 * Trait JumpTrait
 * @package app\common\traits
 */
trait JumpTrait
{

    /**
     * 操作成功跳转的快捷方法
     * @access protected
     * @param string|null $msg 提示信息
     * @param mixed|string $data 返回的数据
     * @param string|null $url 跳转的 URL 地址
     * @param int $wait 跳转等待时间
     * @param array $header 发送的 Header 信息
     * @return void
     */
    protected function success(?string $msg = 'success', mixed $data = '', ?string $url = null, int $wait = 3, array $header = []): void
    {
        if (is_null($url)) {
            $url = app()->request->server('HTTP_REFERER');
        }elseif ($url) {
            $url = (strpos($url, '://') || str_starts_with($url, '/')) ? $url : app('route')->buildUrl($url)->__toString();
        }
        $result = [
            'code'      => 1,
            'msg'       => $msg,
            'data'      => $data,
            'url'       => $url,
            'wait'      => $wait,
            '__token__' => request()->buildToken('__token__'),
        ];

        $type = $this->getResponseType();
        if ($type == 'html') {
            $response = view(config('app.dispatch_success_tmpl'), $result);
        }else {
            $response = json($result);
        }
        throw new HttpResponseException($response);
    }

    /**
     * 操作错误跳转的快捷方法
     * @access protected
     * @param string|null $msg 提示信息
     * @param mixed $data 返回的数据
     * @param string|null $url 跳转的 URL 地址
     * @param int $wait 跳转等待时间
     * @return void
     */
    protected function error(?string $msg = 'error', mixed $data = '', ?string $url = null, int $wait = 3): void
    {
        if (is_null($url)) {
            $url = request()->isAjax() ? '' : 'javascript:history.back(-1);';
        }elseif ($url) {
            $url = (strpos($url, '://') || str_starts_with($url, '/')) ? $url : app('route')->buildUrl($url)->__toString();
        }

        $type   = $this->getResponseType();
        $result = [
            'code'      => 0,
            'msg'       => $msg,
            'data'      => $data,
            'url'       => $url,
            'wait'      => $wait,
            '__token__' => request()->buildToken('__token__'),
        ];
        if ($type == 'html') {
            $response = view(config('app.dispatch_error_tmpl'), $result);
        }else {
            $response = json($result);
        }
        throw new HttpResponseException($response);
    }

    /**
     * 返回封装后的 API 数据到客户端
     * @access protected
     * @param mixed $data 要返回的数据
     * @param int $code 返回的 code
     * @param string|null $msg 提示信息
     * @param string $type 返回数据格式
     * @param array $header 发送的 Header 信息
     * @return void
     */
    protected function result(mixed $data, int $code = 0, ?string $msg = '', string $type = '', array $header = []): void
    {
        $result   = [
            'code' => $code,
            'msg'  => $msg,
            'time' => time(),
            'data' => $data,
        ];
        $type     = $type ?: $this->getResponseType();
        $response = Response::create($result, $type)->header($header);
        throw new HttpResponseException($response);
    }

    /**
     * URL 重定向
     * @access protected
     * @param string $url 跳转的 URL 表达式
     * @param int $code http code
     * @return void
     * @throws HttpResponseException
     */
    protected function redirect(string $url = '', int $code = 302): void
    {
        $response = Response::create($url, 'redirect', $code);
        throw new HttpResponseException($response);
    }

    /**
     * 获取当前的 response 输出类型
     * @access protected
     * @return string
     */
    protected function getResponseType(): string
    {
        return (request()->isJson() || request()->isAjax() || request()->isPost()) ? 'json' : 'html';
    }

    /**
     * JSON 格式返回数据 主要是给前端ajax请求返回数据
     * @param object|array $data
     * @param int|string $count
     * @param string $msg
     * @param int $code
     * @return Json
     */
    protected function jsonSuccess(object|array $data, int|string $count, string $msg = 'success', int $code = 0): Json
    {
        return json(compact('code', 'msg', 'data', 'count'));
    }

}
