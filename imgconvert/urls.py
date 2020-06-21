from .views import Index, get_color_list
from django.urls import path


urlpatterns = [
    path('', Index.as_view()),
    path('getColorList/', get_color_list)
]