<?php

namespace app\admin\service;

use app\admin\model\SystemUploadfile;
use OSS\Core\OssException;
use OSS\Credentials\StaticCredentialsProvider;
use OSS\OssClient;
use think\facade\Env;
use think\file\UploadedFile;
use think\helper\Str;
use Qcloud\Cos\Client;
use Exception;
use Qiniu\Storage\UploadManager;
use Qiniu\Auth;

class UploadService
{
    /**
     * 无论配置如何，都不允许上传的后缀（避免落到 public/storage 被解析执行）
     * @var array
     */
    private const DANGEROUS_EXT = [
        'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar', 'pht',
        'shtml', 'shtm', 'jsp', 'jspx', 'asp', 'aspx', 'cer', 'asa', 'cgi',
        'pl', 'py', 'sh', 'bash', 'exe', 'bat', 'cmd', 'com', 'vbs', 'htaccess',
    ];

    public static ?UploadService $_instance = null;
    protected array              $options   = [];
    private array                $saveData;

    /**
     * 校验是否为危险可执行后缀
     * @param UploadedFile $file
     * @return bool
     */
    protected function isDangerousFile(UploadedFile $file): bool
    {
        return in_array(strtolower($file->extension()), self::DANGEROUS_EXT, true);
    }

    public static function instance(): ?UploadService
    {
        if (!static::$_instance) static::$_instance = new static();
        return static::$_instance;
    }

    /**
     * @param array $options
     * @return $this
     */
    public function setConfig(array $options = []): UploadService
    {
        $this->options = $options;
        return $this;
    }

    /**
     * @return array
     */
    public function getConfig(): array
    {
        return $this->options;
    }

    /**
     * @param UploadedFile $file
     * @param string $base_path
     * @return string
     */
    protected function setFilePath(UploadedFile $file, string $base_path = ''): string
    {
        $path = date('Ymd') . '/' . Str::random(3) . time() . Str::random() . '.' . $file->extension();
        return $base_path . $path;
    }

    /**
     * @param UploadedFile $file
     * @return UploadService
     */
    protected function setSaveData(UploadedFile $file): static
    {
        $options        = $this->options;
        $data           = [
            'upload_type'   => $options['upload_type'],
            'original_name' => $file->getOriginalName(),
            'mime_type'     => $file->getMime(),
            'file_size'     => $file->getSize(),
            'file_ext'      => strtolower($file->extension()),
            'create_time'   => date('Y-m-d H:i:s'),
        ];
        $this->saveData = $data;
        return $this;
    }

    /**
     * 本地存储
     *
     * @param UploadedFile $file
     * @param string $type
     * @return array
     */
    public function local(UploadedFile $file, string $type = ''): array
    {
        if (!$file->isValid()) {
            return ['code' => 0, 'data' => '上传失败'];
        }
        if ($this->isDangerousFile($file)) {
            return ['code' => 0, 'data' => '不允许上传该类型文件'];
        }
        $base_path = '/storage/' . date('Ymd') . '/';
        // 上传文件的目标文件夹
        $destinationPath = public_path() . $base_path;
        $this->setSaveData($file);
        // 将文件移动到目标文件夹中
        $move = $file->move($destinationPath, Str::random(3) . time() . Str::random() . '.' . $file->extension());
        $url  = $base_path . $move->getFilename();
        $data = ['url' => $url];
        $this->save($url);
        return ['code' => 1, 'data' => $data];
    }

    /**
     * 阿里云OSS
     *
     * @param UploadedFile $file
     * @param string $type
     * @return array
     */
    public function oss(UploadedFile $file, string $type = ''): array
    {
        $config          = $this->getConfig();
        $accessKeyId     = $config['oss_access_key_id'];
        $accessKeySecret = $config['oss_access_key_secret'];
        $endpoint        = $config['oss_endpoint'];
        $bucket          = $config['oss_bucket'];
        // 升级 aliyuncs/oss-sdk-php 到 v2.7.2 以上, 使用签名 v4 版本
        // 直接使用静态凭证，避免 putenv 污染进程环境变量
        $region   = str_replace(['http://oss-', 'https://oss-', 'oss-'], '', explode('.aliyuncs.com', $endpoint)[0] ?? '');
        $provider = new StaticCredentialsProvider($accessKeyId, $accessKeySecret);
        $args     = [
            "provider"         => $provider,
            "endpoint"         => $endpoint,
            "signatureVersion" => OssClient::OSS_SIGNATURE_VERSION_V4,
            "region"           => $region
        ];
        if ($file->isValid()) {
            if ($this->isDangerousFile($file)) return ['code' => 0, 'data' => '不允许上传该类型文件'];
            $object = $this->setFilePath($file, Env::get('EASYADMIN.OSS_STATIC_PREFIX', 'easyadmin8') . '/');
            try {
                $ossClient       = new OssClient($args);
                $_rs             = $ossClient->putObject($bucket, $object, file_get_contents($file->getRealPath()));
                $oss_request_url = $_rs['oss-request-url'] ?? '';
                if (empty($oss_request_url)) return ['code' => 0, 'data' => '上传至OSS失败'];
                $oss_request_url = str_replace('http://', 'https://', $oss_request_url);
                $this->setSaveData($file);
            } catch (OssException $e) {
                return ['code' => 0, 'data' => $e->getMessage()];
            }
            $data = ['url' => $oss_request_url];
            $this->save($oss_request_url);
            return ['code' => 1, 'data' => $data];
        }
        $data = '上传失败';
        return ['code' => 0, 'data' => $data];
    }

