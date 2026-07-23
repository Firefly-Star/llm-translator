# LLM Translator

一个面向个人使用的本地 LLM 翻译工具。

它提供：
- 类翻译软件的双栏界面
- 多套 LLM 配置保存 / 切换 / 测速
- 源语言 / 目标语言选择
- 自动检测源语言
- 流式翻译输出
- 输入停顿后自动翻译
- 本地持久化（localStorage）
- 桌面封装（Tauri）
- Android 封装（Capacitor）
- GitHub Actions CI / Bundled CD 工作流

仓库地址：
- https://github.com/Firefly-Star/llm-translator

## 当前状态

已完成：
- Web 前端可用
- Linux 桌面打包可用（deb / rpm）
- Windows 桌面打包主线为 NSIS `.exe`
- Android APK 打包链路已接入
- 每次提交自动跑 CI（test + build）
- Bundled CD 支持三端捆绑式发布

当前 GitHub Release 目标产物：
- Linux: `.deb`, `.rpm`
- Windows: `.exe`
- Android: `.apk`

## 技术栈

前端：
- React
- TypeScript
- Vite

桌面端：
- Tauri

移动端：
- Capacitor Android

CI/CD：
- GitHub Actions

## 项目结构

```text
llm-translator/
├─ src/                          # 前端业务代码（单一事实来源）
├─ public/                       # 前端静态资源
├─ packaging/
│  ├─ desktop/
│  │  ├─ tauri/                  # Tauri 桌面封装层（真实目录）
│  │  ├─ package-linux.mjs       # Linux 桌面打包脚本
│  │  └─ package-windows.mjs     # Windows 桌面打包脚本
│  └─ android/
│     ├─ android/                # Capacitor Android 原生工程（真实目录）
│     ├─ sync.mjs                # Android 同步脚本
│     └─ package-android.mjs     # Android APK 打包脚本
├─ scripts/                      # 通用开发辅助脚本
├─ docs/                         # 项目文档
├─ .github/workflows/            # CI/CD 工作流
├─ package.json                  # 共享 npm 入口
├─ package-lock.json
├─ vite.config.ts
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ capacitor.config.ts
├─ src-tauri -> packaging/desktop/tauri
│                                 # 兼容 Tauri 默认目录行为的软链接入口
└─ README.md
```

设计原则：
- 前端业务逻辑只放在 `src/`
- Tauri / Capacitor 都只是薄封装层
- 前端改动后，只需要重新封装，不需要改业务壳层代码
- 顶层只保留共享入口文件与通用配置
- `packaging/desktop/tauri/` 才是桌面封装层的真实目录
- 顶层 `src-tauri` 只是指向 `packaging/desktop/tauri/` 的软链接，用于兼容 Tauri 的默认目录约定

## Web 开发

安装依赖：

```bash
npm ci
```

启动开发服务器：

```bash
npm run dev
```

开发服务器带端口避让逻辑：
- 默认尝试 5173
- 最多避让 4 次
- 实际尝试：5173 / 5174 / 5175 / 5176 / 5177
- 如果全部占用，会报错退出

构建 Web：

```bash
npm run build
```

本地预览：

```bash
npm run preview -- --host
```

## 测试

运行测试：

```bash
npm test
```

监听模式：

```bash
npm run test:watch
```

当前测试覆盖了：
- 本地存储读写
- 自动翻译触发逻辑
- 语言选择逻辑
- 配置 CRUD 辅助函数
- 流式 chunk 解析
- 主界面基础交互

## Linux 桌面打包

稳定命令：

```bash
npm run package:desktop:linux
```

当前会产出：
- `.deb`
- `.rpm`

产物目录通常在：

```text
packaging/desktop/tauri/target/release/bundle/deb/
packaging/desktop/tauri/target/release/bundle/rpm/
```

## Windows 桌面打包

稳定命令（需要在 Windows 环境执行）：

```bash
npm run package:desktop:windows
```

当前 Windows 主发布物为：
- NSIS 安装器 `.exe`

说明：
- Windows 打包应优先在 `windows-latest` GitHub runner 或本地 Windows 环境验证
- 当前不再主推 `.msi`

## Android APK 打包

同步 Web 产物到 Android：

```bash
npm run android:sync
```

构建 APK：

```bash
npm run package:android
```

当前 APK 目标产物路径通常为：

```text
packaging/android/android/app/build/outputs/apk/debug/app-debug.apk
```

## Tauri / Capacitor 开发命令

Tauri 开发模式：

```bash
npm run tauri:dev
```

Tauri 通用打包：

```bash
npm run tauri:build
```

Android 同步：

```bash
npm run android:sync
```

Android 打包：

```bash
npm run package:android
```

## GitHub Actions

### CI

文件：
- `.github/workflows/ci.yml`

触发：
- `push`
- `pull_request`

执行：
- `npm ci`
- `npm test`
- `npm run build`

目标：
- 每个提交都必须经过 test + build
- 但每个提交不自动触发多平台打包

### Bundled CD

文件：
- `.github/workflows/cd.yml`

触发：
- `workflow_dispatch`

输入：
- `version`

工作流逻辑：
- Linux 打包
- Windows 打包
- Android APK 打包
- 三端全部成功后，才创建正式 GitHub Release
- Release 页面直接上传最终产物，而不是只保留 artifact zip

当前发布到 Release 的文件：
- Linux: `.deb`, `.rpm`
- Windows: `.exe`
- Android: `.apk`

## 使用说明

### LLM 配置

应用内可以保存多套配置，每套配置包含：
- 名称
- provider
- baseUrl
- apiKey
- model
- systemPrompt
- temperature

测速会对单个配置发送简短请求，验证接口是否正常工作。

### 翻译方向

支持：
- 源语言选择
- 自动检测源语言
- 目标语言选择
- 交换语言方向

当输入文本存在时，切换源/目标语言会重新触发翻译条件。

### 自动翻译

当输入框内容停止变化一段时间后，会自动发起翻译请求。

防重逻辑已处理，避免出现：
- 文本一直不变
- 每隔 t 秒重复请求一次

## 持久化

当前使用浏览器 `localStorage` 保存：
- 配置列表
- 当前激活配置
- 自动翻译延迟
- 源语言
- 目标语言
- 输入文本
- 输出文本

## 发布策略

当前发布策略是“三端捆绑发布”：
- Linux
- Windows
- Android

只有三端都打包成功，才创建正式 GitHub Release。

这保证：
- 不会出现某一端先发布、另一端缺失的情况
- release 页面中的版本始终是完整的三端版本

## 已知约束

- Windows 打包需要 Windows 环境或 GitHub Windows runner
- Android 打包依赖 Java + Android SDK
- Linux 打包依赖桌面系统库（dbus / gtk / webkit 等）
- AppImage 当前不是主发布目标

## 后续可以继续做的方向

- Android release 包（非 debug APK）
- Windows 安装体验进一步收敛
- 自动生成版本号 / tag / changelog
- 发布页文案与产物命名优化
- 更强的配置导入 / 导出能力

## 许可证

当前仓库尚未单独补充 LICENSE 文件；如需开源发布建议补充。
