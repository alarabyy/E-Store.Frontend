import { Product } from './product.model';

export interface CatalogDto {
    categories: CategoryWithProductsDto[];
}

export interface CategoryWithProductsDto {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
    products: Product[];
}
