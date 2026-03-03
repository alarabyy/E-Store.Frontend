import { Component, inject, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StoreSettings } from '../../../models/store.models';
import { GeneralInfoService } from '../general-info/general-info.service';
import { ToastService } from '../../../../../../components/toast/services/toast.service';
import { ApiResponse } from '../../../../../../core/api/models/api-response.model';

interface ColorGroup {
    title: string;
    colors: ColorField[];
}

interface ColorField {
    key: string;
    label: string;
    defaultValue: string;
}

@Component({
    selector: 'app-theme-colors',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './theme-colors.component.html',
    styleUrl: './theme-colors.component.scss'
})
export class ThemeColorsComponent implements OnChanges {
    @Input() settings: StoreSettings | null = null;

    colorsForm: FormGroup;
    isSaving = false;
    activeGroup: string = 'buttons';

    colorGroups: ColorGroup[] = [
        {
            title: 'Button Colors',
            colors: [
                { key: 'buttonPrimaryColor', label: 'Primary Button Color', defaultValue: '#1e40af' },
                { key: 'buttonPrimaryTextColor', label: 'Primary Button Text Color', defaultValue: '#ffffff' },
                { key: 'buttonPrimaryHoverColor', label: 'Primary Button Hover Color', defaultValue: '#1e3a8a' },
                { key: 'buttonSecondaryColor', label: 'Secondary Button Color', defaultValue: '#6b7280' },
                { key: 'buttonSecondaryTextColor', label: 'Secondary Button Text Color', defaultValue: '#ffffff' },
                { key: 'buttonSecondaryHoverColor', label: 'Secondary Button Hover Color', defaultValue: '#4b5563' },
                { key: 'buttonSuccessColor', label: 'Success Button Color', defaultValue: '#10b981' },
                { key: 'buttonSuccessTextColor', label: 'Success Button Text Color', defaultValue: '#ffffff' },
                { key: 'buttonDangerColor', label: 'Danger Button Color', defaultValue: '#ef4444' },
                { key: 'buttonDangerTextColor', label: 'Danger Button Text Color', defaultValue: '#ffffff' },
                { key: 'buttonWarningColor', label: 'Warning Button Color', defaultValue: '#f59e0b' },
                { key: 'buttonWarningTextColor', label: 'Warning Button Text Color', defaultValue: '#ffffff' },
                { key: 'buttonInfoColor', label: 'Info Button Color', defaultValue: '#3b82f6' },
                { key: 'buttonInfoTextColor', label: 'Info Button Text Color', defaultValue: '#ffffff' },
                { key: 'buttonDisabledColor', label: 'Disabled Button Color', defaultValue: '#e5e7eb' },
                { key: 'buttonDisabledTextColor', label: 'Disabled Button Text Color', defaultValue: '#9ca3af' }
            ]
        },
        {
            title: 'Text Colors',
            colors: [
                { key: 'textPrimaryColor', label: 'Primary Text Color', defaultValue: '#1f2937' },
                { key: 'textSecondaryColor', label: 'Secondary Text Color', defaultValue: '#6b7280' },
                { key: 'textMutedColor', label: 'Muted Text Color', defaultValue: '#9ca3af' },
                { key: 'textHeadingColor', label: 'Heading Text Color', defaultValue: '#111827' },
                { key: 'textBodyColor', label: 'Body Text Color', defaultValue: '#374151' },
                { key: 'textLinkColor', label: 'Link Color', defaultValue: '#3b82f6' },
                { key: 'textLinkHoverColor', label: 'Link Hover Color', defaultValue: '#2563eb' },
                { key: 'textErrorColor', label: 'Error Text Color', defaultValue: '#ef4444' },
                { key: 'textSuccessColor', label: 'Success Text Color', defaultValue: '#10b981' }
            ]
        },
        {
            title: 'Background Colors',
            colors: [
                { key: 'backgroundPrimaryColor', label: 'Primary Background Color', defaultValue: '#ffffff' },
                { key: 'backgroundSecondaryColor', label: 'Secondary Background Color', defaultValue: '#f9fafb' },
                { key: 'backgroundCardColor', label: 'Card Background Color', defaultValue: '#ffffff' },
                { key: 'backgroundSectionColor', label: 'Section Background Color', defaultValue: '#f3f4f6' },
                { key: 'backgroundOverlayColor', label: 'Overlay Background Color', defaultValue: 'rgba(0, 0, 0, 0.5)' },
                { key: 'backgroundDarkColor', label: 'Dark Background Color', defaultValue: '#111827' }
            ]
        },
        {
            title: 'Border Colors',
            colors: [
                { key: 'borderPrimaryColor', label: 'Primary Border Color', defaultValue: '#e5e7eb' },
                { key: 'borderSecondaryColor', label: 'Secondary Border Color', defaultValue: '#d1d5db' },
                { key: 'borderInputColor', label: 'Input Border Color', defaultValue: '#d1d5db' },
                { key: 'borderInputFocusColor', label: 'Input Focus Border Color', defaultValue: '#3b82f6' },
                { key: 'borderCardColor', label: 'Card Border Color', defaultValue: '#e5e7eb' },
                { key: 'borderErrorColor', label: 'Error Border Color', defaultValue: '#ef4444' },
                { key: 'borderSuccessColor', label: 'Success Border Color', defaultValue: '#10b981' }
            ]
        },
        {
            title: 'Input Colors',
            colors: [
                { key: 'inputBackgroundColor', label: 'Input Background Color', defaultValue: '#ffffff' },
                { key: 'inputBorderColor', label: 'Input Border Color', defaultValue: '#d1d5db' },
                { key: 'inputFocusColor', label: 'Input Focus Color', defaultValue: '#3b82f6' },
                { key: 'inputPlaceholderColor', label: 'Input Placeholder Color', defaultValue: '#9ca3af' },
                { key: 'inputTextColor', label: 'Input Text Color', defaultValue: '#1f2937' },
                { key: 'inputErrorColor', label: 'Input Error Color', defaultValue: '#ef4444' },
                { key: 'inputDisabledBackgroundColor', label: 'Disabled Input Background Color', defaultValue: '#f3f4f6' },
                { key: 'inputDisabledTextColor', label: 'Disabled Input Text Color', defaultValue: '#9ca3af' }
            ]
        },
        {
            title: 'Navigation Colors',
            colors: [
                { key: 'navigationBackgroundColor', label: 'Navigation Background Color', defaultValue: '#ffffff' },
                { key: 'navigationTextColor', label: 'Navigation Text Color', defaultValue: '#1f2937' },
                { key: 'navigationActiveColor', label: 'Active Navigation Item Color', defaultValue: '#1e40af' },
                { key: 'navigationActiveTextColor', label: 'Active Navigation Text Color', defaultValue: '#ffffff' },
                { key: 'navigationHoverColor', label: 'Navigation Hover Color', defaultValue: '#f3f4f6' },
                { key: 'navigationHoverTextColor', label: 'Navigation Hover Text Color', defaultValue: '#1e40af' }
            ]
        },
        {
            title: 'Header & Footer Colors',
            colors: [
                { key: 'headerBackgroundColor', label: 'Header Background Color', defaultValue: '#ffffff' },
                { key: 'headerTextColor', label: 'Header Text Color', defaultValue: '#1f2937' },
                { key: 'headerBorderColor', label: 'Header Border Color', defaultValue: '#e5e7eb' },
                { key: 'footerBackgroundColor', label: 'Footer Background Color', defaultValue: '#111827' },
                { key: 'footerTextColor', label: 'Footer Text Color', defaultValue: '#ffffff' },
                { key: 'footerLinkColor', label: 'Footer Link Color', defaultValue: '#d1d5db' },
                { key: 'footerLinkHoverColor', label: 'Footer Link Hover Color', defaultValue: '#ffffff' }
            ]
        },
        {
            title: 'Badge Colors',
            colors: [
                { key: 'badgePrimaryColor', label: 'Primary Badge Background Color', defaultValue: '#dbeafe' },
                { key: 'badgePrimaryTextColor', label: 'Primary Badge Text Color', defaultValue: '#1e40af' },
                { key: 'badgeSuccessColor', label: 'Success Badge Background Color', defaultValue: '#d1fae5' },
                { key: 'badgeSuccessTextColor', label: 'Success Badge Text Color', defaultValue: '#065f46' },
                { key: 'badgeDangerColor', label: 'Danger Badge Background Color', defaultValue: '#fee2e2' },
                { key: 'badgeDangerTextColor', label: 'Danger Badge Text Color', defaultValue: '#991b1b' },
                { key: 'badgeWarningColor', label: 'Warning Badge Background Color', defaultValue: '#fef3c7' },
                { key: 'badgeWarningTextColor', label: 'Warning Badge Text Color', defaultValue: '#92400e' }
            ]
        },
        {
            title: 'Alert Colors',
            colors: [
                { key: 'alertSuccessBackgroundColor', label: 'Success Alert Background Color', defaultValue: '#d1fae5' },
                { key: 'alertSuccessTextColor', label: 'Success Alert Text Color', defaultValue: '#065f46' },
                { key: 'alertSuccessBorderColor', label: 'Success Alert Border Color', defaultValue: '#10b981' },
                { key: 'alertErrorBackgroundColor', label: 'Error Alert Background Color', defaultValue: '#fee2e2' },
                { key: 'alertErrorTextColor', label: 'Error Alert Text Color', defaultValue: '#991b1b' },
                { key: 'alertErrorBorderColor', label: 'Error Alert Border Color', defaultValue: '#ef4444' },
                { key: 'alertWarningBackgroundColor', label: 'Warning Alert Background Color', defaultValue: '#fef3c7' },
                { key: 'alertWarningTextColor', label: 'Warning Alert Text Color', defaultValue: '#92400e' },
                { key: 'alertWarningBorderColor', label: 'Warning Alert Border Color', defaultValue: '#f59e0b' },
                { key: 'alertInfoBackgroundColor', label: 'Info Alert Background Color', defaultValue: '#dbeafe' },
                { key: 'alertInfoTextColor', label: 'Info Alert Text Color', defaultValue: '#1e40af' },
                { key: 'alertInfoBorderColor', label: 'Info Alert Border Color', defaultValue: '#3b82f6' }
            ]
        }
    ];

