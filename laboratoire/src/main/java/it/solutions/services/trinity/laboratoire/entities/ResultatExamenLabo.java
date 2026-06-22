package it.solutions.services.trinity.laboratoire.entities;

import it.solutions.services.trinity.core.shared.entities.UserLight;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "resultats_labo")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ResultatExamenLabo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examen_id", nullable = false, unique = true)
    private ExamenLabo examen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laborantin_id", nullable = false)
    private UserLight laborantin;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<ParametreResultat> parametres;

    @Column(columnDefinition = "TEXT")
    private String interpretation;

    @Column(name = "pdf_path", length = 500)
    private String pdfPath;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}


