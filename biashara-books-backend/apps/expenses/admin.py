from django.contrib import admin

from .models import ExpenseType, Expense


@admin.register(ExpenseType)
class ExpenseTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("id", "expense_type", "other_name", "expense_amount", "transaction", "created_at")
    list_filter = ("expense_type",)
    search_fields = ("expense_type__name", "other_name")
    readonly_fields = ("id", "created_at", "updated_at")
