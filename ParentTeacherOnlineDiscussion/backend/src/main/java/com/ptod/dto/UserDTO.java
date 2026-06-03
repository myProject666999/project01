package com.ptod.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptod.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String username;
    private String name;

    @JsonIgnore
    private User.Role roleEnum;

    private String email;
    private String phone;
    private String subject;
    private String avatar;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Long ratingCount;

    public String getRole() {
        return roleEnum != null ? roleEnum.name().toLowerCase() : null;
    }

    public void setRole(String role) {
        if (role != null) {
            this.roleEnum = User.Role.valueOf(role.toUpperCase());
        }
    }
}
