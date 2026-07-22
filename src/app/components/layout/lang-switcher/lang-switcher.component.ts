import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import {
  I18nService,
  LANG_OPTIONS,
  LangOption,
} from '../../../core/services/i18n.service';

@Component({
  selector: 'clnt-lang-switcher',
  standalone: true,
  imports: [CommonModule, OverlayPanelModule, ButtonModule],
  template: `
    <div class="lang-switcher">
      <!-- Bouton déclencheur -->
      <button
        class="lang-btn"
        (click)="panel.toggle($event)"
        [attr.aria-label]="'Changer la langue — ' + i18n.currentOption().label"
        [attr.aria-expanded]="panelOpen()"
        type="button"
      >
        <span class="lang-flag" aria-hidden="true">{{
          i18n.currentOption().flag
        }}</span>
        <span class="lang-code">{{
          i18n.currentOption().code | uppercase
        }}</span>
        <i
          class="pi pi-chevron-down lang-chevron"
          [class.rotated]="panelOpen()"
          aria-hidden="true"
        ></i>
      </button>

      <!-- Dropdown overlay -->
      <p-overlayPanel
        #panel
        styleClass="lang-panel"
        (onShow)="panelOpen.set(true)"
        (onHide)="panelOpen.set(false)"
      >
        <div
          class="lang-dropdown"
          role="listbox"
          aria-label="Sélectionner la langue"
        >
          <div class="lang-dropdown-title">
            <i class="pi pi-globe" aria-hidden="true"></i>
            {{ i18n.t().topbar.language }}
          </div>
          @for (opt of langs; track opt.code) {
            <button
              class="lang-option"
              [class.lang-option-active]="i18n.currentLang() === opt.code"
              (click)="selectLang(opt, panel)"
              role="option"
              [attr.aria-selected]="i18n.currentLang() === opt.code"
              type="button"
            >
              <span class="opt-flag" aria-hidden="true">{{ opt.flag }}</span>
              <span class="opt-label">{{ opt.label }}</span>
              @if (i18n.currentLang() === opt.code) {
                <i class="pi pi-check opt-check" aria-hidden="true"></i>
              }
            </button>
          }
        </div>
      </p-overlayPanel>
    </div>
  `,
  styles: [
    `
      .lang-switcher {
        position: relative;
      }

      .lang-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background: transparent;
        border: 0.5px solid var(--p-surface-100, #d3d1c7);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s;
        color: var(--p-text-muted-color, #5f5e5a);
        font-size: 13px;
        font-weight: 500;

        &:hover {
          background: var(--p-surface-50, #f1efe8);
          border-color: var(--p-primary-color, #185fa5);
          color: var(--p-primary-color, #185fa5);
        }
      }

      .lang-flag {
        font-size: 16px;
        line-height: 1;
      }
      .lang-code {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      .lang-chevron {
        font-size: 11px;
        transition: transform 0.2s ease;
        &.rotated {
          transform: rotate(180deg);
        }
      }

      /* Dropdown */
      .lang-dropdown {
        min-width: 160px;
        padding: 4px;
      }

      .lang-dropdown-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 500;
        color: var(--p-text-muted-color, #5f5e5a);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 6px 10px 8px;
        border-bottom: 0.5px solid var(--p-surface-100, #d3d1c7);
        margin-bottom: 4px;
        .pi {
          font-size: 13px;
        }
      }

      .lang-option {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 10px;
        border: none;
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
        transition: background 0.12s;
        text-align: left;

        &:hover {
          background: var(--p-surface-50, #f1efe8);
        }

        &.lang-option-active {
          background: var(--p-primary-50, #e6f1fb);
          color: var(--p-primary-color, #185fa5);
          .opt-label {
            font-weight: 500;
          }
        }
      }

      .opt-flag {
        font-size: 18px;
      }
      .opt-label {
        font-size: 14px;
        flex: 1;
      }
      .opt-check {
        font-size: 13px;
        color: var(--p-primary-color, #185fa5);
      }

      /* Override PrimeNG overlay panel */
      :host ::ng-deep .lang-panel {
        .p-overlaypanel {
          border-radius: 10px;
          border: 0.5px solid var(--p-surface-100, #d3d1c7);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          padding: 0;
          margin-top: 6px;
        }
        .p-overlaypanel-content {
          padding: 0;
        }
      }
    `,
  ],
})
export class LangSwitcherComponent {
  i18n = inject(I18nService);
  panelOpen = signal(false);
  langs = LANG_OPTIONS;

  selectLang(opt: LangOption, panel: any): void {
    this.i18n.setLang(opt.code);
    panel.hide();
  }
}
