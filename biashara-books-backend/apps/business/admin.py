from django.contrib import admin

from .models import Business


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "created_at")
    search_fields = ("name", "user__phone_number", "user__first_name", "user__last_name")
    readonly_fields = ("id", "created_at", "updated_at")
