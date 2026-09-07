package cn.arorms.prp.society.dtos;

import cn.arorms.prp.society.enums.ContactType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactDto {
    private Long partyId;

    @NotNull
    private ContactType contactType;

    @NotBlank
    @Size(max = 255)
    private String content;
}
