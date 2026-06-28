package it.solutions.services.trinity.ordonnance.entities;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ordonnance_medicaments")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class OrdonnanceMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordonnance_id", nullable = false)
    private Ordonnance ordonnance;

    @NotBlank
    @Column(name = "medicament_nom", nullable = false, length = 200)
    private String medicamentNom;

    @Column(length = 100)
    private String dosage;

    @Column(length = 100)
    private String frequence;

    @Column(length = 100)
    private String duree;

    @Column(columnDefinition = "TEXT")
    private String instructions;
}
