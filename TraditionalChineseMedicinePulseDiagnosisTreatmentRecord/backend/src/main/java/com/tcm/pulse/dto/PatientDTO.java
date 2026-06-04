package com.tcm.pulse.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PatientDTO {

    private Long id;

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "性别不能为空")
    private String gender;

    @NotNull(message = "年龄不能为空")
    private Integer age;

    private String phone;

    private String idCard;

    private String address;

    private String remark;
}
