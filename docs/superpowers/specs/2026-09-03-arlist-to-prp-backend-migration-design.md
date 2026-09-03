# PRP 后端迁移设计：arlist → personal-resource-planning

日期：2026-09-03
状态：已批准
范围：仅后端（arlist backend → prp backend）。前端不在本次范围，后期与财务功能统一创建。

## 1. 背景与目标

将 `/home/cacc/Repositories/arlist/backend`（Spring Boot 3.5.3 + Maven + JPA/PostgreSQL + Keycloak）迁移至 `/home/cacc/Repositories/personal-resource-planning/backend`（Spring Boot 4.1.1 + Gradle + Java 21），并做如下演进：

- 领域改名：`Todo` → `Task`，`Group` → `Project`
- 单模块 → Gradle 多模块（按业务 domain 垂直切分 + 启动组装模块）：`prp-common` + `prp-task` + `prp-app`
- 持久化保持 JPA + PostgreSQL，API 结构保持不变（仅改名）
- 引入自定义框架 `arorms-security`、`arorms-common`（通过 Nexus `nexus.arorms.cn/repository/maven-public`，构件目标 Boot 4.0.7，与 Boot 4.1.1 兼容待构建验证）

后续任务（不在本次范围）：迁移 `/home/cacc/Repositories/personal-financial-management`（MyBatis-Plus/MySQL 技术栈将整体重写为 JPA/PostgreSQL，作为新的 domain 模块如 `prp-finance` 接入）与人事模块（如 `prp-hr`）。

## 2. 模块结构

```
backend/                          # Gradle 多模块根项目 cn.arorms:prp
├── build.gradle.kts              # 根：插件声明、Nexus 仓库、公共配置
├── settings.gradle.kts           # include("prp-common", "prp-task", "prp-app")
├── prp-common/                   # 共享库模块：跨 domain 公共能力
│   └── src/main/java/cn/arorms/prp/common/
│       ├── configs/              # CorsConfig, WebConfig
│       ├── enums/                # Role
│       └── exceptions/           # GlobalExceptionHandler (@ControllerAdvice)
├── prp-task/                     # task+project domain 垂直切片（纯业务库）
│   └── src/main/java/cn/arorms/prp/task/
│       ├── entities/             # Task, Project
│       ├── repositories/         # TaskRepository, ProjectRepository
│       ├── services/             # TaskService, ProjectService
│       └── controllers/          # TaskController, ProjectController, AuthController
└── prp-app/                      # 启动组装模块（无 controller，可运行 jar）
    └── src/
        ├── main/java/cn/arorms/prp/app/
        │   ├── BackendApplication.java   # scanBasePackages = "cn.arorms.prp"
        │   └── configs/SecurityConfig.java
        ├── main/resources/application.yml
        └── test/                 # contextLoads 测试 + .http 脚本
```

依赖方向：`prp-app` → `prp-task` → `prp-common`；`prp-app` → `prp-common`。domain 模块之间对等、互不依赖；后续新增 `prp-finance`、`prp-hr` 时只需在 settings 中 include 并在 prp-app 加一行依赖。

旧 prp 单模块骨架（`src/`、原 `build.gradle.kts`）删除重建。

### 依赖清单

prp-common（共享库）：
- spring-boot-starter-webmvc（提供 `@ControllerAdvice`、`WebMvcConfigurer` 等 web 注解）
- arorms-common（Nexus）

prp-task（domain 库）：
- spring-boot-starter-data-jpa、spring-boot-starter-webmvc
- 项目依赖 `prp-common`
- arorms-common（Nexus）
- lombok（annotationProcessor）

prp-app（启动组装）：
- 项目依赖 `prp-common`、`prp-task`
- spring-boot-starter-security、spring-boot-starter-security-oauth2-resource-server
- arorms-security（Nexus；SecurityConfig 使用 KeycloakAuthenticationConverter）
- postgresql（runtimeOnly）
- spring-boot-starter-test、spring-security-test（test）
- `spring-boot-gradle-plugin`（prp-app 独占，产出可运行 jar）

不再引入：jjwt（arlist 声明但从未使用）、flyway（全程 `ddl-auto`，不碰）。

Nexus 仓库在根 build.gradle.kts 统一声明，凭据复用 `~/.gradle/gradle.properties` 中已有的 `nexusUsername`/`nexusPassword`。

## 3. 领域模型

实体关系与字段与 arlist 一一对应，仅改名：

### Task（表 `tasks`）
| 字段 | 类型 | 列 | 说明 |
|---|---|---|---|
| id | Long | id | IDENTITY 自增 |
| userId | String | user_id | 创建者（Keycloak sub） |
| project | Project | project_id | ManyToOne LAZY，`@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})` |
| title | String | title | not null, 255 |
| description | String | description | |
| isCompleted | Boolean | is_completed | 默认 false |
| createdAt | LocalDateTime | created_at | 默认 now |
| deadline | LocalDateTime | deadline | 可空 |

### Project（表 `projects`）
| 字段 | 类型 | 列 | 说明 |
|---|---|---|---|
| id | Long | id | IDENTITY 自增 |
| name | String | name | not null |
| orderIndex | int | order_index | UI 排序 |
| description | String | description | |
| userId | String | user_id | 创建者 |

