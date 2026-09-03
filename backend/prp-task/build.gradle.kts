plugins {
    id("java-library")
}

dependencies {
    api("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation(project(":prp-common"))
    implementation("cn.arorms.framework:arorms-common:1.0-SNAPSHOT")
    implementation("cn.arorms.framework:arorms-security:1.0-SNAPSHOT")
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
}
