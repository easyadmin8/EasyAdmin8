<?php

namespace app\admin\controller\mall;

use app\admin\model\MallCate;
use app\admin\model\MallGoods;
use app\admin\service\annotation\MiddlewareAnnotation;
use app\common\controller\AdminController;
use app\admin\service\annotation\ControllerAnnotation;
use app\admin\service\annotation\NodeAnnotation;
use app\Request;
use think\App;
use think\response\Json;
use Wolfcode\Ai\Enum\AiType;
use Wolfcode\Ai\Service\AiChatService;

#[ControllerAnnotation(title: '商城商品管理')]
class Goods extends AdminController
{

    #[NodeAnnotation(ignore: ['export'])] // 过滤不需要生成的权限节点 默认 CURD 中会自动生成部分节点 可以在此处过滤
    protected array $ignoreNode;

    public function __construct(App $app)
    {
        parent::__construct($app);
        self::$model = MallGoods::class;
        $this->assign('cate', MallCate::column('title', 'id'));
    }

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        if ($request->isAjax()) {
            if (input('selectFields')) return $this->selectList();
            list($page, $limit, $where) = $this->buildTableParams();
            $count = self::$model::where($where)->count();
            $list  = self::$model::with(['cate'])->where($where)->page($page, $limit)->order($this->sort)->select()->toArray();
            $data  = [
                'code'  => 0,
                'msg'   => '',
                'count' => $count,
                'data'  => $list,
            ];
            return json($data);
        }
        return $this->fetch();
    }

    #[NodeAnnotation(title: '入库', auth: true)]
    public function stock(Request $request, $id): string
    {
        $row = self::$model::find($id);
        empty($row) && $this->error('数据不存在');
        if ($request->isPost()) {
            $post = $request->post();
            $rule = [];
            $this->validate($post, $rule);
            try {
                $post['total_stock'] = $row->total_stock + $post['stock'];
                $post['stock']       = $row->stock + $post['stock'];
                $save                = $row->save($post);
            }catch (\Exception $e) {
                $this->error('保存失败');
            }
            $save ? $this->success('保存成功') : $this->error('保存失败');
        }
        $this->assign('row', $row);
        return $this->fetch();
    }

    #[MiddlewareAnnotation(ignore: MiddlewareAnnotation::IGNORE_LOGIN)]
    public function no_check_login(Request $request): string
    {
        return '这里演示方法不需要经过登录验证';
    }


    #[NodeAnnotation(title: 'AI优化', auth: true)]
    public function aiOptimization(Request $request): void
    {
        $message = $request->post('message');
        if (empty($message)) $this->error('请输入内容');

        // 演示环境下 默认返回的内容
        if ($this->isDemo) {
            $content = <<<EOF
演示环境中 默认返回的内容
            
我来帮你优化这个标题，让它更有吸引力且更符合电商平台的搜索逻辑:
        
"商务男士高端定制马克杯 | 办公室精英必备 | 优质陶瓷防烫手柄"
        
这个优化后的标题:
1. 突出了目标用户群体(商务男士)
2. 强调了产品定位(高端定制)
3. 点明了使用场景(办公室)
4. 添加了材质和功能特点(优质陶瓷、防烫手柄)
5. 使用了吸引人的关键词(精英必备)
        
这样的标题不仅更具体，也更容易被搜索引擎识别，同时能精准触达目标客户群。您觉得这个版本如何?
EOF;
            $choices = [['message' => [
                'role'    => 'assistant',
                'content' => $content,
            ]]];
            $this->success('success', compact('choices'));
        }

        try {
            $result  = AiChatService::instance()
                // 当使用推理模型时，可能存在超时的情况，所以需要设置超时时间为 0
                // ->setTimeLimit(0)
                // 请替换为您需要的模型类型
                ->setAiType(AiType::QWEN)
                // 如果需要指定模型的 API 地址，可自行设置
                // ->setAiUrl('https://xxx.com')
                // 请替换为您的模型
                ->setAiModel('qwen-plus')
                // 请替换为您的 API KEY
                ->setAiKey('sk-1234567890')
                // 此内容会作为系统提示，会影响到回答的内容 当前仅作为测试使用
                ->setSystemContent('你现在是一位资深的海外电商产品经理')
                ->chat($message);
            $choices = $result['choices'];
        }catch (\Throwable $exception) {
            $choices = [['message' => [
                'role'    => 'assistant',
                'content' => $exception->getMessage(),
            ]]];
        }
        $this->success('success', compact('choices'));
    }

}