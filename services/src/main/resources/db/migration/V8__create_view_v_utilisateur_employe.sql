-- ============================================================
-- V8 : Creation de la vue
-- ============================================================


create view v_utilisateur_employe as
select u.*, e.id as employe_id from utilisateurs u
left join employes e  on u.id=e.utilisateur_id;
