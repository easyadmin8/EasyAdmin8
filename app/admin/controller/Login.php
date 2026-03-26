<?php

namespace app\admin\controller;

use app\admin\model\SystemAdmin;
use app\common\controller\AdminController;
use app\common\utils\Helper;
use think\db\exception\DataNotFoundException;
use think\db\exception\DbException;
use think\db\exception\ModelNotFoundException;
use app\Request;
use think\Response;
use Webman\Captcha\CaptchaBuilder;
use Webman\Captcha\PhraseBuilder;
use Wolfcode\RateLimiting\Attributes\RateLimitingMiddleware;

class Login extends AdminController
{

    protected bool $ignoreLogin = true;

    public function initialize(): void
    {
        parent::initialize();
        $action = $this->request->action();
        if (!empty($this->adminUid) && !in_array($action, ['out'])) {
            $adminModuleName = config('admin.alias_name');
            $this->success('已登录，无需再次登录', [], __url("@{$adminModuleName}"));
        }
    }

    /**
     * 用户登录
     * @param Request $request
     * @return string
     * @throws DataNotFoundException
     * @throws DbException
     * @throws ModelNotFoundException
     */
    #[RateLimitingMiddleware(key: [Helper::class, 'getIp'], seconds: 1, limit: 1, message: '请求过于频繁')]
    public function index(Request $request): string
    {
        $captcha = env('EASYADMIN.CAPTCHA', 1);
        if (!$request->isPost()) return $this->fetch('', compact('captcha'));
        $post = $request->post();
        $rule = [
            'username|用户名'         => 'require',
            'password|密码'           => 'require',
            'keep_login|是否保持登录' => 'require',
        ];
        if ($captcha) {
            $_captcha = $request->post('captcha');
            if (strtolower($_captcha) !== session('captcha')) {
                $this->error('输入的验证码不正确');
            }
        }
        $this->validate($post, $rule);
        $admin = SystemAdmin::where(['username' => $post['username']])->find();
        if (empty($admin)) {
            $this->error('用户 | 密码错误');
        }
        if (!password_verify($post['password'], $admin->password)) {
            $this->error('用户 | 密码错误');
        }
        if ($admin->status == 0) {
            $this->error('账号已被禁用');
        }
        if ($admin->login_type == 2) {
            if (empty($post['ga_code'])) $this->error('请输入谷歌验证码', ['is_ga_code' => true]);
            $ga = new \Wolfcode\Authenticator\google\PHPGangstaGoogleAuthenticator();
            if (!$ga->verifyCode($admin->ga_secret, $post['ga_code'])) $this->error('谷歌验证码错误');;
        }
        $admin->login_num += 1;
        $admin->save();
        $admin = $admin->toArray();
        unset($admin['password']);
        $admin['expire_time'] = $post['keep_login'] == 1 ? 0 : time() + 7200;
        session('admin', $admin);
        $this->success('登录成功');
    }

    /**
     * 用户退出
     */
    public function out(): void
    {
        session('admin', null);
        $this->success('退出登录成功');
    }

    /**
     * 验证码
     * @return Response
     */
    public function captcha(): Response
    {
        // 验证码规则 4位纯数字（可以自己添加英文字母）
        $builder = new PhraseBuilder(4, '0123456789');
        $captcha = new CaptchaBuilder(null, $builder);
        $captcha->build();
        session('captcha', strtolower($captcha->getPhrase()));
        $img_content = $captcha->get();
        return response($img_content, 200, ['Content-Type' => 'image/jpeg']);
    }
}
