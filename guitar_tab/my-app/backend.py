from flask import Flask,request,send_from_directory
from flask_cors import CORS
from pytube import YouTube
import cv2
import numpy as np
import time
from PIL import Image,ImageDraw,ImageFont
import matplotlib.pyplot as plt
import base64
from flask_socketio import SocketIO

class Flask_api(object):
    def __init__(self):
        self.app = Flask(__name__) 
        # self.socketio = SocketIO(self.app,cors_allowed_origins="*") #websocket
        self.yt_url = ""
        self.yt_title = ""
        self.yt_image = None
        self.tab_area = {'x':0,'y':0,'width':0,'height':0} # 使用者所選取得TAB範圍
        self.tab_image = []
        self.completed_tab_image_send = False #是否完成tab image 的所以傳送
        self.tab_base64 = []
        self.tab_index_selected = []

        self.app.add_url_rule('/api/yt_url', endpoint='index',view_func=self.yt_url_update,methods=['POST']) # URL內容
        self.app.add_url_rule('/api/yt_image', endpoint='image',view_func=self.yt_image_update,methods=['GET']) # 圖片URL
        self.app.add_url_rule('/api/image_area_select', endpoint='area_select',view_func=self.area_select,methods=['POST']) # 圖片區域選擇
        self.app.add_url_rule('/api/tab_select', endpoint='tab_select',view_func=self.tab_select,methods=['POST']) # TAB選擇

    # 使用 Socket.IO 建立 WebSocket 連線
        # self.socketio.on_event('connect', self.handle_connect) #websocket

    # def handle_connect(self): #websocket
    #     print('WebSocket Client Connected')


     # 向前端发送消息的方法 #websocket
    # def send_message_to_frontend(message):
    #     Flask_api.socketio.emit('message_from_backend', {'message': message})


    def run(self):
        CORS(self.app,supports_credentials=True)
        self.app.run(host="0.0.0.0", port=8877)
        # self.socketio.run(self.app,host="0.0.0.0", port=8877) #websocket


    def yt_url_update(self,*args):
        if request.method == 'POST':
            
            if type(request.json) is str:
                print("!!!!!!!come in POST")
                self.yt_url = request.json

            print('YT URL :',self.yt_url)
            self.yt_title = Video_calculate.get_youtube_title(self.yt_url)
            print("YT Title :",self.yt_title)
            self.yt_image = Video_calculate.get_youtube_image_after_5sec(self.yt_url)
            # plt.imshow(self.yt_image)
            # plt.show()

            # cv2.namedWindow("Image")
            # cv2.imshow("Image", self.yt_image)
            # cv2.waitKey(0)
            # cv2.destroyAllWindows()

            # im=Image.fromarray(self.yt_image) # numpy轉image类
            # print(im)
            # im.show() #顯示圖片
            return self.yt_title
        
    def yt_image_update(self):
        if request.method == "GET":
            cv2.imwrite("Guitar_screenshoot.jpg",self.yt_image)
            image_dir = '/home/xian/for_test/guitar_tab/my-app/'
            return send_from_directory(image_dir, "Guitar_screenshoot.jpg")
        
    def area_select(self,*args):
        if request.method == "POST":
            self.tab_area['x'] = request.json['x']
            self.tab_area['y'] = request.json['y']
            self.tab_area['width'] = request.json['width']
            self.tab_area['height'] = request.json['height']
            self.tab_image = Video_calculate.tab_handle(self.yt_url,self.tab_area['x'],self.tab_area['y'],self.tab_area['width'],self.tab_area['height']) # 影像處理
            self.tab_base64 = self.img2base64(self.tab_image) # 轉成base64
            return self.tab_base64
        
    def tab_select(self,*args):
        if request.method == "POST":
            self.tab_index_selected = request.json
            print(self.tab_index_selected)
            full_image = Video_calculate.merge_tab(self.tab_index_selected,self.tab_image,self.yt_title)
            print("================================")
            print(len(full_image))
            full_image = self.img2base64(full_image)
        return full_image
        
    def img2base64(self,image_list):
        base64_images = []

        for image in image_list:
            # 將圖片轉換為 base64 字符串
            _,buffer = cv2.imencode('.jpg',image)
            base64_image = base64.b64encode(buffer).decode('utf-8')
            base64_images.append(base64_image)
        return base64_images
    
