# arlist → prp 后端迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 arlist 后端（Boot 3.5.3/Maven）迁移为 prp 多模块后端（Boot 4.1.1/Gradle），Todo→Task、Group→Project，保留 JPA/PostgreSQL、API 结构与 Keycloak 认证。

**Architecture:** Gradle 三模块：`prp-common`（公共配置/异常处理/枚举）+ `prp-task`（task+project 垂直切片：实体/仓库/服务/控制器）+ `prp-app`（启动组装：启动类/安全配置/配置文件，无 controller），依赖方向 prp-app → prp-task → prp-common。安全经 arorms-security（Keycloak JWT 资源服务器），公共异常经 arorms-common，二者来自 Nexus。

**Tech Stack:** Spring Boot 4.1.1（Gradle 插件）、Java 21、Spring Data JPA、PostgreSQL、Lombok、arorms-security/arorms-common 1.0-SNAPSHOT（Nexus `nexus.arorms.cn/repository/maven-public`）。

**Spec:** `docs/superpowers/specs/2026-09-03-arlist-to-prp-backend-migration-design.md`

## Global Constraints

- 全程 `ddl-auto: update`，禁止引入 Flyway；数据库 `prp`（全新，不迁移数据）
- 构建工具 Gradle（wrapper 9.7.1 已存在），禁止改用 Maven
- Nexus 仓库 `https://nexus.arorms.cn/repository/maven-public/`，凭据复用 `~/.gradle/gradle.properties` 的 `nexusUsername`/`nexusPassword`（禁止写入仓库内文件）
- API 路径 `/api/task`、`/api/project`、`/api/auth/me`；查询参数 `groupId`→`projectId`；表 `tasks`/`projects`
- 包根 `cn.arorms.prp.common`（prp-common）、`cn.arorms.prp.task`（prp-task）、`cn.arorms.prp.app`（prp-app）；启动类扫描 `cn.arorms.prp`
- 不引入 jjwt（源项目声明但从未使用）
- **禁止任何 git commit**——版本控制由用户在任务结束后统一组织
- Boot 4 starter 命名：`spring-boot-starter-webmvc` 替代旧 `spring-boot-starter-web`；安全资源服务器为 `spring-boot-starter-security-oauth2-resource-server`
- 迁移源码只读参考 `/home/cacc/Repositories/arlist/backend`，不得修改

---

### Task 1: 根构建骨架（多模块 + Nexus + Boot 4.1.1）

**Files:**
- Modify: `backend/build.gradle.kts`（全量重写）
- Modify: `backend/settings.gradle.kts`
- Delete: `backend/src/`（旧单模块骨架代码与配置）

**Interfaces:**
- Consumes: 无
- Produces: 双模块 Gradle 工程；Task 2+ 在 `prp-common/` 与 `prp-app/` 下创建源码

- [ ] **Step 1: 清除旧骨架**

```bash
rm -rf backend/src
rm -f backend/HELP.md
```

保留 `gradle/`、`gradlew`、`gradlew.bat`。

- [ ] **Step 2: 重写 settings.gradle.kts**

```kotlin
rootProject.name = "prp"

include("prp-common")
include("prp-task")
include("prp-app")
```

- [ ] **Step 3: 重写根 build.gradle.kts**

```kotlin
plugins {
    java
    id("org.springframework.boot") version "4.1.1" apply false
    id("io.spring.dependency-management") version "1.1.7" apply false
}

allprojects {
    group = "cn.arorms"
    version = "0.0.1-SNAPSHOT"

    repositories {
        maven {
            url = uri("https://nexus.arorms.cn/repository/maven-public/")
            mavenContent { includeGroup("cn.arorms.framework") }
            credentials {
                username = providers.gradleProperty("nexusUsername").get()
                password = providers.gradleProperty("nexusPassword").get()
            }
        }
        mavenCentral()
    }
}

subprojects {
    apply(plugin = "java")
    apply(plugin = "io.spring.dependency-management")

    java {
        toolchain {
            languageVersion = JavaLanguageVersion.of(21)
        }
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }
}
```

