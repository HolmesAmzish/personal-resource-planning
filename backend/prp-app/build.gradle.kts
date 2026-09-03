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
