from django.http import HttpResponse
from django.shortcuts import render
from django.urls import reverse

# Create your views here.


def index(request):
    context = {
        "title": "Upload Page",
    }

    return render(request, "imgconvert/index.html", context)
