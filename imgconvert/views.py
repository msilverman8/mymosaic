from django.http import HttpResponse
from django.shortcuts import render
from django.urls import reverse
from .models import MosaicImage
from django.views.generic import TemplateView


class Index(TemplateView):
    # model = MosaicImage
    template_name = 'imgconvert/index.html'

