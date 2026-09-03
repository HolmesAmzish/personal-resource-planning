# PRP Frontend Design — 个人ERP前端（Calm Operator）

日期：2026-09-03
状态：已批准方案A，待审阅本spec
范围：仅前端。后端已就绪，不动后端。

## 1. 背景与目标

将 personal-resource-planning 从 Vite 模板重建为个人ERP操作台，按 domain 垂直切分支撑 task/project、finance，并为人事（hr）等后续 domain 预留零侵入接入位。样式严格遵循 `blog/docs/admin-design-system.md`（Calm Operator）：Tailwind 唯一实现、无预设 UI 库、语义 token、安静密集的操作台。

前置压缩：
- Session1（arlist→prp）：`Todo→Task`、`Group→Project`，JPA+PG 不变，`prp-common/prp-task/prp-app`，Keycloak JWT（arorms-security），`ddl-auto:update`，库 `prp`，表 `tasks/projects`，API `/api/task`、`/api/project`、`/api/auth/me`，后端 `:8085`。
- Session2（pfm→prp）：MyBatis-Plus/MySQL/Flyway 重写为 JPA/PG/DDL，新模块 `prp-finance`，4 表 `accounts/categories/transactions/transaction_presets`，`FinanceDataInitializer` 种子 12 系统分类，分页改 Spring `Page` 0基，硬删除。

## 2. 技术栈（锁定）

React 19 + TS + Vite + Tailwind CSS v4（CSS-first token）+ react-router-dom + axios + oidc-client-ts + lucide-react + clsx + tailwind-merge。禁止 shadcn/MUI/AntD 等。语言：中文 UI（design-system 默认英文，但本项目用户为中文，取中文）。

新增依赖：`tailwindcss @tailwindcss/vite react-router-dom axios oidc-client-ts lucide-react clsx tailwind-merge`。

## 3. 模块结构

```
frontend/src/
├── app/            # 路由/Providers/AppShell/Sidebar/Header/PrivateRoute
├── shared/         # ui(6 recipe)/lib(cn,format,auth-config)/hooks/usePage
├── domains/
│   ├── task/       # api.ts types.ts pages/TasksPage.tsx components/(TaskItem,EditTaskModal,ProjectSidebar)
│   ├── finance/    # api.ts types.ts pages/(FinanceDashboard,Accounts,Transactions,Categories,Statistics) components/
│   └── hr/         # 占位：index.ts + HrPlaceholderPage（disabled路由）
└── styles/index.css # §3.1 token骨架 + reset/focus/scrollbar（唯一全局样式）
```

依赖方向：`domains/* → shared`，`app → shared + domains`。新增 domain 照 `task` 复制一份、在路由与 sidebar 加两行即可。

## 4. 路由与布局

AppShell：272px sidebar（`bg-card border-r`，移动端 fixed drawer + `bg-black/20` overlay）+ 56px sticky header（`bg-background/80 backdrop-blur-xl`）+ `max-w-[1280px] px-4 lg:px-8 py-6 lg:py-8` content，`space-y-5 animate-fade-in`。

| 路由 | 页面 | 数据 |
|---|---|---|
| `/login`（公开） | LoginPage（一句话+主按钮） | 跳 OIDC |
| `/callback`（公开） | CallbackPage（spinner+错误） | oidc signinCallback |
| `/` | OverviewPage（stat cards：待办、账户、月收支） | task/finance 聚合 |
| `/tasks` | TasksPage（project sidebar + task table + deadline视图） | `/api/task*`、`/api/project*` |
| `/finance/dashboard` | FinanceDashboard（stat+trend表） | statistics+accounts |
| `/finance/accounts` | AccountsPage | `/api/accounts*` |
| `/finance/transactions` | TransactionsPage（filter bar+table+transfer入口） | `/api/transactions*`、presets |
| `/finance/categories` | CategoriesPage（item grid） | `/api/categories*` |
| `/finance/statistics` | StatisticsPage（summary+trend+balances） | `/api/statistics*` |
| `/hr` | 占位 disabled | — |

## 5. 鉴权与 API 层

- OIDC（oidc-client-ts AuthCode）：`VITE_OAUTH_AUTHORITY=https://auth.arorms.cn/realms/arorms`、`VITE_OAUTH_CLIENT_ID=prp-react`、`VITE_OAUTH_REDIRECT_URI=<origin>/callback`、`scope=openid profile email`，silent renew + localStorage。`AuthContext` 存 `user/access_token`，`PrivateRoute` 守卫，401 清 session 回 `/login`。
- `apiClient`（axios）：`baseURL=/api`（Vite dev proxy → `http://localhost:8085`，以 `application.yml` 的 `SERVER_PORT:8085` 为准；`prp-app` 下 `.http` 脚本仍写 8080 属陈旧值，不跟）。请求注 `Authorization: Bearer`，响应直接返回 data（后端无 envelope，分页即 Spring `Page{content,totalElements,totalPages,last,number,size}`）。
- 各 domain `api.ts` 一一映射后端路径（task 7端点、project 5端点、accounts 5端点、categories 4端点、transactions 5端点、presets 4端点、statistics 3端点、auth/me）。Task 写操作体：`project:{id}`；Transaction 日期 `yyyy-MM-dd`；finance 金额后端为数字，仍做 `string→number` 兼容解析。

## 6. 组件契约（Calm Operator recipes，不建组件系统）

仅收敛 6 个本地原语（重复≥3处才收敛）：`Card`、`Button(primary/secondary/danger/ghost)`、`Input/select/textarea + Label`、`Modal/Confirm`、`Badge/Chip`、`Empty/Loading/Spinner`。class 逐字照搬 design-system §6/§13：卡片 `rounded-[var(--radius)] border border-border + light双层轻阴影/dark无阴影`；主按钮 pill `rounded-full bg-primary` 每页最多一个；输入默认 `bg-muted border-transparent` focus 切 `bg-card border-border`；badge 纯 `rounded-full`；table 用 card+`grid-cols-12`+`divide-y`+`hover:bg-muted`，移动端堆叠。
统计 v1：stat card + table + 轻量内联 SVG 趋势线，不引 chart 库，留 `TrendChart` adapter 接口后期换 ECharts。

## 7. 错误处理与空态

后端错误体为纯文本：`apiClient` 透出 message，页面行内 `text-[12px] text-danger` 或 toast（极简本地 toast，不引库）。`NoSuchElement→404` 显示 Empty 态（`p-10`居中+32px muted icon+13px文案+可选主动作）。表单校验镜像后端 `@Valid`（必填/Positive/日期），失败不发请求。

## 8. 验证标准

1. `npm run build` 全绿，无 UI 库引入（grep `shadcn|@mui|antd` 零命中）。
2. 无 hex 硬编码（页面只用语义 token；`grep -r "#0047ff\|#f5f5f7" src --include=*.tsx` 零命中）。
3. 冒烟（需后端+Keycloak）：login→callback→me→tasks CRUD→projects order→accounts CRUD→transactions（含transfer）→statistics→dark/light 切换→移动端 drawer。
4. 13 task/project 端点 + finance 21 端点行为与 `.http` 脚本等价。

## 9. 非目标

- 不做 marketing 页、landing、PWA（后期另议）。
- 不引入 Flyway/MySQL 相关、不改后端、CORS 由后端 `ALLOWED_ORIGINS` 覆盖。
- HR 只留占位，不实现任何人事业务。
