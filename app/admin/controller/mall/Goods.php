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
use app\admin\service\ai\AgentService;
use NeuronAI\Chat\Messages\UserMessage;

#[ControllerAnnotation(title: '商城商品管理')]
class Goods extends AdminController
{

    #[NodeAnnotation(ignore: ['export'])] // 过滤不需要生成的权限节点 默认 CURD 中会自动生成部分节点 可以在此处过滤
    protected array $ignoreNode;

    public function __construct(App $app)
    {
        parent::__construct($app);
        $this->model = new MallGoods();
        $this->assign('cate', MallCate::column('title', 'id'));
    }

    #[NodeAnnotation(title: '列表', auth: true)]
    public function index(Request $request): Json|string
    {
        if ($request->isAjax()) {
            if (input('selectFields')) return $this->selectList();
            list($page, $limit, $where) = $this->buildTableParams();
            $count = $this->model->where($where)->count();
            $list  = $this->model->with(['cate'])->where($where)->page($page, $limit)->order($this->sort)->select()->toArray();
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
        $row = $this->model->find($id);
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
            sleep(1);
            $content = <<<EOF
>演示环境中 默认返回的内容
>
>我来帮你优化这个标题，让它更有吸引力且更符合电商平台的搜索逻辑:

以下是针对“卡皮巴拉毛绒玩具”（Capybara Plush Toy）针对不同海外市场及平台的标题优化方案。作为资深产品经理，我建议从**SEO 搜索权重**、**点击转化率**和**品牌情感连接**三个维度进行重构。\n\n### 一、核心标题优化方案（英文为主）\n\n请根据实际销售平台选择最合适的一个版本：\n\n#### 1. 亚马逊\/搜索导向型 (Amazon Listing SEO)\n> **公式：** [核心大词] + [核心属性\/材质] + [适用人群] + [使用场景] + [差异化卖点]\n>\n> **建议标题：**\n> **Giant Realistic Capybara Plush Toy – 2024 Trending Super Soft Stuffed Animal Doll, Ultra-Friendly Huggable Cappy Bear for Kids Adults Bed Decoration, Perfect Birthday Christmas Gift for Women Men**\n> *(中文释义：超大号逼真卡皮巴拉毛绒玩具 - 2024 流行超软填充动物玩偶，友好抱手感好的卡皮熊，适合儿童成人床装饰，男女生生日圣诞节完美礼物)*\n\n*   **理由：** 覆盖了\"Capybara\", \"Plush Toy\", \"Stuffed Animal\", \"Gift\"等高流量长尾词；强调了\"Giant\/Realistic\"（尺寸和质感）以及季节性场景（Birthday\/Christmas）。\n\n#### 2. TikTok\/社媒引流型 (Social Media\/TikTok Shop)\n> **公式：** [情绪价值] + [流行趋势词] + [Emoji 视觉强化]\n>\n> **建议标题：**\n> **Meet Your New Chill Bestie! ☕️ The Viral Capybara Plushie – Maximum Cozy Vibes & Stress Relief 🧸 #Capybaramood**\n> *(中文释义：认识你的新冷静伙伴！病毒式传播的卡皮巴拉毛绒公仔 - 极致舒适氛围与解压神器)*\n\n*   **理由：** 抓住\"Capybara=Chill\/Calm\/Cozy\"的文化梗；使用 Emoji 增加移动端视觉停留；强调情绪价值（解压、陪伴），符合社媒冲动消费逻辑。\n\n#### 3. 独立站\/品牌调性型 (DTC\/Brand Website)\n> **公式：** [品牌理念] + [材质工艺] + [稀缺性\/独特性]\n>\n> **建议标题：**\n> **The Calm Collection™: Premium Faux Fur Capybara Companion | Machine Washable Hypoallergenic Stuffing | Ethically Crafted Pet & Home Decor**\n> *(中文释义：宁静系列™：优质仿皮草卡皮巴拉伴侣机洗低敏填充物 | 道德工艺制作的宠物与家居装饰)*\n\n*   **理由：** 弱化玩具属性，提升为“生活方式产品”；强调面料安全（Hypoallergenic）、易打理（Machine Washable）和工艺伦理（Ethically Crafted），吸引高净值或家长群体。\n\n---\n\n### 二、关键词库 (SEO Keywords)\n请将以下词汇布局在标题、A+ 页面及后台搜索词（Search Terms）中：\n\n*   **核心词：** Capybara, Capybarra, Cappy Bear, Hydrochoerus.\n*   **品类词：** Plush Toy, Stuffed Animal, Doll, Teddy Bear, Squishy, Pillow, Cushion.\n*   **属性词：** Soft, Fluffy, Huge, Giant, Mini, Clip-on, Scented, Glow in Dark, Rainbow.\n*   **场景词：** Bedroom Decor, Desk Accessory, Car Hanging, Sleep Aid, Study Buddy.\n*   **人群词：** For Kids, For Women, For Men, Cat Ladies, Anime Fans, Office Workers.\n*   **情绪\/营销词：** Trending 2024, Viral, Cool Gift, Relaxing, Mood Booster.\n\n---\n\n### 三、PM 特别执行建议 (Action Items)\n\n1.  **本地化微调 (Localization):**\n    *   **北美 (US):** 强调 \"Giant\", \"Soft\", \"Huge Size\"（喜欢大个头的夸张感）。\n    *   **欧洲 (UK\/EU):** 使用 \"Plushie\", \"Stuffed Beast\", 强调材质安全性（OEKO-TEX 认证等）。\n    *   **日本 (JP):** 虽然标题用英文，但需考虑日语语境，强调 \"Kawaii\", \"Shiawase\"（幸福\/治愈），标题可改为 \"Calming Capybara Charms\"。\n\n2.  **规格后缀策略:**\n    *   如果有多尺寸，主标题不要堆砌尺寸，改用括号形式：`... (Available in 10\"\/20\"\/30\")` 或单独列出变体。\n    *   如果是挂饰，务必加入 `Car Hanging`, `Keychain`, `Bag Charm`。\n\n3.  **合规性检查 (Compliance):**\n    *   确保标题不包含误导性描述（如非“真实动物”不能暗示）。\n    *   如果是出口欧美，确保符合 ASTM F963 \/ EN71 标准，可在副标题或 Bullet Point 提及 \"Safety Certified\"。\n\n4.  **A\/B 测试建议:**\n    *   准备两套标题：一套侧重“功能\/材质”（耐用、好清洗），一套侧重“情绪\/潮流”（最火梗、治愈）。观察哪个版本的 CTR（点击率）更高。\n\n5.  **图片关联:**\n    *   标题写 \"Giant\"，首图必须放对比图（如人手比大小）。\n    *   标题写 \"Scented\/Lavender\"，首图必须有蒸汽或薰衣草元素示意。
EOF;
            $choices = [['message' => [
                'role'    => 'assistant',
                'content' => $content,
            ]]];
            $this->success('success', compact('choices'));
        }
        try {
            $response = AgentService::make()->setInstructions('你现在是一位资深的海外电商产品经理，请直接给出符合要求的产品建议，请勿给出任何提问')->chat(new UserMessage($message));
            $choices  = [['message' => [
                'role'    => 'assistant',
                'content' => $response->getMessage()->getContent(),
            ]]];
        }catch (\Throwable $exception) {
            $choices = [['message' => [
                'role'    => 'assistant',
                'content' => $exception->getMessage(),
            ]]];
        }
        $this->success('success', compact('choices'));
    }

}