    /**
     * 腾讯云cos
     *
     * @param UploadedFile $file
     * @param string $type
     * @return array
     */
    public function cos(UploadedFile $file, string $type = ''): array
    {
        $config    = $this->getConfig();
        $secretId  = $config['cos_secret_id'];              //替换为用户的 secretId，请登录访问管理控制台进行查看和管理，https://console.cloud.tencent.com/cam/capi
        $secretKey = $config['cos_secret_key'];             //替换为用户的 secretKey，请登录访问管理控制台进行查看和管理，https://console.cloud.tencent.com/cam/capi
        $region    = $config['cos_region'];                 //替换为用户的 region，已创建桶归属的region可以在控制台查看，https://console.cloud.tencent.com/cos5/bucket
        if ($file->isValid()) {
            if ($this->isDangerousFile($file)) return ['code' => 0, 'data' => '不允许上传该类型文件'];
            $cosClient = new Client(
                [
                    'region'      => $region,
                    'schema'      => 'http',
                    'credentials' => ['secretId' => $secretId, 'secretKey' => $secretKey,
                    ],
                ]);
            try {
                $object   = $this->setFilePath($file, Env::get('EASYADMIN.OSS_STATIC_PREFIX', 'easyadmin8') . '/');
                $result   = $cosClient->upload(
                    $config['cos_bucket'],         //存储桶名称，由BucketName-Appid 组成，可以在COS控制台查看 https://console.cloud.tencent.com/cos5/bucket
                    $object,                       //此处的 key 为对象键
                    file_get_contents($file->getRealPath())
                );
                $location = $result['Location'] ?? '';
                if (empty($location)) return ['code' => 0, 'data' => '上传至COS失败'];
                $location = 'https://' . $location;
                $this->setSaveData($file);
            }catch (Exception $e) {
                return ['code' => 0, 'data' => $e->getMessage()];
            }
            $data = ['url' => $location];
            $this->save($location);
            return ['code' => 1, 'data' => $data];
        }
        $data = '上传失败';
        return ['code' => 0, 'data' => $data];
    }

    /**
     * 七牛云
     *
     * @param UploadedFile $file
     * @param string $type
     * @return array
     * @throws Exception
     */
    public function qnoss(UploadedFile $file, string $type = ''): array
    {
        if (!$file->isValid()) return ['code' => 0, 'data' => '上传验证失败'];
        if ($this->isDangerousFile($file)) return ['code' => 0, 'data' => '不允许上传该类型文件'];
        $uploadMgr = new UploadManager();
        $config    = $this->getConfig();
        $accessKey = $config['qnoss_access_key'];
        $secretKey = $config['qnoss_secret_key'];
        $bucket    = $config['qnoss_bucket'];
        $domain    = $config['qnoss_domain'];
        $auth      = new Auth($accessKey, $secretKey);
        $token     = $auth->uploadToken($bucket);
        $object    = $this->setFilePath($file, Env::get('EASYADMIN.OSS_STATIC_PREFIX', 'easyadmin8') . '/');
        list($ret, $error) = $uploadMgr->putFile($token, $object, $file->getRealPath());
        if (empty($ret)) return ['code' => 0, 'data' => $error->getResponse()->error ?? '上传失败，请检查七牛云相关参数配置'];
        $url  = $domain . "/" . $ret['key'];
        $data = ['url' => $url];
        $this->setSaveData($file);
        $this->save($url);
        return ['code' => 1, 'data' => $data];
    }

    protected function save(string $url = ''): bool
    {
        $data                = $this->saveData;
        $data['url']         = $url;
        $data['upload_time'] = date('Y-m-d H:i:s');
        return (new SystemUploadfile())->save($data);
    }
}
