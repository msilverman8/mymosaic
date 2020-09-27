from django.http import HttpResponse, JsonResponse, FileResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.views.generic import TemplateView, ListView, DetailView
from django.contrib import messages
from django.utils import timezone
from django.conf import settings
from django.core.files import File

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, FileUploadParser
from rest_framework.exceptions import ParseError
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer

import requests
from PIL import Image

from .models import Mosaic, Order, MosaicOrder
from .serializers import MosaicSerializer, ImageSerializer
from .colors import BrickMosaic
from .globals import COLOR_KEYS
from .custom_renderers import PNGRenderer
from .custom_parsers import ImageUploadParser


class Index(TemplateView):
    """
    view for dynamically loading the main page
    default_values: are used for loading initial values into the template, format is based on other sections
    mosaic_tools:   are used for values for the mosaic adjustment available options
    color_data:     are used for passing the palette values to the front end
    """
    template_name = 'imgconvert/index.html'

    def default_values(self):
        return {
            'bgPattern': {
                'pattern': 'solid',  # one of the keys of this mosaic_tools.bgPattern
                'max': 2,  # the max amount of display color choices for the template
                'color': '255,255,255',  # the default color for the default pattern
            },
            'palette': COLOR_KEYS.color,  # the default palette selected from this color_data
            'plateCount': 2,  # the default plate count value
        }

    def mosaic_tools(self):
        r = {
            'mosaicTools': ["palette", "sliders", "bg"],  # the user settings for the mosaic
            'plateCount': range(2, 4),  # the min and max of the plates allowed on a single side of the mosaic
            'bgPattern': {  # key is the pattern name, value is the amount of colors the pattern needs
                'burst': 2,
                'solid': 1,
            },
            'presetList': {  # key is the caman method name, value is the dusplay name to the user
                'clarity': 'auto',
                'hazyDays': 'soft glow',
                'glowingSun': 'lighten',
            },
            'sliderList': {
                # 'brightness': {
                #     'range': [-50, 50],  # [-100, 100]
                #     'step': 1,
                #     'initialValue': 0,
                # },
                # 'contrast': {  # looks like butt
                #     'range': [-10, 10],  # [-100, 100]
                #     'step': 1,
                #     'initialValue': 0,
                # },
                # 'gamma': {
                #     'range': [0, 5],  # 0 - infinity 0-1 lessen contrast, 1+ will increase contrast
                #     'step': 0.1,
                #     'initialValue': 1,
                # },
                'exposure': {   # based on curves ( adjust color values based on a bezier curve )
                    'range': [-100, 100],  # [-100, 100]
                    'step': 1,
                    'initialValue': 0,
                    'label': 'brightness',
                },
                'vibrance': {  # a smart saturation tool, boosts less saturated color more than saturated colors
                    'range': [-100, 100],  # [-100, 100]
                    'step': 1,
                    'initialValue': 0,
                    'label': 'color vibrance',
                },
                'stackBlur': {  # blurs an image
                    'range': [0, 20],
                    'step': 1,
                    'initialValue': 0,
                    'label': 'soften',
                },
                'sharpen': {  # sharpens the image
                    'range': [0, 100],
                    'step': 1,
                    'initialValue': 0,
                },
            },
            'paletteContent': {},  # is populated below from the palette name : color list object
            # 'paletteColors': [],  # is populated below from the palette name : color list object
        }
        for key in COLOR_KEYS:
            r['paletteContent'][key[0]] = key[1]
            # for rgb in BrickMosaic().get_filtered_colors(key[0])['asArray']:
            #     rgb_str = ','.join(rgb)
            #     if rgb_str not in r['paletteColors']:
            #         r['paletteColors'].append(rgb_str)
        return r

    def color_data(self):
        """ returns all palette name : colors listed under palette objects """
        r = {}
        for key in COLOR_KEYS:
            r[key[0]] = BrickMosaic().get_filtered_colors(key[0])

        return r