注意：`providers.gradleProperty` 从 `GRADLE_USER_HOME/gradle.properties`（即 `~/.gradle/gradle.properties`）读取，凭据不入库。

- [ ] **Step 4: 创建模块构建文件**

`backend/prp-common/build.gradle.kts`：

```kotlin
plugins {
    id("java-library")
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("cn.arorms.framework:arorms-common:1.0-SNAPSHOT")
}
```

`backend/prp-task/build.gradle.kts`：

```kotlin
plugins {
    id("java-library")
}

dependencies {
    api("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation(project(":prp-common"))
    implementation("cn.arorms.framework:arorms-common:1.0-SNAPSHOT")
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
}
```

`backend/prp-app/build.gradle.kts`：

```kotlin
plugins {
    id("org.springframework.boot")
}

dependencies {
    implementation(project(":prp-common"))
    implementation(project(":prp-task"))
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server")
    implementation("cn.arorms.framework:arorms-security:1.0-SNAPSHOT")
    runtimeOnly("org.postgresql:postgresql")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}
```

- [ ] **Step 5: 验证构建骨架解析**

```bash
./gradlew projects
```

Expected: 列出 `prp`、`prp-common`、`prp-task`、`prp-app` 四项目，无报错。

- [ ] **Step 6: 验证依赖可从 Nexus 解析**

```bash
./gradlew :prp-common:dependencies --configuration runtimeClasspath | grep arorms
```

Expected: 出现 `cn.arorms.framework:arorms-common:1.0-SNAPSHOT` 解析成功（来自 Nexus）。若失败，检查网络/凭据，不得将凭据写入仓库文件。

（无代码测试——本任务交付物是构建骨架；commit 由用户统一组织，下同）

---

### Task 2: prp-task 领域层（Project/Task 实体）

**Files:**
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/entities/Project.java`
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/entities/Task.java`
- Create: `backend/prp-common/src/main/java/cn/arorms/prp/common/enums/Role.java`

**Interfaces:**
- Consumes: 无
- Produces: 实体类 `Project`（getId/setName/setOrderIndex/setDescription/setUserId 等 Lombok 生成器）、`Task`（含 `getGroup`→`getProject`、`setProject` 等）、枚举 `Role{USER,ADMIN}`。Task 3 的 Repository 引用 `cn.arorms.prp.task.entities.Project/Task`。

- [ ] **Step 1: 创建 Role 枚举**

```java
package cn.arorms.prp.common.enums;

public enum Role {
    USER,
    ADMIN
}
```

- [ ] **Step 2: 创建 Project 实体**

```java
package cn.arorms.prp.task.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

@Entity @Table(name = "projects")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "order_index")
    private int orderIndex;

    private String description;

    @Column(name = "user_id")
    @Comment("Created by")
    private String userId;
}
```

- [ ] **Step 3: 创建 Task 实体（旧 Todo，group→project）**

```java
package cn.arorms.prp.task.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

/**
 * Task Entity
 */
@Entity @Table(name = "tasks")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    @Comment("Created by")
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "deadline")
    private LocalDateTime deadline;
}
```

- [ ] **Step 4: 编译验证**

```bash
./gradlew :prp-common:compileJava
```

Expected: BUILD SUCCESSFUL。

---

### Task 3: prp-task 仓库层（ProjectRepository / TaskRepository）

**Files:**
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/repositories/ProjectRepository.java`
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/repositories/TaskRepository.java`

