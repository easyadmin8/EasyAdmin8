<?php

namespace app\admin\service\ai;

use NeuronAI\Chat\Messages\UserMessage;

class LogAnalyzerService extends AgentService
{
    protected array $logContent = [];

    public function loadCustomLogs(string $content): self
    {
        $this->logContent = [['file' => 'custom', 'lines' => [$content], 'count' => 1]];
        return $this;
    }

    public function analyze(array $options = []): array
    {
        if (empty($this->logContent)) {
            return [
                'success' => false,
                'message' => '请先加载日志内容',
            ];
        }

        $analysisType = $options['type'] ?? 'comprehensive';
        $systemPrompt = $this->getAnalysisSystemPrompt($analysisType);
        $logText      = $this->formatLogsForAnalysis();
        $userPrompt   = match ($analysisType) {
            'security'    => <<<EOF
请结合下日志内容：
{$logText}
提供详细的安全分析
EOF,
            'performance' => <<<EOF
请结合下日志内容：
{$logText}
提供详细性能分析
EOF,
            'error'       => <<<EOF
请结合下日志内容：
{$logText}
提供详细错误分析
EOF,
            'debug'       => <<<EOF
请结合下日志内容：
{$logText}
提供详细调试分析
EOF,
            default       => <<<EOF
请分析以下日志内容：
{$logText}
请提供详细的分析报告，包括：
. 错误类型和频率
. 性能问题. 安全风险
. 优化建议
. 根本原因分析（如适用）
EOF,
        };
        $this->setInstructions($systemPrompt);
        try {
            $response = $this->chat(new UserMessage($userPrompt));
            $analysis = $response->getMessage()->getContent();
            return [
                'success'  => true,
                'message'  => '分析完成',
                'analysis' => $analysis,
                'metadata' => [
                    'type'           => $analysisType,
                    'files_analyzed' => count($this->logContent),
                    'total_lines'    => array_sum(array_column($this->logContent, 'count')),
                ],
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    protected function formatLogsForAnalysis(): string
    {
        $formatted = [];

        foreach ($this->logContent as $logFile) {
            $formatted[] = "=== 文件：{$logFile['file']} ===";
            $formatted[] = implode("\n", $logFile['lines']);
        }

        return implode("\n\n", $formatted);
    }

    protected function getAnalysisSystemPrompt(string $type): string
    {
        $prompts = [
            'comprehensive' => '你是一个专业的ThinkPHP日志分析专家。请全面分析提供的日志内容，识别错误、警告、性能问题、安全风险等，并提供详细的分析报告和优化建议。请使用中文回复。',

            'security' => '你是一个专业的ThinkPHP安全分析师。请专注于日志中的安全问题，识别潜在的安全威胁、异常访问模式、SQL注入、XSS攻击等安全风险。请使用中文回复。',

            'performance' => '你是一个专业的ThinkPHP性能优化专家。请分析日志中的性能相关问题，包括慢查询、内存泄漏、CPU使用率异常等。请使用中文回复。',

            'error' => '你是一个专业的ThinkPHP故障诊断工程师。请分析日志中的错误信息，找出错误的原因和解决方案。请使用中文回复。',

            'debug' => '你是一个专业的ThinkPHP调试工程师。请帮助分析日志中的调试信息，找出代码中的问题。请使用中文回复。',
        ];

        return $prompts[$type] ?? $prompts['comprehensive'];
    }


    protected function formatSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i     = 0;
        $size  = $bytes;

        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }

        return round($size, 2) . ' ' . $units[$i];
    }
}
