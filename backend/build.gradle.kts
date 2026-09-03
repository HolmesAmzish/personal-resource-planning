import io.spring.gradle.dependencymanagement.dsl.DependencyManagementExtension

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

    configure<DependencyManagementExtension> {
        imports {
            mavenBom("org.springframework.boot:spring-boot-dependencies:4.1.1")
        }
    }

    java {
        toolchain {
            languageVersion = JavaLanguageVersion.of(21)
        }
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }
}
