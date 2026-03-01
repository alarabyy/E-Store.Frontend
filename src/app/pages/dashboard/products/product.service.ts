import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PagedResponse } from '../../../core/models/pagination.models';
import { Product, CreateProductRequest, UpdateProductRequest, ProductsAnalytics, AddProductVariantRequest } from './product.models';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products-dashboard`;
    private http = inject(HttpClient);

    getProducts(page: number = 1, pageSize: number = 10, categoryId?: number, searchTerm?: string): Observable<PagedResponse<Product>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        if (categoryId) params = params.set('categoryId', categoryId.toString());
        if (searchTerm) params = params.set('searchTerm', searchTerm);
        return this.http.get<PagedResponse<Product>>(`${this.apiUrl}/list`, { params });
    }

    getProductsAnalytics(): Observable<ApiResponse<ProductsAnalytics>> {
        return this.http.get<ApiResponse<ProductsAnalytics>>(`${this.apiUrl}/analytics`);
    }

    getProductById(id: number): Observable<ApiResponse<Product>> {
        return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
    }

    getProductBySlug(slug: string): Observable<ApiResponse<Product>> {
        // Use the public products endpoint as requested
        return this.http.get<ApiResponse<Product>>(`${environment.apiUrl}/products/${slug}`);
    }

    createProduct(req: CreateProductRequest): Observable<ApiResponse<number>> {
        const formData = new FormData();
        formData.append('Name', req.name);
        formData.append('Slug', req.slug);
        formData.append('Description', req.description);
        if (req.summary) formData.append('Summary', req.summary);
        formData.append('CategoryId', req.categoryId.toString());
        formData.append('IsFeatured', req.isFeatured.toString());
        if (req.variantType && req.variantType !== 'None') formData.append('VariantType', req.variantType);
        if (req.discountPercentage != null && req.discountPercentage !== '' as any) formData.append('DiscountPercentage', req.discountPercentage.toString());
        if (req.discountStartDate) formData.append('DiscountStartDate', req.discountStartDate);
        if (req.discountEndDate) formData.append('DiscountEndDate', req.discountEndDate);
        if (req.metaTitle) formData.append('MetaTitle', req.metaTitle);
        if (req.metaDescription) formData.append('MetaDescription', req.metaDescription);

        req.images.forEach((img) => formData.append('Images', img));

        // Single variant
        formData.append('Variant.Name', req.variant.name);
        formData.append('Variant.SKU', req.variant.sku);
        formData.append('Variant.Price', req.variant.price.toString());
        if (req.variant.salePrice != null) formData.append('Variant.SalePrice', req.variant.salePrice.toString());
        if (req.variant.stockQuantity != null) formData.append('Variant.StockQuantity', req.variant.stockQuantity.toString());
        if (req.variant.imageFile) formData.append('Variant.Image', req.variant.imageFile);

        req.attributes?.forEach((a, i) => {
            formData.append(`Attributes[${i}].AttributeId`, a.attributeId.toString());
            formData.append(`Attributes[${i}].Value`, a.value);
        });

        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/create`, formData);
    }

    updateProduct(req: UpdateProductRequest): Observable<ApiResponse<boolean>> {
        const formData = new FormData();
        formData.append('Id', req.id.toString());
        formData.append('Name', req.name);
        formData.append('Slug', req.slug);
        formData.append('Description', req.description);
        if (req.summary) formData.append('Summary', req.summary);
        formData.append('CategoryId', req.categoryId.toString());
        formData.append('IsFeatured', req.isFeatured.toString());
        formData.append('IsActive', req.isActive.toString());
        if (req.variantType && req.variantType !== 'None') formData.append('VariantType', req.variantType);
        if (req.discountPercentage != null && req.discountPercentage !== '' as any) formData.append('DiscountPercentage', req.discountPercentage.toString());
        if (req.discountStartDate) formData.append('DiscountStartDate', req.discountStartDate);
        if (req.discountEndDate) formData.append('DiscountEndDate', req.discountEndDate);
        if (req.metaTitle) formData.append('MetaTitle', req.metaTitle);
        if (req.metaDescription) formData.append('MetaDescription', req.metaDescription);

        req.existingImages.forEach((url) => formData.append('ExistingImages', url));
        req.newImages?.forEach((img) => formData.append('NewImages', img));

        // Variants are handled separately in the backend UpdateProduct (not present in the command)

        req.attributes?.forEach((a, i) => {
            formData.append(`Attributes[${i}].AttributeId`, a.attributeId.toString());
            formData.append(`Attributes[${i}].Value`, a.value);
        });

        return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${req.id}/edit`, formData);
    }

    addProductVariant(req: AddProductVariantRequest): Observable<ApiResponse<number>> {
        const formData = new FormData();
        formData.append('ProductId', req.productId.toString());
        formData.append('Name', req.name);
        formData.append('SKU', req.sku);
        formData.append('Price', req.price.toString());
        if (req.salePrice != null) formData.append('SalePrice', req.salePrice.toString());
        if (req.stockQuantity != null) formData.append('StockQuantity', req.stockQuantity.toString());
        if (req.image) formData.append('Image', req.image);

        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/variants/add`, formData);
    }

    deleteProduct(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}/delete`);
    }
}
