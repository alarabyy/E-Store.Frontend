import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';

@Component({
    selector: 'app-service-setup-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './service-setup-modal.component.html',
    styleUrls: ['./service-setup-modal.component.scss']
})
export class ServiceSetupModalComponent implements OnInit {
    private fb = inject(FormBuilder);

    @Input() serviceName: string = '';
    @Input() configurationKeys: string[] = [];
    @Input() initialValues: Record<string, string> = {};
    @Output() save = new EventEmitter<Record<string, string>>();
    @Output() close = new EventEmitter<void>();

    configForm!: FormGroup;

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        const fieldsArray = this.fb.array(
            this.configurationKeys.map(key => this.fb.group({
                key: [key],
                value: [this.initialValues ? this.initialValues[key] || '' : '', Validators.required]
            }))
        );

        this.configForm = this.fb.group({
            fields: fieldsArray
        });
    }

    get configFields() {
        return (this.configForm.get('fields') as FormArray).controls;
    }

    onSave(): void {
        if (this.configForm.invalid) {
            this.configForm.markAllAsTouched();
            return;
        }

        const values: Record<string, string> = {};
        this.configForm.value.fields.forEach((f: any) => {
            values[f.key] = f.value;
        });

        this.save.emit(values);
    }

    onClose(): void {
        this.close.emit();
    }
}
