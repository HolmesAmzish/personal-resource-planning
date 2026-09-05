package cn.arorms.prp.finance;

import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Test anchor providing &#64;SpringBootConfiguration for slice tests.
 * prp-finance is a plain library (no Boot app class by design, like prp-plan).
 */
@SpringBootApplication(scanBasePackages = "cn.arorms.prp.finance")
public class TestApp {
}
