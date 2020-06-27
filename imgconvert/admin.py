from django.contrib import admin
from .models import Mosaic, MosaicOrder, Order


class MosaicAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'color', 'plates', 'mosaic', 'materials')


admin.site.register(Mosaic, MosaicAdmin)
admin.site.register(MosaicOrder)
admin.site.register(Order)
