from django.contrib import admin

from .models import Sale, SaleDetail


class SaleDetailInline(admin.TabularInline):
    model = SaleDetail
    extra = 0
    fields = ("inventory", "quantity", "unit_price", "total_tax", "total_price")
    readonly_fields = ("total_price",)


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("id", "sub_total", "tax_total", "total", "amount_paid", "transaction", "created_at")
    search_fields = ("id",)
    readonly_fields = ("id", "created_at", "updated_at")
    inlines = [SaleDetailInline]


@admin.register(SaleDetail)
class SaleDetailAdmin(admin.ModelAdmin):
    list_display = ("id", "sale", "inventory", "quantity", "unit_price", "total_tax", "total_price")
    search_fields = ("sale__id", "inventory__product__name")
    readonly_fields = ("id", "created_at", "updated_at")
