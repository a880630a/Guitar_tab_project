from pytube import YouTube
import cv2
import numpy as np
import time
from PIL import Image,ImageDraw,ImageFont



################################################################

url = "https://www.youtube.com/watch?v=xQeTnbcCvLQ"
yt = YouTube(url)
yt_name = yt.title

concatenated_frame = []

# 生成一個空白圖片 標題用
width = 1280
height = 171
image_title = Image.new('RGB',(width, height),color=(255,255,255))
draw = ImageDraw.Draw(image_title)
text = yt_name
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


# cv2.imshow("title",image_np)
# cv2.waitKey(0)
concatenated_frame.append(image_np)



stream = yt.streams.get_highest_resolution()

video_capture = cv2.VideoCapture(stream.url)

previous_frame_sum = None
previous_frame_diff = 0
last_time = 0
__i = 1
counter = 0


start_time = time.time()
end_time = 2
print("start : ",start_time)
# while True:
#     ret, frame = video_capture.read()
#     if not ret:
#         break

#     # if time.time() > start_time + end_time:
#     #     area = cv2.selectROI('area',frame,False,False)
#     #     print(start_time)
#     #     break

#     # cv2.imshow("asd",frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break
#     elif cv2.waitKey(1) == ord('r'):
#         area = cv2.selectROI('area',frame)
#         print(area)


while True:
    ret, frame = video_capture.read()  # 讀取一個幀
    # 綠色實心方框
    # cv2.rectangle(frame, (549, 720), ((1280//2), (1280//2)+30), (0, 255, 0), 2)
    
    target_page = cv2.rectangle(frame, (1, 549), (1278, 718), (0, 255, 0), 2)
    

    # 如果是第一個幀，只記錄當前幀的像素值總和
    
    
    if not ret:
        break
    

    target = frame[549:720, :] #切割成
    target_page = frame[581:601,77:99]


    # 偵測區域用二值化
    detect_area = target[:,1280//2:(1280//2)+45]
    gray_frame = cv2.cvtColor(detect_area, cv2.COLOR_BGR2GRAY)
    _, detect_area = cv2.threshold(gray_frame, 230, 255, cv2.THRESH_BINARY)

    gray_frame = cv2.cvtColor(target, cv2.COLOR_BGR2GRAY)
    _, binary_frame = cv2.threshold(gray_frame, 230, 255, cv2.THRESH_BINARY)

    # current_frame_sum = np.sum(target_page)
    current_frame_sum = np.sum(detect_area)
    if previous_frame_sum is None:
        previous_frame_sum = current_frame_sum
        continue

    # 計算當前幀的差異度
    frame_difference = np.abs(current_frame_sum - previous_frame_sum)
    print(frame_difference)
    
    
    if frame_difference > 1000000:
        current_time = 1
    else:
        current_time = 0

    if current_time != last_time :
        if counter >= 2:
            counter = 0
            print("第%s頁"%(__i))
            __i += 1
            concatenated_frame.append(binary_frame)
            cv2.imshow(str(__i),binary_frame)
            
        else:
            counter += 1
            last_time = current_time

    else:
        pass
    



    # print(target_page[:-1])
    
    
    # print(target.shape)
    cv2.imshow('Video Frame', detect_area)

    # 按下 'q' 鍵退出循環
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    if cv2.waitKey(1) == ord('r'):
        area = cv2.selectROI('area',frame)
        print(area)

split_page = len(concatenated_frame)//8
print("result",len(concatenated_frame))
result = np.array_split(concatenated_frame,split_page)

# for i in range(split_page):
#     result_frame = cv2.vconcat(result[i])
#     cv2.imwrite(f'{yt_name}_{i+1}.jpg', result_frame)