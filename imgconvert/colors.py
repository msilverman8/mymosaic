import ast
import pandas as pd
# from PIL import ImageFilter, Image
# import numpy
# import cv2
# import face_recognition
from django.contrib.staticfiles.storage import staticfiles_storage

__all__ = ['BrickMosaic']
__version__ = '0.0.1'
__author__ = 'Michael Silverman'
__copyright__ = 'Copyright (c) Michael Silverman LLC'


# A Sample class with init method
class BrickMosaic:

    # init method or constructor
    def __init__(self):
        """Initialize"""
        self.RGB = []
        self.colors_filename = staticfiles_storage.path('imgconvert/csv/colors.csv')
        self.filter_strings = ['Trans', 'Glitter', 'Clear', 'Pearl', 'Silver', 'Copper', 'Chrome', 'Metallic',
                               'Unknown',
                               'Modulex', 'No Color', 'Glow', 'Speckle']
        pd.set_option("display.max_rows", None, "display.max_columns", None)
        #self.face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
        #self.eye_cascade = cv2.CascadeClassifier('haarcascade_eye.xml')

        # Sample Method

    def load_color_df(self):
        """Load color CSV as data framework color_df."""
        print('loading color dataframe')
        color_df = pd.read_csv(self.colors_filename)
        if 'RGB' not in color_df or color_df['RGB'].isnull().values.any():
            try:
                for row in color_df.itertuples():
                    a = row.rgb
                    self.RGB.append(tuple(int(a[i:i + 2], 16) for i in (0, 2, 4)))
                color_df['RGB'] = self.RGB
                print('Updating ' + self.colors_filename)
                color_df.to_csv(self.colors_filename, index=False)
                print(self.colors_filename + ' updated!')
            except:
                print(
                    self.colors_filename + ' may not contain hexdecimal color tones to convert to RGB. See brick colors as example')
        return color_df

    def filter_df_topcolors(self, dataframe):
        return dataframe.loc[dataframe['is_topcolors'] == 't']

    def filter_df_greyscale(self, dataframe):
        return dataframe.loc[dataframe['is_greyscale'] == 't']

    def filter_df_blackwhite(self, dataframe):
        return dataframe.loc[dataframe['is_blackwhite'] == 't']

    def filter_df(self, dataframe, list_filter_strings):
        "filters dataframe that contain strings listed in list_filter_strings"
        return dataframe[~dataframe.name.str.contains('|'.join(list_filter_strings))]

    def get_filtered_colors(self, choice):
        """
        choice : one of 'CL', 'GR', 'BW'
        returns a list of dictionaries based on choice passed
        [{r:0,g:0,b:0 },{r:0,g:0,b:0 },{...}]
        """
        choices = {
            'CL': 'is_topcolors',
            'GR': 'is_greyscale',
            'BW': 'is_blackwhite',
            'ALL': 'is_all',
        }
        df = self.load_color_df()
        if choices[choice] == 'is_all':
            ls = df['RGB'].to_list()
        else:
            filtered_df = df.loc[df[choices[choice]] == 't']
            ls = filtered_df['RGB'].to_list()

        data = []
        for val in ls:
            rgb = ast.literal_eval(val)
            data.append({
                'r': rgb[0],
                'g': rgb[1],
                'b': rgb[2]
            })

        return data

    # def change_to_df_colors(self, image, dataframe):
    #     list_data = list(image.getdata())
    #     subjects = list(literal_eval(x) for x in dataframe["RGB"])
    #     counter = 0
    #     for i in list_data:
    #         query = tuple(i)
    #         list_data[counter] = min(subjects, key=lambda subject: sum((s - q) ** 2 for s, q in zip(subject, query)))
    #         counter += 1
    #     image.putdata(list_data)
    #     return image

    # def play_filters(self, image):
    #     x = 1
    #     for i in range(x):
    #         image = image.filter(ImageFilter.MaxFilter())
    #         # image = image.filter(ImageFilter.UnsharpMask())
    #         # image.filter(ImageFilter.DETAIL())
    #         # image = image.filter(ImageFilter.SMOOTH())
    #         # image.filter(ImageFilter.BLUR)
    #         # image = image.filter(ImageFilter.EDGE_ENHANCE_MORE())
    #
    #         # use this 1 time
    #         # image = image.filter(ImageFilter.SHARPEN())
    #         # image = image.filter(ImageFilter.MedianFilter())
    #         image.show()
    #

    # def convert_to_opencv(self, pil_img):
    #     # pil_image = Image.open("demo2.jpg")  # open image using PIL
    #     numpy_image = numpy.array(pil_img)
    #     # convert to a openCV2 image, notice the COLOR_RGB2BGR which means that
    #     # the color is converted from RGB to BGR format
    #     opencv_image = cv2.cvtColor(numpy_image, cv2.COLOR_RGB2BGR)
    #     return opencv_image
    #

    # def convert_to_pil(self, opencv_image):
    #     # opencv_image = cv2.imread("demo2.jpg")  # open image using openCV2
    #     # convert from openCV2 to PIL. Notice the COLOR_BGR2RGB which means that
    #     # the color is converted from BGR to RGB
    #     pil_image = Image.fromarray(
    #         cv2.cvtColor(opencv_image, cv2.COLOR_BGR2RGB)
    #     )
    #     return pil_image
    #

    # def find_faces(self,image):
    #         face_locations = face_recognition.face_locations(image)
    #         #print(face_locations)
    #         return face_locations

    # def crop_in_bounds(self,image, left, top, right, bottom, left_right_margin, top_bottom_margin):
    #     left = left - left_right_margin
    #     top = top - top_bottom_margin
    #     right = right + left_right_margin
    #     bottom = bottom + top_bottom_margin
    #     if left < 0:
    #         right = right + abs(left)
    #         left = 0
    #     if top < 0:
    #         bottom = bottom + abs(top)
    #         top = 0
    #     if right > image.size[0]:
    #         dif = right - image.size[0]
    #         print(dif)
    #         right = image.size[0]
    #         left = left - dif
    #         if left < 0:
    #             left = 0
    #     if bottom > image.size[1]:
    #         dif = bottom - image.size[1]
    #         bottom = image.size[1]
    #         top = top - dif
    #         if top < 0:
    #             top = 0
    #     if (left == right) or (top == bottom):
    #         left = 0
    #         top = 0
    #         right = image.size[0]
    #         bottom = image.size[1]
    #         print('Cropped image has no width or no height. Returning full image size.')
    #     return [left, top, right, bottom]
    #
    #
    #