    private generalInfoService = inject(GeneralInfoService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.colorsForm = this.fb.group({});
        this.initializeForm();
    }

    private initializeForm(): void {
        const formControls: any = {};
        this.colorGroups.forEach(group => {
            group.colors.forEach(color => {
                formControls[color.key] = [color.defaultValue];
            });
        });
        this.colorsForm = this.fb.group(formControls);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['settings'] && this.settings) {
            const formValues: any = {};
            this.colorGroups.forEach(group => {
                group.colors.forEach(color => {
                    const value = (this.settings as any)[color.key] || color.defaultValue;
                    formValues[color.key] = value;
                });
            });
            this.colorsForm.patchValue(formValues);
        }
    }

    setActiveGroup(groupTitle: string): void {
        this.activeGroup = groupTitle;
    }

    getActiveGroup(): ColorGroup | undefined {
        return this.colorGroups.find(g => g.title === this.activeGroup);
    }

    resetColor(colorKey: string): void {
        const colorField = this.colorGroups
            .flatMap(g => g.colors)
            .find(c => c.key === colorKey);
        if (colorField) {
            this.colorsForm.patchValue({ [colorKey]: colorField.defaultValue });
        }
    }

    resetAllColors(): void {
        const formValues: any = {};
        this.colorGroups.forEach(group => {
            group.colors.forEach(color => {
                formValues[color.key] = color.defaultValue;
            });
        });
        this.colorsForm.patchValue(formValues);
    }

    onSubmit(): void {
        if (this.colorsForm.invalid) {
            this.colorsForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formData = new FormData();
        const val = this.colorsForm.value;

        // Append all color values
        Object.keys(val).forEach(key => {
            if (val[key]) {
                // Convert camelCase to PascalCase for backend
                const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                formData.append(pascalKey, val[key]);
            }
        });

        this.generalInfoService.updateSettings(formData).subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.isSuccess) {
                    this.toastService.success('Colors updated successfully');
                    window.location.reload();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to update colors');
                }
                this.isSaving = false;
            },
            error: (err: any) => {
                this.isSaving = false;
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update colors';
                this.toastService.error(msg);
                console.error(err);
            }
        });
    }
}

