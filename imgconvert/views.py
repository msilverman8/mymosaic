from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.views.generic import TemplateView, ListView, DetailView
from django.contrib import messages
from django.utils import timezone

from .models import Mosaic, Order, MosaicOrder
from .serializers import MosaicSerializer
from .colors import BrickMosaic

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser


class Index(TemplateView):
    template_name = 'imgconvert/index.html'


class InstructionView(DetailView):
    model = Mosaic
    template_name = "instructions.html"


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


def add_to_cart(request, id):
    mosaic = get_object_or_404(Mosaic, id=id)
    mosaic_order, created = MosaicOrder.objects.get_or_create(
        mosaic=mosaic,
        user=request.user,
        ordered=False
    )
    order_qs = Order.objects.filter(user=request.user, ordered=False)

    if order_qs.exists():
        order = order_qs[0]

        if order.mosaics.filter(mosaic__id=mosaic.id).exists():
            mosaic_order.quantity += 1
            mosaic_order.save()
            messages.info(request, "Added quantity Mosaic")
            return redirect("imgconvert:instructions", id=id)
        else:
            order.mosaics.add(mosaic_order)
            messages.info(request, "Mosaic added to your cart")
            return redirect("imgconvert:instructions", id=id)
    else:
        ordered_date = timezone.now()
        order = Order.objects.create(user=request.user, ordered_date=ordered_date)
        order.mosaics.add(mosaic_order)
        messages.info(request, "Mosaic added to your cart")
        return redirect("imgconvert:instructions", id=id)


def remove_from_cart(request, id):
    mosaic = get_object_or_404(Mosaic, id=id)
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False
    )
    if order_qs.exists():
        order = order_qs[0]
        if order.mosaics.filter(mosaic__id=mosaic.id).exists():
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
            return redirect("imgconvert:instructions", id=id)
    else:
        # add message doesnt have order
        messages.info(request, "You do not have an Order")
        return redirect("imgconvert:instructions", id = id)
