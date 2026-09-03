package cn.arorms.prp.finance.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountDto {
    @NotBlank @Size(max = 64) private String name;
    @NotBlank private String type;
    private BigDecimal balance;
    @NotBlank private String currency;
    @Size(max = 255) private String note;
}