**Interfaces:**
- Consumes: Task 2 的 `Project`、`Task` 实体
- Produces: `ProjectRepository extends JpaRepository<Project, Long>`（方法 `findByUserId(String, Sort)`、`findByIdAndUserId(Long, String)`、`existsByIdAndUserId(Long, String)`、`shiftForward(int, int, String)`、`shiftBackward(int, int, String)`、`countByUserId(String)`）；`TaskRepository extends JpaRepository<Task, Long>`（方法 `findByUserId(String, Pageable)`、`findByUserIdAndProject_Id(String, Long, Pageable)`、`existsByIdAndUserId(Long, String)`、`findByIdAndUserId(Long, String)`、`findByUserIdAndDeadlineIsNotNull(String, Pageable)`）。Task 4/5 服务层按这些签名调用。

- [ ] **Step 1: 创建 ProjectRepository**

```java
package cn.arorms.prp.task.repositories;

import cn.arorms.prp.task.entities.Project;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserId(String userId, Sort sort);

    Optional<Project> findByIdAndUserId(Long id, String userId);

    Boolean existsByIdAndUserId(Long id, String userId);

    @Modifying
    @Query("UPDATE Project p SET p.orderIndex = p.orderIndex + 1 " +
            "WHERE p.orderIndex >= :start AND p.orderIndex <= :end AND p.userId = :userId")
    void shiftForward(int start, int end, String userId);

    @Modifying
    @Query("UPDATE Project p SET p.orderIndex = p.orderIndex - 1 " +
            "WHERE p.orderIndex >= :start AND p.orderIndex <= :end AND p.userId = :userId")
    void shiftBackward(int start, int end, String userId);

    int countByUserId(String userId);
}
```

- [ ] **Step 2: 创建 TaskRepository**

```java
package cn.arorms.prp.task.repositories;

import cn.arorms.prp.task.entities.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByUserId(String userId, Pageable sortedPageable);
    Page<Task> findByUserIdAndProject_Id(String userId, Long projectId, Pageable sortedPageable);

    Boolean existsByIdAndUserId(Long id, String userId);
    Optional<Task> findByIdAndUserId(Long id, String userId);

    Page<Task> findByUserIdAndDeadlineIsNotNull(String userId, Pageable pageable);
}
```

- [ ] **Step 3: 编译验证**

```bash
./gradlew :prp-common:compileJava
```

Expected: BUILD SUCCESSFUL（Spring Data 派生查询方法名在启动时校验，编译期需通过）。

---

### Task 4: prp-task 服务层（ProjectService / TaskService）

**Files:**
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/services/ProjectService.java`
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/services/TaskService.java`

**Interfaces:**
- Consumes: Task 3 的两个 Repository；Task 2 的实体
- Produces: `ProjectService`（`getAllByUserId(String)`→`List<Project>`、`addProject(String, Project)`、`updateProject(String, Project)`、`updateProjectOrder(String, Project)`、`deleteProject(String, Long)`）；`TaskService`（`getAllByUserId(Pageable, String, Long projectId)`、`getAllByDeadline(Pageable, String)`、`getTaskById(Long)`、`addTask(String, Task)`、`toggleCompleted(String, Long)`、`updateTask(String, Task)`、`deleteTask(String, Long)`）。Task 6 控制器按这些签名调用。

- [ ] **Step 1: 创建 ProjectService（原 GroupService，含排序移位算法）**

