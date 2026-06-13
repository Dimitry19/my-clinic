package it.solutions.services.trinity.core.shared.dao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserDao extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    @Query("""
            SELECT new it.solutions.services.trinity.core.shared.entities.UserLight(id,email,nom,prenom,role)
            FROM User u
            WHERE u.id = :id
            """)
    Optional<UserLight> findUserLight(@Param("id") UUID id);
}
