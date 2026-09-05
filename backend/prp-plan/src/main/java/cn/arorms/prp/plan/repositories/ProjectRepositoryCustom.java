package cn.arorms.prp.plan.repositories;

/**
 * QueryDSL fragment replacing order-index shift bulk updates.
 */
public interface ProjectRepositoryCustom {
    void shiftForward(int start, int end, String userId);

    void shiftBackward(int start, int end, String userId);
}