```java
package cn.arorms.prp.task.services;

import cn.arorms.prp.task.entities.Project;
import cn.arorms.prp.task.repositories.ProjectRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * ProjectService
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@Service
public class ProjectService {
    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getAllByUserId(String userId) {
        Sort sort = Sort.by(Sort.Direction.DESC, "orderIndex");
        return projectRepository.findByUserId(userId, sort);
    }

    public Project addProject(String userId, Project project) {
        // Check project id to prevent update wrongly
        if (project.getId() != null) {
            throw new IllegalArgumentException("New project cannot have an ID!");
        }

        // Set user
        project.setUserId(userId);

        // Set project order index for ui
        int count = projectRepository.countByUserId(userId);
        project.setOrderIndex(count);

        return projectRepository.save(project);
    }

    public Project updateProject(String userId, Project project) {
        if (!projectRepository.existsByIdAndUserId(project.getId(), userId)) {
            throw new NoSuchElementException("Can not found existing project");
        }
        project.setUserId(userId);
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProjectOrder(String userId, Project project) {

        int originalOrderIndex = projectRepository.findByIdAndUserId(project.getId(), userId)
                .map(Project::getOrderIndex)
                .orElseThrow(() -> new NoSuchElementException("Can not found existing project with id: " + project.getId()));

        int changedOrderIndex = project.getOrderIndex();

        // Shift related project order index before update the target project.
        if (originalOrderIndex < changedOrderIndex) {
            projectRepository.shiftBackward(originalOrderIndex + 1, changedOrderIndex, userId);
        } else {
            projectRepository.shiftForward(changedOrderIndex, originalOrderIndex - 1, userId);
        }

        return projectRepository.save(project);
    }

    public void deleteProject(String userId, Long id) {
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with ID: " + id));
        projectRepository.delete(project);
    }
}
```

- [ ] **Step 2: 创建 TaskService（原 TodoService）**

```java
package cn.arorms.prp.task.services;

import cn.arorms.prp.task.entities.Task;
import cn.arorms.prp.task.repositories.ProjectRepository;
import cn.arorms.prp.task.repositories.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

/**
 * TaskService
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@Service
public class TaskService {
    private static final Logger log = LoggerFactory.getLogger(TaskService.class);
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public Page<Task> getAllByUserId(Pageable pageable, String userId, Long projectId) {
        Sort sort = Sort.by(Sort.Order.asc("isCompleted"),
                Sort.Order.desc("createdAt"));

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );

        if (projectId != null) {
            return taskRepository.findByUserIdAndProject_Id(userId, projectId, sortedPageable);
        }

        return taskRepository.findByUserId(userId, sortedPageable);
    }

    public Page<Task> getAllByDeadline(Pageable pageable, String userId) {
        Sort sort = Sort.by(Sort.Order.desc("deadline"),
                Sort.Order.desc("createdAt"));
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );
        return taskRepository.findByUserIdAndDeadlineIsNotNull(userId, sortedPageable);
    }

    // Get by ID
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Task not found with ID: " + id));
    }

    // Create
    public Task addTask(String userId, Task task) {
        task.setUserId(userId);
        if (task.getProject() != null && task.getProject().getId() != null) {
            task.setProject(projectRepository.getReferenceById(task.getProject().getId()));
        }
        return taskRepository.save(task);
    }

    // Toggle isCompleted
    public Task toggleCompleted(String userId, Long id) {
        Task existingTask = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Can not found existing task."));
        existingTask.setIsCompleted(!existingTask.getIsCompleted());
        return taskRepository.save(existingTask);
    }

    // Modify
    public Task updateTask(String userId, Task task) {
        if (!taskRepository.existsByIdAndUserId(task.getId(), userId)) {
            throw new NoSuchElementException("Can not found existing task.");
        }
        task.setUserId(userId);
        return taskRepository.save(task);
    }

    // Delete
    public void deleteTask(String userId, Long id) {
        Task existingTask = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Can not found existing task."));
        taskRepository.delete(existingTask);
    }
}
```

- [ ] **Step 3: 编译验证**

```bash
./gradlew :prp-common:compileJava
```

Expected: BUILD SUCCESSFUL。

---

### Task 5: prp-common 公共配置与异常处理

**Files:**
- Create: `backend/prp-common/src/main/java/cn/arorms/prp/common/configs/CorsConfig.java`
- Create: `backend/prp-common/src/main/java/cn/arorms/prp/common/configs/WebConfig.java`
- Create: `backend/prp-common/src/main/java/cn/arorms/prp/common/exceptions/GlobalExceptionHandler.java`

