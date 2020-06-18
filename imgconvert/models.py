from django.db import models
from model_utils import Choices
from django.utils.translation import gettext_lazy as _
#from django.contrib.postgres.fields import JSONField, ArrayField
#from django.core.validators import MaxValueValidator


class MosaicImage(models.Model):
    """
    color: the selected color palette
    values: the bill of materials
    dimensions: (width, height) used to order the values
    id: using the default id value as the order number for now
    """
    COLOR = Choices(('CL', _('color')), ('GR', _('greyscale')), ('BW', _('black & white')))
    color = models.CharField(choices=COLOR, default=COLOR.CL, max_length=2)
    # [[0,0,0,0], [0,0,0,0], (...)]
    #values = ArrayField(ArrayField(models.PositiveSmallIntegerField(validators=[MaxValueValidator(250)])))
    # [32, 32] or [64,64] or [96,64]
    # maybe this field type could be some kind of choice? needs more constraint
    #dimensions = ArrayField(models.PositiveSmallIntegerField())

    # does this need to be able to return a dict of the amount of each color
    # def get_materials return {red: 200, blue: 200, green: 200, (...)}

    # is this the way to get a user to the instruction page
    # def get_absolute_url(self):
    #     """Returns the url to access a particular instance of the model."""
    #     return reverse('model-detail-view', args=[str(self.id)])

    def __unicode__(self):
        """ readable name for python object """
        return f'order #{self.id} a {self.color} mosaic'


# class User(models.Model):
#     username = models.CharField(max_length=30)
#     mosaic = models.ForeignKey()
