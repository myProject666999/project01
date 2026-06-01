package com.ptod.dto;

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
    private User.Role role;
    private String email;
    private String phone;
    private String subject;
    private String avatar;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Long ratingCount;
}