###################################################################################3
    # def nearest_colour(self, dataframe, query):
    #     print(type(query))
    #     subjects = list(literal_eval(x) for x in dataframe["RGB"])
    #     return min(subjects, key=lambda subject: sum((s - q) ** 2 for s, q in zip(subject, query)))


    # def crop_pil(self, pil_image):
    #
    #     def set_image_data_values(self, image):
    #         list_data = list(image.getdata())
    #         counter = 0
    #         for i in list_data:
    #             sub_list = list(i)
    #             for x in range(3):
    #                 sub_list[x] = x
    #             list_data[counter] = tuple(sub_list)
    #             counter += 1
    #         image.putdata(list_data)

    # def show_filters(self, image):
    #         im = image
    #         im1 = im.filter(ImageFilter.BLUR)
    #         im2 = im.filter(ImageFilter.CONTOUR())
    #         im3 = im.filter(ImageFilter.DETAIL())
    #         im4 = im.filter(ImageFilter.SHARPEN())
    #         im5 = im.filter(ImageFilter.EDGE_ENHANCE_MORE())
    #         im6 = im.filter(ImageFilter.EDGE_ENHANCE())
    #         im7 = im.filter(ImageFilter.SMOOTH())
    #         im8 = im.filter(ImageFilter.MedianFilter())
    #         im9 = im.filter(ImageFilter.FIND_EDGES())
    #         # im10 = im.filter(ImageFilter.Color3DLUT())
    #         im11 = im.filter(ImageFilter.SMOOTH_MORE())
    #         im12 = im.filter(ImageFilter.EMBOSS())
    #         im13 = im.filter(ImageFilter.MaxFilter())
    #         im14 = im.filter(ImageFilter.MinFilter())
    #         # im15 = im.filter(ImageFilter.Kernel())
    #         im16 = im.filter(ImageFilter.UnsharpMask())
    #         im17 = im.filter(ImageFilter.ModeFilter())
    #         # im18 = im.filter(ImageFilter.BuiltinFilter())
    #         # im19 = im.filter(ImageFilter.Filter())
    #         # im20 = im.filter(ImageFilter.GaussianBlur(radius=20))
    #         # im21 = im.filter(ImageFilter.GaussianBlur(radius=20))
    #
    #         im.show('0')
    #         '''
    #         im1.show(title='1')
    #         im2.show(title='2')
    #         im3.show(title='3')
    #         im4.show(title='4')
    #         im5.show(title='5')
    #         im6.show(title='6')
    #         im7.show(title='7')
    #         im8.show(title='8')
    #         im9.show(title='9')
    #         #im10.show(title='10')
    #         im11.show(title='11')
    #         im12.show(title='12')
    #         im13.show(title='13')
    #         im14.show(title='14')
    #         #im15.show(title='15')
    #         im16.show(title='16')
    #         im17.show(title='17')
    #         #im18.show(title='18')
    #         #im19.show(title='19')
    #         #im20.show(title='20')
    #         #im21.show(title='21')
    #         '''
    # def face_detection(self, image):
    #     eye_cascade = cv2.CascadeClassifier('haarcascade_eye.xml')
    #     face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
    #     img = convert_to_opencv(image)
    #     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    #     faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    #     for (x, y, w, h) in faces:
    #         cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
    #         roi_gray = gray[y:y + h, x:x + w]
    #         roi_color = img[y:y + h, x:x + w]
    #         eyes = eye_cascade.detectMultiScale(roi_gray)
    #         for (ex,ey,ew,eh) in eyes:
    #             cv2.rectangle(roi_color,(ex,ey),(ex+ew,ey+eh),(0,255,0),2)
    #     cv2.imshow('img',img)
    #     k = cv2.waitKey(30) & 0xff
    #     if k == 27:
    #         cv2.destroyAllWindows()
    #
    # def comvert_image_to_matrix(self, image):
    #     return numpy.array(image.getdata()).reshape(image.size[0], image.size[1], 3)