# AI 集成

## AgentService

`app/admin/service/ai/AgentService.php`:

```php
<?php
namespace app\admin\service\ai;

use NeuronAI\Agent\Agent;
use NeuronAI\Providers\AIProviderInterface;
use NeuronAI\Providers\OpenAILike;

class AgentService extends Agent
{
    protected function provider(): AIProviderInterface
    {
        return new OpenAILike(
            baseUri: env('DASHSCOPE_API_URL'),
            key    : env('DASHSCOPE_API_KEY'),
            model  : env('DASHSCOPE_API_MODEL', 'qwen-plus'),
        );
    }
}
```

## 配置

```env
DASHSCOPE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=your_api_key
DASHSCOPE_API_MODEL=qwen-plus
```

## 使用方式

```php
use app\admin\service\ai\AgentService;
use NeuronAI\Chat\Messages\UserMessage;

// 基础调用
$response = AgentService::make()
    ->setInstructions('你现在是一位资深的海外电商产品经理')
    ->chat(new UserMessage($message));

$content = $response->getMessage()->getContent();
```

## 商品标题优化示例

`app/admin/controller/mall/Goods.php`:

```php
#[NodeAnnotation(title: 'AI优化', auth: true)]
public function aiOptimization(Request $request): void
{
    $message = $request->post('message');
    if (empty($message)) $this->error('请输入内容');

    // 演示环境下返回固定内容
    if ($this->isDemo) {
        sleep(1);
        $content = '演示环境返回的内容...';
        $choices = [['message' => ['role' => 'assistant', 'content' => $content]]];
        $this->success('success', compact('choices'));
    }

    try {
        $response = AgentService::make()
            ->setInstructions('你现在是一位资深的海外电商产品经理，请直接给出符合要求的产品建议')
            ->chat(new UserMessage($message));
        $choices = [['message' => [
            'role'    => 'assistant',
            'content' => $response->getMessage()->getContent(),
        ]]];
    } catch (\Throwable $exception) {
        $choices = [['message' => [
            'role'    => 'assistant',
            'content' => $exception->getMessage(),
        ]]];
    }
    $this->success('success', compact('choices'));
}
```

## 前端调用

```javascript
$.ajax({
    url: '{:url("aiOptimization")}',
    type: 'POST',
    data: { message: prompt },
    success: function(res) {
        if (res.code === 1) {
            var content = res.data.choices[0].message.content;
            console.log(content);
        }
    }
});
```

## 依赖

```bash
composer require neuron-core/neuron-ai
```
