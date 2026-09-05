plugins {
    id("java-library")
}

dependencies {
    api("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("cn.arorms.framework:arorms-common:1.0.0")
    api("com.querydsl:querydsl-jpa:5.1.0:jakarta")
}
