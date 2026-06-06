import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'clnt-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  // Données simples pour rendre la page évolutive (SSR-safe)
  title = 'Clinique Trinité';
  subtitle =
    'Gestion intelligente et sécurisée des patients et des dossiers médicaux';

  features = [
    {
      icon: '📁',
      title: 'Dossiers patients',
      description: 'Centralisation et accès rapide aux informations médicales',
    },
    {
      icon: '📅',
      title: 'Rendez-vous',
      description: 'Planification intelligente et notifications automatiques',
    },
    {
      icon: '🔐',
      title: 'Sécurité',
      description: 'Accès sécurisé via JWT et gestion des rôles',
    },
  ];
}
