from rest_framework import serializers
from .models import Mosaic


# more concise but  does the same as below a modelserializer vs regular
# model serializer auto determins fields
# model serializer includes default basic create and update methods
class MosaicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mosaic
        fields = ['id', 'color', 'mosaic', 'plates', 'materials']


# serializer standalone for file upload / receive from remove bg
class ImageSerializer(serializers.Serializer):
    image_file = serializers.ImageField()

    # def save(self):
    #     image = self.validated_data['image']
    #     return self.image
