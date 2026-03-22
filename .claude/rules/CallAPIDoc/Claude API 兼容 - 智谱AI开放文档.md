---
paths:
  - "tools/**/*.html"
---

# 规则内容开始...

---

created: 2026-03-22T12:41:41 (UTC +08:00)
tags: []
source: https://docs.bigmodel.cn/cn/guide/develop/claude/introduction
author:

---

# Claude API 兼容 - 智谱AI开放文档

> ## Excerpt
>
> 智谱提供与 Claude API 兼容的接口，这意味着您可以使用现有的 Anthropic SDK 代码，只需要简单修改 API 密钥和基础 URL，就能无缝切换到智谱的模型服务。

---

智谱提供与 Claude API 兼容的接口，这意味着您可以使用现有的 Anthropic SDK 代码，只需要简单修改 API 密钥和基础 URL，就能无缝切换到智谱的模型服务。

### 核心优势

如果您已经在使用 Claude API，迁移到智谱非常简单。

- 替换您访问的 `base_url` 为 `https://open.bigmodel.cn/api/anthropic`
- 在 [智谱开放平台](https://bigmodel.cn/usercenter/proj-mgmt/apikeys) 申请您的 `api_key`
- 调用时使用智谱模型编码即可

```makefile
# 原来的 Claude 代码
import anthropic

client = anthropic.Anthropic(
    base_url="your-base-url",
    api_key="your-api-key",
)

# 迁移到智谱，只需要修改三个地方
client = anthropic.Anthropic(
    api_key="your-zhipuai-api-key",  # 替换为智谱 API Key
    base_url="https://open.bigmodel.cn/api/anthropic"  # 配置智谱 base_url
)

# 模型编码使用 智谱模型，其他代码保持不变
message = client.messages.create(
    model="glm-5",  # 使用智谱模型
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**推荐模型**

| 模型编码      | 定位       | 特点                                                         | 上下文 | 最大输出 |
| ------------- | ---------- | ------------------------------------------------------------ | ------ | -------- |
| glm-4.7       | 高智能旗舰 | - 旗舰性能<br>- 强大的推理能力、代码生成能力以及工具调用能力 | 200K   | 96K      |
| glm-4.5-air   | 高性价比   | - 在推理、编码和智能体任务上表现强劲                         | 128K   | 96K      |
| glm-4.5-flash | 免费模型   | - 基座模型的普惠版本                                         | 128K   | 96K      |

## 详细步骤

### 获取 API Key

1.  访问 [智谱开放平台](https://bigmodel.cn/)
2.  注册并登录您的账户
3.  在 [API Keys](https://bigmodel.cn/usercenter/proj-mgmt/apikeys) 管理页面创建 API Key
4.  复制您的 API Key 以供使用

### 代码示例

- cURL
- Python
- TypeScript
- Java

```cpp
curl https://open.bigmodel.cn/api/anthropic/v1/messages \
     --header "x-api-key: your-zhipuai-api-key" \
     --header "content-type: application/json" \
     --data \
'{
    "model": "glm-5",
    "max_tokens": 1024,
    "stream": true,
    "messages": [
        {"role": "user", "content": "Hello, ZHIPU"}
    ]
}'
```

## 更多资源
