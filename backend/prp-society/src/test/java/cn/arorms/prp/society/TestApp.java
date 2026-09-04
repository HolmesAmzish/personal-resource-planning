package cn.arorms.prp.society;

import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Test anchor providing Spring Boot configuration for society module tests.
 * prp-society is a plain library (no Boot app class by design, like prp-finance).
 */
@SpringBootApplication(scanBasePackages = "cn.arorms.prp.society")
public class TestApp {
}
