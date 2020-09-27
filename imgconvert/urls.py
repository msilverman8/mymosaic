from .views import Index, SetColorData, InstructionView, testInstructionPage, PostImageForRemoveBg, UploadImageTest
from django.urls import path

app_name = 'imgconvert'

urlpatterns = [
    path('', Index.as_view(), name='convert'),
    path('setColorData/', SetColorData.as_view()),
    path('instructions/<pk>/', InstructionView.as_view(), name='instructions'),
    path('test/<pk>/', testInstructionPage, name='testInstructions'),
    path('removebg/', PostImageForRemoveBg.as_view()),
    path('upTest/', UploadImageTest.as_view()),
    # path('add-to-cart/<pk>/', add_to_cart, name='add-to-cart'),
    # path('remove-from-cart/<pk>/', remove_from_cart, name='remove-from-cart'),
]