class Video_calculate:
    def get_youtube_title(url):
        yt = YouTube(url)
        yt_name = yt.title
        return yt_name
    def get_youtube_image_after_5sec(url):
        yt = YouTube(url)
        stream = yt.streams.get_highest_resolution()
        video_capture = cv2.VideoCapture(stream.url)
        start_time = time.time()
        end_time = 2
        while True:
            ret, frame = video_capture.read()
            if not ret:
                break

            if time.time() > start_time + end_time:
                # print(frame)
                break
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            elif cv2.waitKey(1) == ord('r'):
                area = cv2.selectROI('area',frame)
                print(area)
        return frame
    
    def tab_handle(url,x,y,width,height):
    # def tab_handle(self,url,data):
        yt = YouTube(url)
        stream = yt.streams.get_highest_resolution()
        video_capture = cv2.VideoCapture(stream.url)
        concatenated_frame = []
        previous_frame_sum = None
        previous_frame_diff = 0
        last_time = 0
        __i = 1
        counter = 0


        start_time = time.time()
        end_time = 2

        
        while True:
            ret, frame = video_capture.read()

            if frame is None:
            # 如果 frame 為 None，表示已經讀取完所有幀，可以退出循環
                break
            target = frame[int(y):int(y) + int(height), int(x):int(x) + int(width)] #切割成


            detect_area = target[ : , int(width)//2 : (int(width)//2) + 45] # 偵測換頁的範圍
            gray_frame = cv2.cvtColor(detect_area, cv2.COLOR_BGR2GRAY)
            _, detect_area = cv2.threshold(gray_frame, 230, 255, cv2.THRESH_BINARY)

            gray_frame = cv2.cvtColor(target, cv2.COLOR_BGR2GRAY)
            _, binary_frame = cv2.threshold(gray_frame, 230, 255, cv2.THRESH_BINARY)

            # 計算區域差異度
            current_frame_sum = np.sum(detect_area) 
            if previous_frame_sum is None:
                previous_frame_sum = current_frame_sum
                continue
            frame_difference = np.abs(current_frame_sum - previous_frame_sum)
            # print(frame_difference)

            if frame_difference > 1000000:
                current_time = 1
            else:
                current_time = 0

            if current_time != last_time :
                if counter >= 2:
                    counter = 0
                    print("第%s頁"%(__i))
                    # Flask_api.send_message_to_frontend(__i) #websocket
                    __i += 1
                    concatenated_frame.append(binary_frame)
                    # cv2.imshow(str(__i),binary_frame)
                    
                else:
                    counter += 1
                    last_time = current_time

            else:
                pass

            if not ret:
                break
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        print(type(concatenated_frame))
        return concatenated_frame
    
    def merge_tab(select_index,images,title):
        for index in sorted(select_index, reverse=True): #將不必要的tab刪除
            images.pop(index)

        # 生成一個空白圖片 標題用
        width = 1280
        height = 171
        image_title = Image.new('RGB',(width, height),color=(255,255,255))
        draw = ImageDraw.Draw(image_title)
        text = title
        text_max = False

        if len(text) > 70:
            text1 = text[70:]
            text = text[:70]
            text_max = True

        font = ImageFont.truetype("NotoSansTC-VariableFont_wght.ttf",40)
        if text_max == False:
            text_width,text_height = draw.textsize(text,font)
            x = (width - text_width) // 2
            y = (height - text_height) // 2
            draw.text((x,y), text,font=font,fill=(0,0,0))

        if text_max == True:
            text_width,text_height = draw.textsize(text,font)
            x = (width - text_width) // 2
            y = 34.2 
            draw.text((x,y), text,font=font,fill=(0,0,0))
            text_width,text_height = draw.textsize(text1,font)
            x = (width - text_width) // 2
            y = 34.2 + text_height + 1
            draw.text((x,y), text1,font=font,fill=(0,0,0))

        image_np = np.array(image_title)
        gray_frame = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        _, binary_frame = cv2.threshold(gray_frame, 230, 255, cv2.THRESH_BINARY)
        image_np = cv2.resize(binary_frame,(width,height))


        # 將合併的圖片長寬先統一
        images.insert(0,image_np)
        width, height = images[0].shape[1], images[0].shape[0]
        for i in range(len(images)):
            if images[i].shape[1] != width or images[i].shape[0] != height:
                images[i] = cv2.resize(images[i], (width, height))
        # if len(images) < 8:
        #     result_frame = cv2.vconcat(images)
        #     cv2.imwrite(f'{title}.jpg', result_frame)
        #     return [result_frame]
        # else:
        result_frames = []
        split_page = len(images)//8
        result = np.array_split(images,split_page)
  
        print("================================")
        print(result[0].shape)
        print("================================")
        for i in range(split_page):
            
            result_frame = cv2.vconcat(result[i])
            # cv2.imwrite(f'{title}_{i+1}.jpg', result_frame)
            result_frames.append(result_frame)
        return result_frames

    
        
if __name__ == '__main__':
    App = Flask_api()
    App.run()
