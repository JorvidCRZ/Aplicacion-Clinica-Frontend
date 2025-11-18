import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
    key: string;
    label: string;
    type?: 'text' | 'date' | 'status' | 'actions';
    sortable?: boolean;
    width?: string;
}

export interface TableAction {
    icon: string;
    label: string;
    action: string;
    class?: string;
}

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.css']
})
export class DataTableComponent {
    @Input() data: any[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() actions: TableAction[] = [];
    @Input() searchable: boolean = true;
    @Input() loading: boolean = false;
    @Input() emptyMessage: string = 'No hay datos disponibles';
    @Input() paginated: boolean = true;
    // Configuración de paginación
    @Input() pageSize: number = 10;
    @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

    @Output() actionClicked = new EventEmitter<{ action: string, item: any }>();
    @Output() sortChanged = new EventEmitter<{ column: string, direction: 'asc' | 'desc' }>();
    @Output() pageChanged = new EventEmitter<{ page: number, pageSize: number }>();

    searchTerm: string = '';
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    currentPage: number = 1;

    get filteredData() {
        if (!this.searchTerm) return this.data;

        return this.data.filter(item =>
            Object.values(item).some(value =>
                value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
            )
        );
    }

    get paginatedData() {
        if (!this.paginated) return this.filteredData;
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.filteredData.slice(startIndex, endIndex);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredData.length / this.pageSize);
    }

    get totalItems(): number {
        return this.filteredData.length;
    }

    get startItem(): number {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endItem(): number {
        return Math.min(this.currentPage * this.pageSize, this.totalItems);
    }

    onSort(column: TableColumn) {
        if (!column.sortable) return;

        if (this.sortColumn === column.key) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column.key;
            this.sortDirection = 'asc';
        }

        this.sortChanged.emit({
            column: column.key,
            direction: this.sortDirection
        });
    }

    onAction(action: string, item: any) {
        this.actionClicked.emit({ action, item });
    }

    onPageSizeChange() {
        this.currentPage = 1; 
        this.pageChanged.emit({ page: this.currentPage, pageSize: this.pageSize });
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.pageChanged.emit({ page: this.currentPage, pageSize: this.pageSize });
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.pageChanged.emit({ page: this.currentPage, pageSize: this.pageSize });
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.pageChanged.emit({ page: this.currentPage, pageSize: this.pageSize });
        }
    }

    get pageNumbers(): number[] {
        const pages: number[] = [];
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }

    getColumnValue(item: any, column: TableColumn): string {
        const value = item[column.key];

        switch (column.type) {
            case 'date':
                return value ? new Date(value).toLocaleDateString() : '-';
            case 'status':
                return this.getStatusDisplay(value);
            default:
                return value || '-';
        }
    }

    private getStatusDisplay(status: string): string {
        const statusMap: { [key: string]: string } = {
            'activo': 'Activo',
            'inactivo': ' Inactivo',
            'pendiente': ' Pendiente',
            'completado': ' Completado',
            'cancelado': ' Cancelado'
        };
        return statusMap[status?.toLowerCase()] || status;
    }
}