<?php
// 应用公共文件

use app\common\service\AuthService;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use think\db\exception\DataNotFoundException;
use think\db\exception\DbException;
use think\db\exception\ModelNotFoundException;
use think\facade\Cache;

if (!function_exists('__url')) {

    /**
     * 构建URL地址
     * @param string $url
     * @param array $vars
     * @param bool $suffix
     * @param bool $domain
     * @return string
     */
    function __url(string $url = '', array $vars = [], bool $suffix = true, bool $domain = false): string
    {
        if (filter_var($url, FILTER_VALIDATE_URL)) return $url;
        return url($url, $vars, $suffix, $domain)->build();
    }
}

if (!function_exists('password')) {

    /**
     * 密码加密算法
     * @param $value
     * @return string
     */
    function password($value): string
    {
        $value = sha1('blog_') . md5($value) . md5('_encrypt') . sha1($value);
        return sha1($value);
    }

}


if (!function_exists('sysConfig')) {

    /**
     * 获取系统配置信息
     * @param $group
     * @param $name
     * @return mixed
     */
    function sysConfig($group, $name = null): mixed
    {
        $where = ['group' => $group];
        $value = empty($name) ? Cache::get("sysConfig_{$group}") : Cache::get("sysConfig_{$group}_{$name}");
        if (empty($value)) {
            if (!empty($name)) {
                $where['name'] = $name;
                $value         = \app\admin\model\SystemConfig::where($where)->value('value');
                Cache::tag('sysConfig')->set("sysConfig_{$group}_{$name}", $value, 3600);
            }else {
                $value = \app\admin\model\SystemConfig::where($where)->column('value', 'name');
                Cache::tag('sysConfig')->set("sysConfig_{$group}", $value, 3600);
            }
        }
        return $value;
    }
}

if (!function_exists('array_format_key')) {

    /**
     * 二位数组重新组合数据
     * @param $array
     * @param $key
     * @return array
     */
    function array_format_key($array, $key): array
    {
        $newArray = [];
        foreach ($array as $vo) {
            $newArray[$vo[$key]] = $vo;
        }
        return $newArray;
    }

}

if (!function_exists('auth')) {

    /**
     * auth权限验证
     * @param $node
     * @return bool
     * @throws DataNotFoundException
     * @throws DbException
     * @throws ModelNotFoundException
     */
    function auth($node = null): bool
    {
        $authService = new AuthService(session('admin.id'));
        return $authService->checkNode($node);
    }
}

/**
 * @param string|null $detail
 * @param string $name
 * @param string $placeholder
 * @return string
 */
function editor_textarea(?string $detail, string $name = 'desc', string $placeholder = '请输入'): string
{
    $editor_type = sysConfig('site', 'editor_type');
    return match ($editor_type) {
        'ckeditor' => "<textarea name='{$name}' rows='20' class='layui-textarea editor' placeholder='{$placeholder}'>{$detail}</textarea>",
        'ueditor'  => "<script type='text/plain' id='{$name}' name='{$name}' class='editor' data-content='{$detail}'></script>",
        'EasyMDE'  => "<textarea id='{$name}' class='editor' name='{$name}'>{$detail}</textarea>",
        default    => "<div class='wangEditor_div'><textarea name='{$name}' rows='20' class='layui-textarea editor layui-hide'>{$detail}</textarea><div id='editor_toolbar_{$name}'></div><div id='editor_{$name}' style='height: 500px'></div></div>",
    };
}

/**
 * @desc 导出excel
 * @tip 追求性能请使用 xlsWriter https://xlswriter-docs.viest.me/zh-cn
 * @param array $header
 * @param array $list
 * @param string $fileName
 * @return void
 * @throws Exception
 */
function exportExcel(array $header = [], array $list = [], string $fileName = ''): void
{
    if (empty($fileName)) $fileName = time();
    if (empty($header) || empty($list)) throw new \Exception('导出数据不能为空');
    $spreadsheet = new Spreadsheet();
    $sheet       = $spreadsheet->getActiveSheet();
    $headers     = array_column($header, 0) ?? array_keys($list[0]);
    $sheet->fromArray([$headers], null, 'A1');
    $rowIndex = 2;
    foreach ($list as $row) {
        $rowData = [];
        foreach ($header as $item) {
            $value = $row[$item[1]] ?? '';
            if ($value === null) {
                $rowData[] = '';
                continue;
            }
            $rowData[] = $value;
        }
        $sheet->fromArray([$rowData], null, "A{$rowIndex}");
        $rowIndex++;
    }
    foreach (range('A', $sheet->getHighestColumn()) as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $fileName . '.xlsx"');
    header('Cache-Control: max-age=0');
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    die();
}