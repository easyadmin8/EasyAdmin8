<?php

namespace app\index\controller;

use app\admin\service\SystemLogService;
use app\BaseController;
use app\common\traits\JumpTrait;
use think\facade\Db;
use think\Request;

class Install extends BaseController
{

    use JumpTrait;

    public function index(Request $request)
    {
        $isInstall   = false;
        $installPath = config_path() . DIRECTORY_SEPARATOR . 'install' . DIRECTORY_SEPARATOR;
        $errorInfo   = null;
        if (is_file($installPath . 'lock' . DIRECTORY_SEPARATOR . 'install.lock')) {
            // 如果你已经成功安装了后台系统 并且不想再次出现安装界面，可以把下面跳转注释取消
            // $this->redirect('/');
            $isInstall = true;
            $errorInfo = '已安装系统，如需重新安装请删除文件：/config/install/lock/install.lock，或者删除 /install 路由';
        } elseif (version_compare(phpversion(), '8.2.0', '<')) {
            $errorInfo = 'PHP版本不能小于8.2.0';
        } elseif (!extension_loaded("PDO")) {
            $errorInfo = '当前未开启PDO，无法进行安装';
        }
        if (!is_file(root_path() . '.env')) {
            $errorInfo = '.env 文件不存在，请先配置 .env 文件';
        }
        if (!$request->isAjax()) {
            $envInfo     = [
                'DB_TYPE'    => $isInstall ? '' : env('DB_TYPE', 'mysql'),
                'DB_HOST'    => $isInstall ? '' : env('DB_HOST', '127.0.0.1'),
                'DB_NAME'    => $isInstall ? '' : env('DB_NAME', 'easyadmin8'),
                'DB_USER'    => $isInstall ? '' : env('DB_USER', 'root'),
                'DB_PASS'    => $isInstall ? '' : env('DB_PASS', 'root'),
                'DB_PORT'    => $isInstall ? '' : env('DB_PORT', 3306),
                'DB_PREFIX'  => $isInstall ? '' : env('DB_PREFIX', 'ea8_'),
                'DB_CHARSET' => $isInstall ? '' : env('DB_CHARSET', 'utf8mb4'),
            ];
            $currentHost = '://';
            $result      = compact('errorInfo', 'currentHost', 'isInstall', 'envInfo');
            return view('index@install/index', $result);
        }
        if ($errorInfo) $this->error($errorInfo);
        $post       = $request->post();
        $charset    = $post['db_charset'];
        $cover      = $post['cover'] == 1;
        $db_type    = $post['db_type'];
        $database   = $post['database'];
        $hostname   = $post['hostname'];
        $hostport   = $post['hostport'];
        $dbUsername = $post['db_username'];
        $dbPassword = $post['db_password'];
        $prefix     = $post['prefix'];
        $adminUrl   = $post['admin_url'];
        $username   = $post['username'];
        $password   = $post['password'] ?: '123456';
        // 参数验证
        $validateError = null;
        // 判断是否有特殊字符
        $check = preg_match('/[0-9a-zA-Z]+$/', $adminUrl, $matches);
        if (!$check) {
            $validateError = '后台地址不能含有特殊字符, 只能包含字母或数字。';
            $this->error($validateError);
        }
        if (strlen($adminUrl) < 2) {
            $validateError = '后台的地址不能小于2位数';
        } elseif (strlen($password) < 5) {
            $validateError = '管理员密码不能小于5位数';
        } elseif (strlen($username) < 4) {
            $validateError = '管理员账号不能小于4位数';
        }
        if (!empty($validateError)) $this->error($validateError);
        $config = [
            "driver"   => $db_type,
            "host"     => $hostname,
            "database" => $database,
            "port"     => $hostport,
            "username" => $dbUsername,
            "password" => $dbPassword,
            "prefix"   => $prefix,
            "charset"  => $charset,
        ];
        // 检测数据库连接
        $this->checkConnect($config);
        // 检测数据库是否存在
        if (!$cover && $this->checkDatabase($database, $config)) $this->error('数据库已存在，请选择覆盖安装或者修改数据库名');
        // 创建数据库
        $this->createDatabase($database, $config);
        // 导入sql语句等等
        $config = array_merge($config, ['database' => $database]);
        $this->install($username, $password, $config);
        session('admin', null);
        SystemLogService::instance()->clearLogCache();
        $this->success('系统安装成功，正在跳转登录页面');
    }

