package com.tcm.pulse.entity;

import javax.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "herb_alias", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"herb_id", "alias_name"}, name = "uk_herb_alias")
})
public class HerbAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "herb_id", nullable = false)
    private Long herbId;

    @Column(name = "alias_name", nullable = false, length = 100)
    private String aliasName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "herb_id", insertable = false, updatable = false)
    @JsonIgnore
    private Herb herb;
}
