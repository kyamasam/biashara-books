from django.contrib import admin

from .models import OtherLoan, SystemLoan


@admin.register(OtherLoan)
class OtherLoanAdmin(admin.ModelAdmin):
    list_display = ("id", "institution_name", "institution_type", "loan_balance", "monthly_repayment_amount", "end_date")
    list_filter = ("institution_type",)
    search_fields = ("institution_name",)
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(SystemLoan)
class SystemLoanAdmin(admin.ModelAdmin):
    list_display = ("id", "institution_name", "institution_type", "loan_balance", "monthly_repayment_amount", "end_date")
    list_filter = ("institution_type",)
    search_fields = ("institution_name",)
    readonly_fields = ("id", "created_at", "updated_at")
