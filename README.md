# Windows Port Monitor

一个基于 Tauri + React 构建的 Windows 端口占用检测工具，用于实时监控系统端口连接状态。

## 功能特性

- **实时监控**：每 5 秒自动刷新端口连接数据
- **连接详情**：显示端口、协议、本地/远程地址、状态、PID、进程名等信息
- **进程管理**：支持终止进程和挂起进程操作
- **搜索过滤**：按端口号、进程名、PID 进行搜索，支持协议和状态过滤
- **多语言支持**：支持中文和英文界面
- **主题切换**：支持浅色/深色主题
- **响应式布局**：支持可调整大小的面板布局

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI 组件库
- Lucide React 图标

### 后端
- Tauri 2
- Rust
- 系统命令（netstat、tasklist、taskkill）

## 安装和运行

### 环境要求

- Node.js 18+
- pnpm
- Rust 1.70+
- Windows 10/11

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动前端开发服务器
npx vite

# 启动 Tauri 桌面应用开发模式
pnpm tauri:dev
```

### 构建生产版本

```bash
# 构建前端
npx vite build

# 构建 Tauri 桌面应用
pnpm tauri:build
```

## 使用说明

### 主界面

1. **顶部栏**：显示应用标题、最后更新时间、刷新按钮、语言切换和主题切换
2. **统计卡片**：显示总连接数、监听中、已建立、TCP、UDP 等统计信息
3. **搜索和过滤**：输入关键词搜索，选择协议和状态进行过滤
4. **端口列表**：显示所有端口连接信息的表格
5. **进程详情**：点击连接行可展开查看进程详细信息

### 操作功能

- **刷新数据**：点击 REFRESH 按钮手动刷新
- **查看详情**：点击表格行查看连接和进程详情
- **终止进程**：在详情面板点击 KILL PROCESS 按钮
- **挂起进程**：在详情面板点击 SUSPEND PROCESS 按钮
- **搜索过滤**：使用搜索框和下拉菜单过滤数据

### 状态说明

- **LISTENING**：端口正在监听连接
- **ESTABLISHED**：连接已建立
- **TIME_WAIT**：连接等待关闭
- **CLOSE_WAIT**：连接等待关闭确认
- **SYN_SENT**：同步已发送

## 项目结构

```
window_service_manage/
├── src/                    # 前端源代码
│   ├── app/
│   │   ├── components/     # React 组件
│   │   ├── i18n/           # 国际化配置
│   │   └── theme/          # 主题配置
│   ├── main.tsx            # 入口文件
│   └── styles/             # 样式文件
├── src-tauri/              # Tauri 后端代码
│   ├── src/
│   │   ├── lib.rs          # Rust 库代码
│   │   └── main.rs         # Rust 入口文件
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 配置文件
├── guidelines/             # 设计指南
├── package.json            # Node.js 依赖配置
└── vite.config.ts          # Vite 配置文件
```

## 开发指南

### 添加新功能

1. 在 `src-tauri/src/lib.rs` 中添加新的 Tauri 命令
2. 在 `src/app/components/` 中创建或修改 React 组件
3. 在 `src/app/i18n/index.tsx` 中添加翻译文本

### 自定义主题

主题配置在 `src/app/theme/index.tsx` 中，可以修改颜色变量和样式。

### 国际化

支持的语言在 `src/app/i18n/index.tsx` 中定义，目前支持：
- `en`：英文
- `zh`：中文

## 许可证

MIT License