**Interfaces:**
- Consumes: arorms-common 的 `BaseExceptionHandler`；配置键 `application.security.cors.allowed-origins`（application.yml 由 Task 7 提供，运行时解析）
- Produces: `@ControllerAdvice` 全局异常处理（DataIntegrityViolationException→400/500）；CORS 全端点映射；`@EnableSpringDataWebSupport(VIA_DTO)` 分页序列化模式

- [ ] **Step 1: 创建 CorsConfig**

```java
package cn.arorms.prp.common.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * CorsConfig
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${application.security.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply to all endpoints
                .allowedOrigins(Arrays.asList(allowedOrigins.split(",")))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Cache the preflight response for 1 hour
    }
}
```

- [ ] **Step 2: 创建 WebConfig**

```java
package cn.arorms.prp.common.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class WebConfig {
}
```

- [ ] **Step 3: 创建 GlobalExceptionHandler**

```java
package cn.arorms.prp.common.exceptions;

import cn.arorms.framework.common.exception.BaseExceptionHandler;
import org.hibernate.PropertyValueException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler extends BaseExceptionHandler {
    /**
     * Data property exception
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDatabaseError(DataIntegrityViolationException e) {

        if (e.getCause() instanceof PropertyValueException propertyValueException) {
            return ResponseEntity.badRequest().body("Property '" + propertyValueException.getPropertyName() + "' cannot be null.");
        }

        return ResponseEntity.internalServerError().body("Internal error.");
    }
}
```

- [ ] **Step 4: 编译验证（含 arorms-common 解析）**

```bash
./gradlew :prp-common:compileJava
```

Expected: BUILD SUCCESSFUL。此处同时验证 arorms-common 从 Nexus 解析成功（`BaseExceptionHandler` 可导入）。

---

### Task 6: prp-task 控制器 + prp-app 启动与安全配置

**Files:**
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/controllers/TaskController.java`
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/controllers/ProjectController.java`
- Create: `backend/prp-task/src/main/java/cn/arorms/prp/task/controllers/AuthController.java`
- Create: `backend/prp-app/src/main/java/cn/arorms/prp/app/configs/SecurityConfig.java`
- Create: `backend/prp-app/src/main/java/cn/arorms/prp/app/BackendApplication.java`

**Interfaces:**
- Consumes: Task 4 的 `TaskService`/`ProjectService`（cn.arorms.prp.task.services）；Task 2 实体；arorms-security 的 `UserPrincipal`、`KeycloakAuthenticationConverter`、`SecurityAutoConfiguration`
- Produces: REST 端点（见规格 §4 的 13 端点映射）；`BackendApplication`（main 入口，scanBasePackages="cn.arorms.prp"）

- [ ] **Step 1: 创建 BackendApplication**

```java
package cn.arorms.prp.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "cn.arorms.prp")
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
```

- [ ] **Step 2: 创建 TaskController**

```java
package cn.arorms.prp.task.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.task.entities.Task;
import cn.arorms.prp.task.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * TaskController
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@RestController
@RequestMapping("/api/task")
public class TaskController {
    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Get all tasks with pagination
    @GetMapping
    public Page<Task> getAllTasks(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "projectId", required = false) Long projectId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return taskService.getAllByUserId(pageable, userPrincipal.getId(), projectId);
    }

    @GetMapping("/deadline")
    public Page<Task> getAllTasksByDeadline(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return taskService.getAllByDeadline(pageable, userPrincipal.getId());
    }

    // Get an entity detail by ID
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    // Add a new entity
    @PostMapping("/add")
    public ResponseEntity<Task> addTask(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Task task
    ) {
        return ResponseEntity.ok(taskService.addTask(userPrincipal.getId(), task));
    }

    // Toggle completion status of an entity
    @PutMapping("/toggleComplete/{id}")
    public ResponseEntity<Task> toggleCompleteTask(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(taskService.toggleCompleted(userPrincipal.getId(), id));
    }

    // Modify
    @PutMapping
    public ResponseEntity<Task> updateTask(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Task task
    ) {
        return ResponseEntity.ok(taskService.updateTask(userPrincipal.getId(), task));
    }

    // Delete an entity
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id
    ) {
        taskService.deleteTask(userPrincipal.getId(), id);
        return ResponseEntity.ok().build();
    }
}
```

