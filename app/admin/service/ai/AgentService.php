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