    protected function install(string $username, string $password, array $config): ?bool
    {
        $installPath = config_path() . DIRECTORY_SEPARATOR . 'install' . DIRECTORY_SEPARATOR;
        $driver      = $config['driver'];
        $sqlPath     = match ($driver) {
            'mysql' => file_get_contents($installPath . 'sql' . DIRECTORY_SEPARATOR . 'install.sql'),
            'pgsql' => file_get_contents($installPath . 'sql' . DIRECTORY_SEPARATOR . 'install_pgsql.sql'),
        };
        $sqlArray    = $this->parseSql($sqlPath, $config['prefix'], 'ea_');
        $dsn         = $this->pdoDsn($config, true);
        try {
            $pdo = new \PDO($dsn, $config['username'] ?? 'root', $config['password'] ?? '');
            foreach ($sqlArray as $sql) {
                $pdo->query($sql);
            }
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $tableName      = 'system_admin';
            $update         = [
                'username'    => $username,
                'head_img'    => '/static/admin/images/head.jpg',
                'password'    => $hashedPassword,
                'create_time' => time(),
                'update_time' => time()
            ];
            foreach ($update as $_k => $_up) {
                $pdo->query("UPDATE {$config['prefix']}{$tableName} SET {$_k} = '{$_up}' WHERE id = 1");
            }
            if ($driver == 'pgsql') {
                // 文件原型 /vendor/topthink/think-orm/src/db/connector/pgsql12.sql
                $pdo->exec('CREATE OR REPLACE FUNCTION pgsql_type(a_type varchar) RETURNS varchar AS $$ DECLARE v_type varchar; BEGIN IF a_type=\'int8\' THEN v_type:=\'bigint\'; ELSIF a_type=\'int4\' THEN v_type:=\'integer\'; ELSIF a_type=\'int2\' THEN v_type:=\'smallint\'; ELSIF a_type=\'bpchar\' THEN v_type:=\'char\'; ELSE v_type:=a_type; END IF; RETURN v_type; END; $$ LANGUAGE PLPGSQL; CREATE TYPE "public"."tablestruct" AS ("fields_key_name" varchar(100),"fields_name" VARCHAR(200),"fields_type" VARCHAR(20),"fields_length" BIGINT,"fields_not_null" VARCHAR(10),"fields_default" VARCHAR(500),"fields_comment" VARCHAR(1000)); CREATE OR REPLACE FUNCTION "public"."table_msg" (a_schema_name varchar, a_table_name varchar) RETURNS SETOF "public"."tablestruct" AS $$ DECLARE v_ret tablestruct; v_oid oid; v_sql varchar; v_rec RECORD; v_key varchar; BEGIN SELECT pg_class.oid INTO v_oid FROM pg_class INNER JOIN pg_namespace ON (pg_class.relnamespace = pg_namespace.oid AND lower(pg_namespace.nspname) = a_schema_name) WHERE pg_class.relname=a_table_name; IF NOT FOUND THEN RETURN; END IF; v_sql=\'SELECT pg_attribute.attname AS fields_name,pg_attribute.attnum AS fields_index,pgsql_type(pg_type.typname::varchar) AS fields_type,pg_attribute.atttypmod-4 as fields_length,CASE WHEN pg_attribute.attnotnull THEN \'\'not null\'\' ELSE \'\'\'\' END AS fields_not_null,pg_get_expr(pg_attrdef.adbin, pg_attrdef.adrelid) AS fields_default,pg_description.description AS fields_comment FROM pg_attribute INNER JOIN pg_class ON pg_attribute.attrelid = pg_class.oid INNER JOIN pg_type ON pg_attribute.atttypid = pg_type.oid LEFT OUTER JOIN pg_attrdef ON pg_attrdef.adrelid = pg_class.oid AND pg_attrdef.adnum = pg_attribute.attnum LEFT OUTER JOIN pg_description ON pg_description.objoid = pg_class.oid AND pg_description.objsubid = pg_attribute.attnum WHERE pg_attribute.attnum > 0 AND attisdropped <> \'\'t\'\' AND pg_class.oid = \' || v_oid || \' ORDER BY pg_attribute.attnum\'; FOR v_rec IN EXECUTE v_sql LOOP v_ret.fields_name=v_rec.fields_name; v_ret.fields_type=v_rec.fields_type; IF v_rec.fields_length > 0 THEN v_ret.fields_length:=v_rec.fields_length; ELSE v_ret.fields_length:=NULL; END IF; v_ret.fields_not_null=v_rec.fields_not_null; v_ret.fields_default=v_rec.fields_default; v_ret.fields_comment=v_rec.fields_comment; SELECT constraint_name INTO v_key FROM information_schema.key_column_usage WHERE table_schema=a_schema_name AND table_name=a_table_name AND column_name=v_rec.fields_name; IF FOUND THEN v_ret.fields_key_name=v_key; ELSE v_ret.fields_key_name=\'\'; END IF; RETURN NEXT v_ret; END LOOP; RETURN ; END; $$ LANGUAGE \'plpgsql\' VOLATILE CALLED ON NULL INPUT SECURITY INVOKER; COMMENT ON FUNCTION "public"."table_msg"(a_schema_name varchar, a_table_name varchar) IS \'获得表信息\'; CREATE OR REPLACE FUNCTION "public"."table_msg" (a_table_name varchar) RETURNS SETOF "public"."tablestruct" AS $$ DECLARE v_ret tablestruct; BEGIN FOR v_ret IN SELECT * FROM table_msg(\'public\',a_table_name) LOOP RETURN NEXT v_ret; END LOOP; RETURN; END; $$ LANGUAGE \'plpgsql\' VOLATILE CALLED ON NULL INPUT SECURITY INVOKER; COMMENT ON FUNCTION "public"."table_msg"(a_table_name varchar) IS \'获得表信息\';');
            }
            //  处理安装文件
            !is_dir($installPath) && @mkdir($installPath);
            !is_dir($installPath . 'lock' . DIRECTORY_SEPARATOR) && @mkdir($installPath . 'lock' . DIRECTORY_SEPARATOR);
            @file_put_contents($installPath . 'lock' . DIRECTORY_SEPARATOR . 'install.lock', date('Y-m-d H:i:s'));
        } catch (\Exception|\PDOException|\Throwable $e) {
            $this->error("系统安装失败：" . $e->getMessage());
        }
        return true;
    }

