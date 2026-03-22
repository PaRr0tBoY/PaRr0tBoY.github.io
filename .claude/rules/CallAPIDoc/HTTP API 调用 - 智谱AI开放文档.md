---
paths:
  - "tools/**/*.html"
---

---

created: 2026-03-22T12:41:35 (UTC +08:00)
tags: []
source: https://docs.bigmodel.cn/cn/guide/develop/http/introduction
author:

---

# HTTP API 调用 - 智谱AI开放文档

> ## Excerpt
>
> 智谱AI 提供基于 RESTful 架构的应用程序接口，通过标准的 HTTP 协议与智谱AI 的模型服务进行交互。无论您使用什么编程语言或开发框架，都可以通过 HTTP 请求来调用智谱AI 的各种 AI 模型。

---

智谱AI 提供基于 RESTful 架构的应用程序接口，通过标准的 HTTP 协议与智谱AI 的模型服务进行交互。无论您使用什么编程语言或开发框架，都可以通过 HTTP 请求来调用智谱AI 的各种 AI 模型。

### 核心优势

## 获取 API Key

1.  访问 [智谱AI 开放平台](https://bigmodel.cn/)
2.  注册并登录您的账户
3.  在 [API Keys](https://bigmodel.cn/usercenter/proj-mgmt/apikeys) 管理页面创建 API Key
4.  复制您的 API Key 以供使用

### 请求端点(通用API)

```ruby
https://open.bigmodel.cn/api/paas/v4/
```

### 请求头要求

```less
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

### 支持的鉴权方式

- API Key 鉴权
- JWT Token 鉴权

最简单的鉴权方式，直接使用您的 API Key：

```rust
curl --location 'https://open.bigmodel.cn/api/paas/v4/chat/completions' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data '{
    "model": "glm-5",
    "messages": [
        {
            "role": "user",
            "content": "你好"
        }
    ]
}'
```

## 基础调用示例

### 简单对话

```rust
curl --location 'https://open.bigmodel.cn/api/paas/v4/chat/completions' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data '{
    "model": "glm-5",
    "messages": [
        {
            "role": "user",
            "content": "请介绍一下人工智能的发展历程"
        }
    ],
    "temperature": 1.0,
    "max_tokens": 1024
}'
```

### 流式响应

```rust
curl --location 'https://open.bigmodel.cn/api/paas/v4/chat/completions' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data '{
    "model": "glm-5",
    "messages": [
        {
            "role": "user",
            "content": "写一首关于春天的诗"
        }
    ],
    "stream": true
}'
```

### 多轮对话

```rust
curl --location 'https://open.bigmodel.cn/api/paas/v4/chat/completions' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data '{
    "model": "glm-5",
    "messages": [
        {
            "role": "system",
            "content": "你是一个专业的编程助手"
        },
        {
            "role": "user",
            "content": "什么是递归？"
        },
        {
            "role": "assistant",
            "content": "递归是一种编程技术，函数调用自身来解决问题..."
        },
        {
            "role": "user",
            "content": "能给我一个 Python 递归的例子吗？"
        }
    ]
}'
```

## 常用编程语言示例

- Python
- JavaScript
- Java

```python
import requests
import json

def call_zhipu_api(messages, model="glm-5"):
    url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }

    data = {
        "model": model,
        "messages": messages,
        "temperature": 1.0
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API调用失败: {response.status_code}, {response.text}")

# 使用示例
messages = [
    {"role": "user", "content": "你好，请介绍一下自己"}
]

result = call_zhipu_api(messages)
print(result['choices'][0]['message']['content'])
```

## 错误处理

### 常见错误码

| 错误码 | 说明           | 解决方案                       |
| ------ | -------------- | ------------------------------ |
| 401    | 未授权         | 检查 API Key 是否正确          |
| 429    | 请求过于频繁   | 降低请求频率，实施重试机制     |
| 500    | 服务器内部错误 | 稍后重试，如持续出现请联系支持 |

更多错误码和解决方案请参考 [API 错误码文档](https://docs.bigmodel.cn/cn/faq/api-code)

## 实践建议

## 更多资源
