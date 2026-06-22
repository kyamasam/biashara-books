from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id", "transaction_type", "transaction_method", "transaction_purpose",
        "transaction_amount", "transaction_status", "payment_channel",
        "sender_number", "receiver_number", "created_at",
    )
    list_filter = ("transaction_type", "transaction_method", "transaction_status", "payment_channel")
    search_fields = ("confirmation_code", "sender_number", "receiver_number", "reconciliation_id")
    readonly_fields = ("id", "created_at", "updated_at", "callback_resp")
    ordering = ("-created_at",)