- [ ] **Step 3: 创建 ProjectController**

```java
package cn.arorms.prp.task.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.task.entities.Project;
import cn.arorms.prp.task.services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ProjectController
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@RestController @RequestMapping("/api/project")
public class ProjectController {
    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Get all projects
    @GetMapping
    public List<Project> getAllProjects(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return projectService.getAllByUserId(userPrincipal.getId());
    }

    // Add a new project
    @PostMapping
    public ResponseEntity<Project> addProject(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Project project
    ) {
        return ResponseEntity.ok(projectService.addProject(userPrincipal.getId(), project));
    }

    // Change Order index
    @PutMapping("/updateOrder")
    public ResponseEntity<Project> updateOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Project project
    ) {
        return ResponseEntity.ok(projectService.updateProjectOrder(userPrincipal.getId(), project));
    }

    // Modify the project
    @PutMapping
    public ResponseEntity<Project> updateProject(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Project project
    ) {
        return ResponseEntity.ok(projectService.updateProject(userPrincipal.getId(), project));
    }

    // Delete the project
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id
    ) {
        projectService.deleteProject(userPrincipal.getId(), id);
        return ResponseEntity.ok().build();
    }
}
```

- [ ] **Step 4: 创建 AuthController**

```java
package cn.arorms.prp.task.controllers;

import cn.arorms.framework.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @GetMapping("/me")
    public ResponseEntity<UserPrincipal> getUserInfo(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userPrincipal);
    }
}
```

- [ ] **Step 5: 创建 SecurityConfig**

```java
package cn.arorms.prp.app.configs;

import cn.arorms.framework.security.KeycloakAuthenticationConverter;
import cn.arorms.framework.security.SecurityAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * SecurityConfig
 *
 * @author Cacciatore
 * @version 1.0 2026-09-03
 */
@Configuration
@EnableWebSecurity
@Import(SecurityAutoConfiguration.class)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            KeycloakAuthenticationConverter<?> converter
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(converter))
                );
        return http.build();
    }
}
```

- [ ] **Step 6: 编译验证**

```bash
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL（含 prp-app 对 prp-common、arorms-security 的解析）。

---

### Task 7: 配置文件与冒烟测试

**Files:**
- Create: `backend/prp-app/src/main/resources/application.yml`
- Create: `backend/prp-app/src/test/java/cn/arorms/prp/app/BackendApplicationTests.java`

**Interfaces:**
- Consumes: Task 5/6 的配置键（`application.security.cors.allowed-origins`、`application.security.jwt.audience`、`spring.security.oauth2.resourceserver.jwt.issuer-uri`）
- Produces: 可启动应用（`./gradlew :prp-app:bootRun`）；contextLoads 测试

- [ ] **Step 1: 创建 application.yml**

```yaml
# Server Settings
server:
  port: 8080

# Datasource Settings
spring:
  datasource:
    driver-class-name: org.postgresql.Driver
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/prp
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD}

  # JPA / Hibernate Settings
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
    database-platform: org.hibernate.dialect.PostgreSQLDialect

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER:https://auth.arorms.cn/realms/arorms}

