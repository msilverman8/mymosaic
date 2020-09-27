from django.db import models
from django.conf import settings
from django.shortcuts import reverse
# from django.contrib.postgres.fields import JSONField
from .globals import COLOR_KEYS


class Mosaic(models.Model):
    """
    A table storing individual mosaics
    """
    color = models.CharField(choices=COLOR_KEYS, default=COLOR_KEYS.color, max_length=2)
    plates = models.IntegerField()
    mosaic = models.JSONField()
    materials = models.JSONField()

    def __str__(self):
        """ readable name for python object """
        return f'A {COLOR_KEYS[self.color]} mosaic with {self.plates} plates'

    def get_price(self):
        """
        the price is calculated based on # of plates
        """
        price = 50.00
        return price

    def get_absolute_url(self):
        return reverse("imgconvert:instructions", kwargs={
            "pk": self.pk
        })

    def get_add_to_cart_url(self):
        return reverse("imgconvert:add-to-cart", kwargs={
            "pk": self.pk
        })

    def get_remove_from_cart_url(self):
        return reverse("imgconvert:remove-from-cart", kwargs={
             "pk": self.pk
        })


class MosaicOrder(models.Model):
    """
    Storing the state of a users order (shopping cart)
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ordered = models.BooleanField(default=False)
    mosaic = models.ForeignKey(Mosaic, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f'{self.quantity} of mosaics'

    def get_total_mosaic_price(self):
        return self.quantity * self.mosaic.get_price()


class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mosaics = models.ManyToManyField(MosaicOrder)
    start_date = models.DateTimeField(auto_now_add=True)
    ordered_date = models.DateTimeField()
    ordered = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

    def get_total_price(self):
        total = 0
        for mosaic_order in self.mosaics.all():
            total += mosaic_order.get_total_mosaic_price()
        return total