class InstructionView(TemplateView):
    """
    initial page for instructions on building a created and shipped mosaic
    """
    template_name = "imgconvert/instructions.html"

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # Add in the mosaic
        mosaic = get_object_or_404(Mosaic, pk=self.kwargs['pk'])
        print('type of mosaic obj is-----')
        print(type(mosaic.mosaic))
        context['mosaic'] = mosaic.mosaic
        context['plates'] = mosaic.plates
        return context


def testInstructionPage(request, pk):
    """
    redirects to send correct id of mosaic to build the page in the instruction view
    """
    get_object_or_404(Mosaic, pk=pk)
    return redirect("imgconvert:instructions", pk=pk)


class UploadImageTest(APIView):
    parser_class = (MultiPartParser, FormParser,)
    renderer_classes = (PNGRenderer,)

    def post(self, request):
        print(request.data)
        if 'image_file' not in request.data:
            return Response(status=status.HTTP_204_NO_CONTENT)

        f = request.data['image_file']

        # use pillow verify to ensure user uploaded file is an image
        try:
            with Image.open(f) as img:
                img.verify()
        except:
            return Response(status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
        with f.open('rb') as img:
            return Response(img.read(), status=status.HTTP_201_CREATED)


class PostImageForRemoveBg(APIView):
    parser_class = (MultiPartParser, FormParser,)
    renderer_classes = [PNGRenderer, JSONRenderer]

    def post(self, request):
        print('--- did the file transfer ? ---')
        print(request)
        print(request.data)
        f = request.data['image_file']

        # with f.open('rb') as img:
        response = requests.post(
            # 'https://api.remove.bg/v1.0/removebg',
            'http://127.0.0.1:3000/file/fake/',
            files={'image_file': f},
            data={'size': 'auto'},
            headers={
                'Accept': 'image/*',
                'X-Api-Key': settings.REMOVEBG_API_KEY},
        )

        print('--- response from fake server ---')
        print(response)
        print(response.content)
        if response.status_code == requests.codes.ok:
            print("response returned ok")
            try:
                return Response(response)
            except:
                print("not able to return response")
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            print("Error:", response.status_code, response.text)
            return response


class SetColorData(APIView):
    """
    initial save method for storing the mosaic to the database
    """
    def post(self, request):
        print('received post request with request data')
        print('--------------------------------')
        print(type(request.data))
        print(request.data)
        serializer = MosaicSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def add_to_cart(request, pk):
    mosaic = get_object_or_404(Mosaic, pk=pk)
    mosaic_order, created = MosaicOrder.objects.get_or_create(
        mosaic=mosaic,
        user=request.user,
        ordered=False
    )
    order_qs = Order.objects.filter(user=request.user, ordered=False)

    if order_qs.exists():
        order = order_qs[0]

        if order.mosaics.filter(mosaic__pk=mosaic.id).exists():
            mosaic_order.quantity += 1
            mosaic_order.save()
            messages.info(request, "Added quantity Mosaic")
            return redirect("imgconvert:instructions", pk=pk)
        else:
            order.mosaics.add(mosaic_order)
            messages.info(request, "Mosaic added to your cart")
            return redirect("imgconvert:instructions", pk=pk)
    else:
        ordered_date = timezone.now()
        order = Order.objects.create(user=request.user, ordered_date=ordered_date)
        order.mosaics.add(mosaic_order)
        messages.info(request, "Mosaic added to your cart")
        return redirect("imgconvert:instructions", pk=pk)


def remove_from_cart(request, pk):
    mosaic = get_object_or_404(Mosaic, pk=pk)
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False
    )
    if order_qs.exists():
        order = order_qs[0]
        if order.mosaics.filter(mosaic__pk=mosaic.id).exists():
            mosaic_order = MosaicOrder.objects.filter(
                mosaic=mosaic,
                user=request.user,
                ordered=False
            )[0]
            mosaic_order.delete()
            messages.info(request, "Mosaic \""+mosaic_order.mosaic+"\" remove from your cart")
            return redirect("imgconvert:instructions")
        else:
            messages.info(request, "This Mosaic not in your cart")
            return redirect("imgconvert:instructions", pk=pk)
    else:
        # add message doesnt have order
        messages.info(request, "You do not have an Order")
        return redirect("imgconvert:instructions", pk=pk)
