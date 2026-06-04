package com.tcm.pulse.entity;

import javax.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "compatibility_rule", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"herb_a_id", "herb_b_id"}, name = "uk_herb_pair")
})
public class CompatibilityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "herb_a_id", nullable = false)
    private Long herbAId;

    @Column(name = "herb_b_id", nullable = false)
    private Long herbBId;

    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "herb_a_id", insertable = false, updatable = false)
    @JsonIgnore
    private Herb herbA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "herb_b_id", insertable = false, updatable = false)
    @JsonIgnore
    private Herb herbB;
}
