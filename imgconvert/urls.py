from .views import *
from django.urls import path

app_name = 'imgconvert'

urlpatterns = [
    path('', Index.as_view(), name='convert'),
    path('getColorData/', get_color_data),
    path('setColorData/', SetColorData.as_view()),
    path('instructions/<id>/', InstructionView.as_view(), name='instructions'),
    path('add-to-cart/<id>/', add_to_cart, name='add-to-cart'),
    path('remove-from-cart/<id>/', remove_from_cart, name='remove-from-cart')
]