注：原表名 `groups` 在 PostgreSQL 16+ 为保留关键字，改 `projects` 顺带消除隐患。全新数据库 `prp`，不迁移旧数据。

包名：共享 `cn.arorms.prp.common.*`，task domain `cn.arorms.prp.task.*`（entities/repositories/services/controllers），启动 `cn.arorms.prp.app.*`。`Role` 枚举（USER/ADMIN）位于 prp-common（当前无引用，保留以兼容）。

Repository、Service 逻辑原样保留，含：
- TaskRepository：`findByUserId`、`findByUserIdAndProject_Id`、`existsByIdAndUserId`、`findByIdAndUserId`、`findByUserIdAndDeadlineIsNotNull`
- ProjectRepository：`shiftForward`/`shiftBackward`（JPQL 批量移位 orderIndex）、`countByUserId` 等
- 排序：task 列表 `isCompleted asc, createdAt desc`；deadline 列表 `deadline desc, createdAt desc`；project 列表 `orderIndex desc`

## 4. API 契约（结构不变，仅改名）

| 旧 | 新 |
|---|---|
| `GET /api/todo?page&size&groupId` | `GET /api/task?page&size&projectId` |
| `GET /api/todo/deadline?page&size` | `GET /api/task/deadline?page&size` |
| `GET /api/todo/{id}` | `GET /api/task/{id}` |
| `POST /api/todo/add` | `POST /api/task/add` |
| `PUT /api/todo/toggleComplete/{id}` | `PUT /api/task/toggleComplete/{id}` |
| `PUT /api/todo` | `PUT /api/task` |
| `DELETE /api/todo/{id}` | `DELETE /api/task/{id}` |
| `GET /api/project` | `GET /api/project` |
| `POST /api/project` | `POST /api/project` |
| `PUT /api/project` | `PUT /api/project` |
| `PUT /api/project/updateOrder` | `PUT /api/project/updateOrder` |
| `DELETE /api/project/{id}` | `DELETE /api/project/{id}` |
| `GET /api/auth/me` | 不变 |

JSON 字段：`group` → `project`，其余字段名不变。分页响应经 `@EnableSpringDataWebSupport(VIA_DTO)` 序列化，保持与 arlist 相同的分页 JSON 结构。

## 5. 安全与配置

- SecurityConfig（prp-app）：`@EnableWebSecurity` + `@Import(SecurityAutoConfiguration.class)`，JWT 转换用 arorms-security 的 `KeycloakAuthenticationConverter`，`csrf disable`、`anyRequest().authenticated()`
- 配置键沿用 arlist（框架 `@Value` 依赖）：
  - `spring.security.oauth2.resourceserver.jwt.issuer-uri`（默认 `https://auth.arorms.cn/realms/arorms`）
  - `application.security.jwt.audience` → 值改为 `prp-backend`（Keycloak 侧需新建对应 audience；本地 `.env`/环境变量可覆盖）
  - `application.security.cors.allowed-origins`：默认值先沿 arlist 配置，前端重建后调整
- 数据源：`jdbc:postgresql://${DB_HOST:localhost}:5432/prp`，`ddl-auto: update`，不使用 Flyway

## 6. 测试与验证

1. `./gradlew build` 成功；产物：prp-common.jar、prp-task.jar + 可运行 prp-app Boot jar
2. 本地 PostgreSQL `prp` 库启动后自动建表 `tasks`/`projects`
3. 13 个端点行为与 arlist 等价（分页、排序、updateOrder 移位、权限过滤 userId）
4. Keycloak JWT 认证链路正常（`/api/auth/me` 返回 principal）
5. `prp-app/src/test/http/` 迁移 arlist 的 `.http` 脚本并改名（task/project、projectId），contextLoads 测试保留

## 7. 兼容性与扩展性决策记录

| 决策 | 理由 |
|---|---|
| 持久层统一 JPA + PostgreSQL（pfm 大改） | 单一技术栈，模块边界清晰 |
| 按 domain 垂直切分（prp-task…）+ prp-app 启动组装 | 各 domain 对等、自包含 controller；新增 finance/hr 时零侵入 |
| 表名/路径同步改名，不留旧名 | 前端后期统一重建，无兼容包袱 |
| 全新 `prp` 数据库 | 干净起步；`groups` 保留字隐患消除 |
| jjwt 移除 | 资源服务器模式下从未使用 |
| Boot 4.1.1 + arorms(4.0.7) | 依赖管理由 Boot BOM 对齐；构建时验证，冲突即回报 |

## 8. 未来工作（非本次范围）

- pfm（personal-financial-management）整体迁移：MyBatis-Plus/MySQL → JPA/PostgreSQL 重写为 `prp-finance` domain 模块（entities/repositories/services/controllers 垂直切片），prp-app 加一行依赖即可接入
- 人事等新 domain（如 `prp-hr`）同理接入
- 前端统一重建（todo + finance）
- Keycloak `prp-backend` audience 与前端 client 配置
