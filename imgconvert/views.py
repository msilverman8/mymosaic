from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.views.generic import TemplateView, ListView, DetailView
from django.contrib import messages
from django.utils import timezone

from .models import Mosaic, Order, MosaicOrder
from .serializers import MosaicSerializer
from .colors import BrickMosaic

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer

import io
import json


class Index(TemplateView):
    template_name = 'imgconvert/index.html'


# class InstructionView(DetailView):
#     model = Mosaic
#     template_name = "imgconvert/instructions.html"


class InstructionView(TemplateView):
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
    get_object_or_404(Mosaic, pk=pk)
    return redirect("imgconvert:instructions", pk=pk)


def get_color_data(request):
    response = {
        'CL': BrickMosaic().get_filtered_colors('CL'),
        'GR': BrickMosaic().get_filtered_colors('GR'),
        'BW': BrickMosaic().get_filtered_colors('BW'),
        # 'AL': BrickMosaic().get_filtered_colors('AL'),
        # 'names': BrickMosaic().get_name_to_color(),
    }
    return JsonResponse(response)


class SetColorData(APIView):
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
