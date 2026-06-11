-- Fiche de paie

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',1,2026,30000,2700,200,500,28800 , null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',2,2026,30000,2700,0,0,27300, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',3,2026,30000,2700,3000,0,30300, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',4,2026,30000,2700,0,1000,26300, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',5,2026,30000,2700,200,500,28800, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',6,2026,30000,2700,0,0,27300, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',7,2026,30000,2700,3000,0,30300, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',8,2026,30000,2700,0,1000,26300, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',9,2026,30000,2700,200,500,28800, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',10,2026,30000,2700,0,0,27300, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',11,2026,30000,2700,3000,0,30300, null);

INSERT INTO fiches_de_paie(employe_id,mois,annee,salaire_brut,cotisations,primes,retenues,salaire_net,pdf_path)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6',12,2026,30000,2700,0,1000,26300, null);




-- Conges
INSERT INTO conges(employe_id,type_conge,date_debut,date_fin,motif,statut,approuve_par)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6','Congé annuel','2026-04-14','2026-04-21','Vacances','APPROUVE', '20aa6208-78e5-4fec-b377-d27f5fec37c7');

INSERT INTO conges(employe_id,type_conge,date_debut,date_fin,motif,statut,approuve_par)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6','Congé maladie','2026-05-02','2026-05-07','Grippe','APPROUVE', '20aa6208-78e5-4fec-b377-d27f5fec37c7');

INSERT INTO conges(employe_id,type_conge,date_debut,date_fin,motif,statut,approuve_par)
values('1cf732c1-afd3-4863-a0e1-0194c34d2ce6','Congé familial','2026-06-15','2026-06-17','Vacances','EN_ATTENTE', '20aa6208-78e5-4fec-b377-d27f5fec37c7');
