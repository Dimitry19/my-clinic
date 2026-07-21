import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'clnt-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-card" [class]="cardClass()">
      <div class="sc-icon" [class]="iconContainerClass()">
        <i class="pi" [ngClass]="iconClass()" aria-hidden="true"></i>
      </div>
      <div class="sc-body">
        <span class="sc-val">{{ displayValue() }}</span>
        <span class="sc-label">{{ label() }}</span>
      </div>
    </div>
  `,
})
export class SummaryCardComponent {
  // ── Inputs obligatoires ───────────────────────────────
  label = input.required<string>();
  iconClass = input.required<string>();

  // ── Inputs optionnels ─────────────────────────────────
  // Valeur simple (nombre, texte)
  size = input<number | string | null>(null);

  // Couleur icône : sc-blue | sc-green | sc-amber | sc-red | sc-purple
  scClass = input<string>('sc-blue');

  // Classe CSS conditionnelle sur la card (ex: sc-danger)
  cardExtraClass = input<string>('');

  // Valeur formatée (override size si fourni)
  formattedValue = input<string | null>(null);

  // Suffixe après la valeur (ex: 'HTG')
  suffix = input<string>('');

  // ── Condition dynamique (pour cas comme soldeDu) ──────
  // Quand true → utilise trueScClass + trueIconClass
  // Quand false → utilise scClass + iconClass (inputs normaux)
  condition = input<boolean | null>(null);
  trueScClass = input<string>('sc-red');
  falseScClass = input<string>('sc-green');
  trueIconClass = input<string>('');
  falseIconClass = input<string>('');
  trueCardClass = input<string>('');
  falseCardClass = input<string>('');

  // ── Computed ──────────────────────────────────────────
  isConditional = computed(() => this.condition() !== null);

  resolvedScClass = computed(() => {
    if (!this.isConditional()) return this.scClass();
    return this.condition() ? this.trueScClass() : this.falseScClass();
  });

  resolvedIconClass = computed(() => {
    if (!this.isConditional()) return this.iconClass();
    const trueIc = this.trueIconClass() || this.iconClass();
    const falseIc = this.falseIconClass() || this.iconClass();
    return this.condition() ? trueIc : falseIc;
  });

  cardClass = computed(() => {
    const parts = ['summary-card'];
    if (this.cardExtraClass()) parts.push(this.cardExtraClass());
    if (this.isConditional()) {
      const cls = this.condition()
        ? this.trueCardClass()
        : this.falseCardClass();
      if (cls) parts.push(cls);
    }
    return parts.join(' ');
  });

  iconContainerClass = computed(() => `sc-icon ${this.resolvedScClass()}`);

  displayValue = computed(() => {
    if (this.formattedValue() !== null) return this.formattedValue()!;
    const v = this.size();
    if (v === null || v === undefined) return '—';
    const suffix = this.suffix() ? ` ${this.suffix()}` : '';
    return `${v}${suffix}`;
  });
}
