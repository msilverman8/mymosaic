from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import MosaicImage
from django.views.generic import TemplateView
from .colors import BrickMosaic


class Index(TemplateView):
    # model = MosaicImage
    template_name = 'imgconvert/index.html'


def get_color_list(request):
    response = {
        'CL': BrickMosaic().get_filtered_colors('CL'),
        # 'GR': BrickMosaic().get_filtered_colors('GR'),
        # 'BW': BrickMosaic().get_filtered_colors('BW'),
    }
    return JsonResponse(response)

