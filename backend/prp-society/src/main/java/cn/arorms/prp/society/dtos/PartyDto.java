package cn.arorms.prp.society.dtos;

import cn.arorms.prp.society.enums.PartyType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PartyDto {
    @NotNull
    private PartyType partyType;

    @NotBlank
    @Size(max = 128)
    private String name;

    @Size(max = 64)
    private String identityCode;

    @Size(max = 255)
    private String address;

    @Size(max = 16)
    private String gender;

    private LocalDate birthDate;

    @Size(max = 128)
    private String website;

    @Valid
    private List<ContactDto> contacts;
}
