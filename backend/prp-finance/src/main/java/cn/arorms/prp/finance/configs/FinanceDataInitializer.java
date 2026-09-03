package cn.arorms.prp.finance.configs;

import cn.arorms.prp.finance.entities.Category;
import cn.arorms.prp.finance.repositories.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the 12 system categories (ported from PFM V2__seed_default_categories.sql).
 * DDL creates the table; this runner inserts presets once when none exist.
 * Re-runnable: skips when system rows already present.
 */
@Component
public class FinanceDataInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(FinanceDataInitializer.class);
    private final CategoryRepository categoryRepository;

    public FinanceDataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepository.countByUserIdIsNull() > 0) {
            return;
        }
        log.info("Seeding system categories...");
        seed(null, "餐饮", "EXPENSE", "Food", 1);
        seed(null, "交通", "EXPENSE", "Car", 2);
        seed(null, "购物", "EXPENSE", "ShoppingCart", 3);
        seed(null, "娱乐", "EXPENSE", "Film", 4);
        seed(null, "居家", "EXPENSE", "HomeFilled", 5);
        seed(null, "医疗", "EXPENSE", "FirstAidKit", 6);
        seed(null, "教育", "EXPENSE", "Reading", 7);
        seed(null, "其他支出", "EXPENSE", "More", 99);
        seed(null, "工资", "INCOME", "Money", 1);
        seed(null, "奖金", "INCOME", "TrophyBase", 2);
        seed(null, "投资", "INCOME", "TrendCharts", 3);
        seed(null, "其他收入", "INCOME", "More", 99);
        log.info("System categories seeded.");
    }

    private void seed(String userId, String name, String type, String icon, int sortOrder) {
        Category c = Category.builder()
                .userId(userId)
                .name(name)
                .type(type)
                .icon(icon)
                .sortOrder(sortOrder)
                .isSystem(1)
                .build();
        categoryRepository.save(c);
    }
}