application:
  security:
    jwt:
      audience: ${JWT_AUD:prp-backend}
    cors:
      allowed-origins: ${ALLOWED_ORIGINS:https://todo.arorms.cn,http://localhost:5173}
```

- [ ] **Step 2: 创建 contextLoads 测试**

```java
package cn.arorms.prp.app;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BackendApplicationTests {
	@Test
	void contextLoads() {
	}
}
```

注意：contextLoads 需要可达的 Keycloak issuer（JwtDecoders.fromIssuerLocation 在启动时拉取公钥）。若本地环境不可达，用环境变量指向本地 Keycloak（如 `JWT_ISSUER=http://192.168.0.111:9000/realms/arorms`）再跑测试；或先验证 `bootJar` 产物正确，把 context 测试留待集成环境。

- [ ] **Step 3: 全量构建验证**

```bash
./gradlew build
```

Expected: BUILD SUCCESSFUL；`prp-common/build/libs/prp-common-0.0.1-SNAPSHOT.jar` 与 `prp-app/build/libs/prp-app-0.0.1-SNAPSHOT.jar`（Boot 可执行 jar）生成。

- [ ] **Step 4: 数据库连通验证（本地 PG 可用时）**

本地 PostgreSQL 创建 `prp` 库后：

```bash
DB_PASSWORD=<本地密码> ./gradlew :prp-app:bootRun
```

Expected: 启动无报错；连接 PG 确认自动建表：

```bash
psql -h localhost -U postgres -d prp -c "\dt"
```

Expected 输出含 `tasks`、`projects` 两表。Ctrl+C 停止。

---

### Task 8: .http 测试脚本迁移（改名）

**Files:**
- Create: `backend/prp-app/src/test/http/connectionTest.http`
- Create: `backend/prp-app/src/test/http/http-client.private.env.json`
- Create: `backend/prp-app/src/test/http/task/getTask.http`
- Create: `backend/prp-app/src/test/http/task/addTask.http`
- Create: `backend/prp-app/src/test/http/task/toggleCompleteTask.http`
- Create: `backend/prp-app/src/test/http/task/updateTask.http`
- Create: `backend/prp-app/src/test/http/task/deleteTask.http`
- Create: `backend/prp-app/src/test/http/project/getProject.http`
- Create: `backend/prp-app/src/test/http/project/addProject.http`
- Create: `backend/prp-app/src/test/http/project/updateProject.http`
- Create: `backend/prp-app/src/test/http/project/changeProjectOrder.http`
- Create: `backend/prp-app/src/test/http/project/deleteProject.http`
- Create: `backend/prp-app/src/test/http/auth/get_me.http`

**Interfaces:**
- Consumes: Task 6 的 REST 端点
- Produces: IntelliJ HTTP Client 测试脚本集（token 从 `http-client.private.env.json` 的 `accessToken` 读取）

说明：源项目 `src/test/http/user/changePassword.http`、`getMe.http` 与 `auth/login.http`、`register.http` 指向已不存在的 `/api/user/*`、`/api/auth/login`、`/api/auth/register` 端点（arlist 旧自有认证遗留），**不迁移**；`deleteGroup.http` 实为无关示例请求，不迁移。

- [ ] **Step 1: connectionTest.http**

```http
GET http://localhost:8080

```

- [ ] **Step 2: http-client.private.env.json**

从 `/home/cacc/Repositories/arlist/backend/src/test/http/http-client.private.env.json` 复制 `dev` 环境（host + accessToken），`host` 改为 `"localhost:8080"`。此文件含私人 token，保持私有文件性质（不入库由用户决定）。

```json
{
  "dev": {
    "host": "localhost:8080",
    "accessToken": "<从源文件复制，或运行时从本地 Keycloak 重新获取>"
  }
}
```

- [ ] **Step 3: task/getTask.http**

```http
@baseUrl = http://localhost:8080

### Get tasks
GET {{baseUrl}}/api/task
    ?page=0&size=20

### Get tasks by project
GET {{baseUrl}}/api/task
    ?projectId=1&page=0&size=20

### Get task detail
GET {{baseUrl}}/api/task/1

### Get tasks by deadline
GET {{baseUrl}}/api/task/deadline
    ?page=0&size=20
```

- [ ] **Step 4: task/addTask.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Add a task
POST {{baseUrl}}/api/task/add
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Implement prp backend",
  "description": "Migrated from arlist todo",
  "project": {
    "id": 1
  },
  "deadline": "2026-09-10T18:00:00"
}

