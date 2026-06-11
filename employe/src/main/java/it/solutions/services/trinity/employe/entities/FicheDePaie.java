package it.solutions.services.trinity.employe.entities;

import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "fiches_de_paie")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FicheDePaie extends BaseEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @Column(nullable = false)
    private int mois;

    @Column(nullable = false)
    private int annee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireBrut;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cotisations = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal primes = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal retenues = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireNet;

    @Column
    private String pdfPath;

}
