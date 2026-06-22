from django import forms
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.hashers import make_password
from django.shortcuts import redirect, render
from django.urls import path, reverse

from apps.users.models import Profile, User


class SetPinForm(forms.Form):
    pin = forms.CharField(
        min_length=4,
        max_length=4,
        widget=forms.PasswordInput,
        help_text="Must be exactly 4 digits.",
    )
    confirm_pin = forms.CharField(
        min_length=4,
        max_length=4,
        widget=forms.PasswordInput,
        label="Confirm PIN",
    )

    def clean_pin(self):
        pin = self.cleaned_data["pin"]
        if not pin.isdigit():
            raise forms.ValidationError("PIN must contain only digits.")
        return pin

    def clean(self):
        cleaned = super().clean()
        pin = cleaned.get("pin")
        confirm = cleaned.get("confirm_pin")
        if pin and confirm and pin != confirm:
            raise forms.ValidationError("PINs do not match.")
        return cleaned


class CustomUserAdmin(UserAdmin):
    list_display = ['phone_number', 'first_name', 'last_name', 'email', 'is_staff', 'is_active']

    ordering = ['phone_number']

    fieldsets = (
        (None, {'fields': ('phone_code', 'phone_number', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'avatar')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Other Fields', {
            'fields': (
                'staff_number',
                'password_reset_code',
                'password_reset_code_expires_at',
                'password_reset_code_used',
                'user_type',
                'last_withdrawal_transaction_complete',
                'last_withdrawal_time',
                'otp_code',
                'otp_code_used',
                'otp_code_expires_at',
            )
        }),
    )

    # Completely override add_fieldsets
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_code', 'phone_number', 'password1', 'password2'),
        }),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'avatar')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'user_type')}),
        ('Other Fields', {
            'fields': (
                'staff_number',
                'password_reset_code',
                'password_reset_code_expires_at',
                'password_reset_code_used',
                'last_withdrawal_transaction_complete',
                'last_withdrawal_time',
            )
        }),
    )

    # Override search_fields to remove username
    search_fields = ['phone_number', 'first_name', 'last_name', 'email']

    # Override list_filter to remove username references
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'user_type', 'date_joined']

    actions = ['set_pin_action']

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                'set-pin/',
                self.admin_site.admin_view(self.set_pin_view),
                name='users_user_set_pin',
            ),
        ]
        return custom + urls

    @admin.action(description='Set PIN for selected users')
    def set_pin_action(self, request, queryset):
        selected_ids = ','.join(str(u.pk) for u in queryset)
        url = reverse('admin:users_user_set_pin') + f'?ids={selected_ids}'
        return redirect(url)

    def set_pin_view(self, request):
        ids = request.GET.get('ids', '') or request.POST.get('ids', '')
        user_ids = [uid for uid in ids.split(',') if uid]
        users = User.objects.filter(pk__in=user_ids)

        if not users.exists():
            self.message_user(request, 'No users selected.', level=messages.WARNING)
            return redirect('admin:users_user_changelist')

        if request.method == 'POST':
            form = SetPinForm(request.POST)
            if form.is_valid():
                hashed = make_password(form.cleaned_data['pin'])
                updated = users.update(pin=hashed)
                self.message_user(
                    request,
                    f'PIN successfully set for {updated} user(s).',
                    level=messages.SUCCESS,
                )
                return redirect('admin:users_user_changelist')
        else:
            form = SetPinForm()

        context = {
            **self.admin_site.each_context(request),
            'title': 'Set PIN',
            'form': form,
            'users': users,
            'ids': ids,
            'opts': self.model._meta,
        }
        return render(request, 'admin/users/set_pin.html', context)


admin.site.register(User, CustomUserAdmin)
admin.site.register(Profile)
