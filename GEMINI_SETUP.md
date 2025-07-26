# Gemini API 设置指南

## 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录你的 Google 账户
3. 点击 "Create API Key" 按钮
4. 复制生成的 API Key（格式类似：`AIzaSyC...`）

## 环境变量配置

在你的 `.env` 文件中添加：

```env
# Gemini API Key
GEMINI_API_KEY=AIzaSyC...
```

## 使用方法

1. 启动项目：`npm run dev`
2. 在网页界面中选择 "Gemini" 作为 AI 服务
3. 在 API Key 输入框中输入你的 Gemini API Key
4. 输入视频链接并开始生成摘要

## 测试 API 连接

运行以下命令测试 Gemini API 是否正常工作：

```bash
npm run test:gemini
```

## 支持的模型

当前项目使用 `gemini-1.5-flash` 模型，这是一个快速且经济实惠的模型。

## 注意事项

- Gemini API Key 格式：以 `AI` 开头的 39 位字符串
- 确保你的网络可以访问 Google 服务
- Gemini API 有使用限制，请查看 [Google AI Studio 文档](https://aistudio.google.com/app/apikey) 了解详情

## 故障排除

如果遇到问题：

1. 检查 API Key 是否正确
2. 确认网络连接正常
3. 查看浏览器控制台的错误信息
4. 运行测试脚本验证 API 连接