### Add a task without project
POST {{baseUrl}}/api/task/add
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Standalone task"
}
```

- [ ] **Step 5: task/toggleCompleteTask.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Toggle complete
PUT {{baseUrl}}/api/task/toggleComplete/1
Authorization: Bearer {{token}}
```

- [ ] **Step 6: task/updateTask.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Update a task
PUT {{baseUrl}}/api/task
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "isCompleted": false
}
```

- [ ] **Step 7: task/deleteTask.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Delete a task
DELETE {{baseUrl}}/api/task/1
Authorization: Bearer {{token}}
```

- [ ] **Step 8: project/getProject.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Get projects
GET {{baseUrl}}/api/project
Authorization: Bearer {{token}}
```

- [ ] **Step 9: project/addProject.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Add a project
POST {{baseUrl}}/api/project
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Work",
  "description": "Work related tasks"
}

### Add with ID must fail (400/500)
POST {{baseUrl}}/api/project
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id": 99,
  "name": "Invalid"
}
```

- [ ] **Step 10: project/updateProject.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Update a project
PUT {{baseUrl}}/api/project
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id": 1,
  "name": "Work",
  "description": "Renamed description"
}
```

- [ ] **Step 11: project/changeProjectOrder.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Change project order
PUT {{baseUrl}}/api/project/updateOrder
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id": 1,
  "name": "Work",
  "orderIndex": 2,
  "description": "Work related tasks"
}
```

- [ ] **Step 12: project/deleteProject.http**

```http
@baseUrl = http://localhost:8080
@token = {{accessToken}}

### Delete a project
DELETE {{baseUrl}}/api/project/1
Authorization: Bearer {{token}}
```

- [ ] **Step 13: auth/get_me.http**

```http
GET /api/auth/me HTTP/1.1
Host: {{host}}
Authorization: Bearer {{accessToken}}
```

- [ ] **Step 14: 端到端验证（本地 PG + Keycloak 可用时）**

启动应用后依序执行 addProject → addTask → getTask → toggleCompleteTask → changeProjectOrder → deleteTask → deleteProject，确认与 arlist 行为等价（分页 JSON 结构、移位后 orderIndex 连续）。

---

### Task 9: README 与收尾

**Files:**
- Create: `backend/README.md`
- Delete: `backend/HELP.md`（若 Task 1 未删）

**Interfaces:**
- Consumes: 全部前序任务
- Produces: 项目文档（模块结构、启动方式、环境变量表、Keycloak audience 提示）

- [ ] **Step 1: 创建 backend/README.md**

```markdown
# PRP Backend

Personal Resource Planning 后端。多模块 Gradle 工程（Spring Boot 4.1.1 / Java 21 / JPA / PostgreSQL / Keycloak）。

## 模块

- `prp-common`：公共配置（CORS、分页序列化）、全局异常处理、枚举
- `prp-task`：实体（Task、Project）、Repository、Service、控制器
- `prp-app`：REST 控制器、安全配置（Keycloak JWT 资源服务器）、启动类

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
./gradlew build          # 全量构建
./gradlew :prp-app:test   # contextLoads
```

HTTP 接口测试脚本在 `prp-app/src/test/http/`（IntelliJ HTTP Client，token 配置于私有 env 文件）。
```

- [ ] **Step 2: 最终全量验证**

```bash
./gradlew clean build
```

Expected: BUILD SUCCESSFUL，无警告级依赖解析失败；双 jar 产物存在。

- [ ] **Step 3: 向用户汇报**

列出：完成的模块/文件、构建结果、待用户处理事项（Keycloak `prp-backend` audience、CORS origins 调整、`http-client.private.env.json` 的 token 更新、git 提交组织）。
