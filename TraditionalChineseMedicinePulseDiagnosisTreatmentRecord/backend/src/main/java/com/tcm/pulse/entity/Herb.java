package com.tcm.pulse.entity;

import javax.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Data
@Entity
@Table(name = "herb")
public class Herb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Column(length = 50)
    private String category;

    @Column(length = 20)
    private String nature;

    @Column(length = 20)
    private String flavor;

    @Column(name = "channel_tropism", length = 200)
    private String channelTropism;

    @Column(name = "dosage_range", length = 50)
    private String dosageRange;

    @Column(columnDefinition = "TEXT")
    private String contraindications;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "herb", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<HerbAlias> aliases;
}
