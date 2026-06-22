from django.contrib import admin

from .models import ProductCategory, Product, Inventory


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    readonly_fields = ("id", "created_at", "updated_at")


class InventoryInline(admin.TabularInline):
    model = Inventory
    extra = 0
    fields = ("quantity", "inventory_type", "unit_metric", "unit_purchase_price", "unit_sale_price", "price_includes_tax")
    readonly_fields = ("created_at",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "product_category", "user", "created_at")
    list_filter = ("product_category",)
    search_fields = ("name", "user__phone_number")
    readonly_fields = ("id", "created_at", "updated_at")
    inlines = [InventoryInline]


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "id", "product", "quantity", "inventory_type", "unit_metric",
        "unit_purchase_price", "unit_sale_price", "price_includes_tax", "user",
    )
    list_filter = ("inventory_type", "unit_metric", "price_includes_tax")
    search_fields = ("product__name", "user__phone_number")
    readonly_fields = ("id", "created_at", "updated_at")
