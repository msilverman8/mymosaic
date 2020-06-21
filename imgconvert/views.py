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
        'CL': BrickMosaic().get_top_colors(),
        # 'GR': BrickMosaic().get_greyscale(),
        # 'BW': BrickMosaic().get_blackwhite()
    }
    return JsonResponse(response)

