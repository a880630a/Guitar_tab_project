// import logo from './logo.svg';
import './App.css';
// import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/main.scss'
// import './scss/input_text.scss'
import axios from './api/axiosApi';
import { useEffect, useState } from 'react';
import CanvasWithBackground from './component/CanvasWithBackground'; 
import BackgroundModal from './component/BackgroundModal';
import io from 'socket.io-client'; 


function App() {
  const [ytUrl,setYtUrl] = useState("");
  const [ytImageUrl,setYtImageUrl] = useState("");
  const [rectangle,setRectangle] = useState(null);
  const [tabImageUrl,setTabImageUrl] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [tabPage,setTabPage] = useState([]);
  const [fullTab,setFullTab] = useState([]);



  const urlUpdate = async (data) => {
    // console.log("yturl come in");
    const Data = await axios.post("/api/yt_url",data);
    if (Data.status === 200){
      console.log("yturl",data);
      getGuitarImage()
    }
  };
  const getGuitarImage = async () => {
    console.log("getGuitarImage ");
    const Data = await axios.get("/api/yt_image",{ responseType: 'arraybuffer' });
    if (Data.status === 200){
      const base64 = btoa(new Uint8Array(Data.data).reduce((data,byte)=>data + String.fromCharCode(byte),''))
      const imageUrl = `data:image/jpeg;base64,${base64}`; // 創建圖像URL
      setYtImageUrl(imageUrl)
    }
  }
  

  // 須等待到圖片運算完
  const postImageArea = async (data) => { 
    setIsLoading(true);
    const Data = await axios.post("/api/image_area_select",data);
    if (Data.status === 200) {
      for (let i = 0; i < (Data.data).length; i++){
        const base64ToImage = `data:image/jpeg;base64,${Data.data[i]}`;
        setTabImageUrl(oldArray => [...oldArray, base64ToImage]);
      }
      setIsLoading(false);
      
      console.log("Data => ",(Data.data).length);
      console.log("TabImage is  : ",tabImageUrl);
      
    }
  }
 


  



  const postTabPage = async(data) =>{
    const Data = await axios.post("/api/tab_select",data);
    if (Data.status === 200) {
      console.log("tab selected");
      for (let i = 0; i < (Data.data).length; i++){
        const fullBase64ToImage = `data:image/jpeg;base64,${Data.data[i]}`;
        setFullTab(oldArray => [...oldArray, fullBase64ToImage]);
      }
    }
  };
  // useEffect(() => { #websocket
  //   const socket = io('http://0.0.0.0:8877');  // 连接到后端的 WebSocket 服务器地址

  //   // 监听来自后端的 WebSocket 消息
  //   socket.on('message_from_backend', (data) => {
  //     const receivedMessage = data.message;
  //     // 在这里处理接收到的消息，例如更新状态或执行其他逻辑操作
  //     console.log("----------------->>>>>>>>>>>",receivedMessage);
  //   });

  //   // 在组件卸载时断开 WebSocket 连接
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);  // [] 表示仅在组件挂载和卸载时运行一次


  return (
    <div className="App">
      <div className='body'>
        <div className="main-page">
          {isLoading ? <BackgroundModal isLoading={isLoading}/> : ""}
        {/* <div className={`main-page ${isLoading ? "loading":""}`}> */}
          <h1>Guitar Tab </h1>
          <div className="data-area">
            <div className="data-URL">
              <text>Youtube URL</text>
              <div class="form-outline">
                <input type="url" id="typeURL" class="form-control" onChange={(event)=>{setYtUrl(event.target.value)}}/>
              </div>
              <button class="btn btn-primary" type="submit" onClick={()=>urlUpdate(ytUrl)}>Button</button>
            </div>

              {ytImageUrl ? 
              <div className="image-display">
                <CanvasWithBackground imageUrl = {ytImageUrl} rectangle={rectangle} setRectangle={setRectangle}> 
                </CanvasWithBackground>
                <button class="btn btn-primary" type="submit" onClick={()=>postImageArea(rectangle)}>Button2</button>
              </div>
              :
              ""
              }
              
              {tabImageUrl.length !== 0 ? 
                <div className="tab-select">
                {tabImageUrl && tabImageUrl.map((data,index)=>(
                  <div className='tab-images'>
                    <input type='checkbox' 
                      defaultChecked={true} 
                      value={index} 
                      onChange={(e)=>(e.target.checked === true ? 
                      setTabPage((pre)=>pre.filter(prev=>prev !== index)):
                      setTabPage(oldArray => [...oldArray, index]))}>
                      {/*遍歷數組（或類似數據結構）的每個元素，並返回滿足特定條件的元素所組成的新數組*/}
                    </input>
                    <img src={tabImageUrl[index]} alt="Image1" />
                  </div>
                  
                ))}
                <button onClick={()=>postTabPage(tabPage)}>confirm</button>
                </div>
              :
              ""
              }
              

              {fullTab.length !== 0 ? 
                <div className="full-tab">
                {fullTab && fullTab.map((data,index)=>(
                  <div className='tab-images'>
                    <img src={fullTab[index]} alt="Image2" />
                  </div>
                ))}
                
              </div>
              :
              ""
              }
              
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
