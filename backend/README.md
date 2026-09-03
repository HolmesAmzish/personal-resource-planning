# PRP Backend

Personal Resource Planning 后端。多模块 Gradle 工程（Spring Boot 4.1.1 / Java 21 / JPA / PostgreSQL / Keycloak），按业务 domain 垂直切分。

## 模块

- `prp-common`：跨 domain 共享——公共配置（CORS、分页序列化）、全局异常处理、枚举
- `prp-task`：task + project domain 垂直切片——实体、Repository、Service、REST 控制器
- `prp-app`：启动组装模块（无 controller）——启动类、安全配置（Keycloak JWT 资源服务器）、配置文件；依赖所有 domain 模块

依赖方向：`prp-app` → `prp-task` → `prp-common`。新增 domain（如 `prp-finance`、`prp-hr`）时照 `prp-task` 复制一份，在 settings 中 include 并在 `prp-app` 加一行依赖即可。

## 快速启动

```bash
# 前置：本地 PostgreSQL 5432 已建库 prp；Keycloak issuer 可达
export DB_PASSWORD=<postgres密码>
./gradlew :prp-app:bootRun
```

首次启动由 Hibernate `ddl-auto: update` 自动建表 `tasks`、`projects`。

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| DB_HOST | localhost | PostgreSQL 地址 |
| DB_USERNAME | postgres | 数据库用户 |
| DB_PASSWORD | （必填） | 数据库密码 |
| JWT_ISSUER | https://auth.arorms.cn/realms/arorms | Keycloak issuer |
| JWT_AUD | prp-backend | Keycloak audience 校验值 |
| ALLOWED_ORIGINS | https://todo.arorms.cn,http://localhost:5173 | CORS 白名单（逗号分隔） |

注意：Keycloak 侧需存在 audience 为 `prp-backend` 的 client（或以 JWT_AUD 环境变量匹配现有 client audience）。

## 构建与测试

```bash
./gradlew build         # 全量构建
./gradlew :prp-app:test # contextLoads
```

HTTP 接口测试脚本在 `prp-app/src/test/http/`（IntelliJ HTTP Client，token 配置于私有 env 文件 `http-client.private.env.json`）。
