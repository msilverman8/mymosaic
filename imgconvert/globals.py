 # global variables
from model_utils import Choices
from django.utils.translation import gettext_lazy as _

COLOR_KEYS = Choices(('CL', 'color',  _('Color')), ('GR', 'grey', _('Greyscale')), ('BW', 'bw', _('Black & White')))

PALETTE_CHOICE = {
    COLOR_KEYS.color: 'is_topcolors',
    COLOR_KEYS.grey: 'is_greyscale',
    COLOR_KEYS.bw: 'is_blackwhite',
    # this value was for dev, should get it set up if it becomes official
    'AL': 'is_all',
}