package cn.arorms.prp.plan.entities;

/**
 * Lifecycle state of a task.
 */
public enum TaskStatus {
    NOT_STARTED("未开始"),
    IN_PROGRESS("进行中"),
    COMPLETED("已完成"),
    CANCELLED("废止");

    private final String label;

    TaskStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