    protected function parseSql($sql = '', $to = '', $from = ''): array
    {
        list($pure_sql, $comment) = [[], false];
        $sql = explode("\n", trim(str_replace(["\r\n", "\r"], "\n", $sql)));
        foreach ($sql as $key => $line) {
            if ($line == '') {
                continue;
            }
            if (preg_match("/^(#|--)/", $line)) {
                continue;
            }
            if (preg_match("/^\/\*(.*?)\*\//", $line)) {
                continue;
            }
            if (str_starts_with($line, '/*')) {
                $comment = true;
                continue;
            }
            if (str_ends_with($line, '*/')) {
                $comment = false;
                continue;
            }
            if ($comment) {
                continue;
            }
            if ($from != '') {
                $line = str_replace('`' . $from, '`' . $to, $line);
                $line = str_replace('"' . $from, '"' . $to, $line);
            }
            if ($line == 'BEGIN;' || $line == 'COMMIT;') {
                continue;
            }
            $pure_sql[] = $line;
        }
        //$pure_sql = implode($pure_sql, "\n");
        $pure_sql = implode("\n", $pure_sql);
        return explode(";\n", $pure_sql);
    }

    protected function createDatabase($database, $config): bool
    {
        $dsn = $this->pdoDsn($config);
        try {
            $pdo        = new \PDO($dsn, $config['username'] ?? 'root', $config['password'] ?? '');
            $create_sql = match ($config['driver'] ?? 'mysql') {
                'mysql' => <<<SQL
CREATE DATABASE IF NOT EXISTS `{$database}` DEFAULT CHARACTER SET {$config['charset']} COLLATE=utf8mb4_general_ci;
SQL,
                'pgsql' => <<<SQL
CREATE DATABASE {$database} ENCODING {$config['charset']}
SQL,
            };
            $pdo->query($create_sql);
        } catch (\PDOException $e) {
            return false;
        }
        return true;
    }

    protected function checkDatabase($database, $config): bool
    {
        try {
            $sql   = match ($config['driver'] ?? 'mysql') {
                'mysql' => <<<SQL
SELECT * FROM information_schema.schemata WHERE schema_name='{$database}'
SQL,
                'pgsql' => <<<SQL
SELECT 1 FROM pg_database WHERE datname='{$database}'
SQL,
            };
            $check = Db::query($sql);
        } catch (\Throwable $exception) {
            $check = false;
        }
        if (empty($check)) {
            return false;
        } else {
            return true;
        }
    }

    protected function checkConnect(array $config): ?bool
    {
        $dsn = $this->pdoDsn($config);
        try {
            $pdo = new \PDO($dsn, $config['username'] ?? 'root', $config['password'] ?? '');
            switch ($config['driver'] ?? 'mysql') {
                case 'mysql':
                    $res      = $pdo->query('select VERSION()');
                    $_version = $res->fetch()[0] ?? 0;
                    if (version_compare($_version, '5.7.0', '<')) {
                        $this->error('mysql版本最低要求 5.7.x');
                    }
                    break;
                case 'pgsql':
                    Db::query('SELECT 1');
                    $pdo      = Db::getPdo();
                    $_version = $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION);
                    if (version_compare($_version, '12.0', '<')) {
                        $this->error('pgsql版本最低要求 12.x');
                    }
                    break;
            }
        } catch (\PDOException $e) {
            $this->error($e->getMessage());
        }
        return true;
    }

    /**
     * @param array $config
     * @param bool $needDatabase
     * @return string
     */
    protected function pdoDsn(array $config, bool $needDatabase = false): string
    {
        $host     = $config['host'] ?? '127.0.0.1';
        $database = $config['database'] ?? '';
        $port     = $config['port'] ?? '3306';
        $charset  = $config['charset'] ?? 'utf8mb4';
        $driver   = $config['driver'] ?? 'mysql';
        $dsn      = "{$config['driver']}:host=$host;port=$port;";
        if ($needDatabase) $dsn = $dsn . "dbname=$database;";
        if ($driver == 'mysql') $dsn = $dsn . "charset=$charset;";
        return $dsn;
    }
}