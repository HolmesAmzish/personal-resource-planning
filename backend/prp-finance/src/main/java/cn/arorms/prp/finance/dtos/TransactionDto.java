package cn.arorms.prp.finance.dtos;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionDto {
    private Long fromAccountId;
    private Long toAccountId;
    private Long categoryId;
    @NotBlank private String type;
    @NotNull @Positive private BigDecimal amount;
    @NotNull private LocalDate occurredOn;
    private String note;

    @AssertTrue(message = "至少需要填写 fromAccountId 或 toAccountId")
    public boolean isAccountValid() {
        return fromAccountId != null || toAccountId != null;
    }
}
