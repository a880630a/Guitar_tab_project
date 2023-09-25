// import logo from './logo.svg';
import './App.css';
// import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/main.scss'
// import './scss/input_text.scss'
import axios from './api/axiosApi';
import { useState } from 'react';
import CanvasWithBackground from './component/CanvasWithBackground'; 

function App() {
  const [ytUrl,setYtUrl] = useState("");
  const [ytImageUrl,setYtImageUrl] = useState("");
  const [rectangle,setRectangle] = useState(null);
  const [tabImageUrl,setTabImageUrl] = useState([]);
  const [tabPage,setTabPage] = useState([]);
  const [fullTab,setFullTab] = useState([]);
  console.log("target -> ",fullTab)
  console.log("target 2-> ",tabPage)
  console.log("target 3-> ",tabImageUrl)
  const urlUpdate = async (data) => {
    console.log("yturl come in");
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
  const postImageArea = async (data) => {
    const Data = await axios.post("/api/image_area_select",data);
    if (Data.status === 200) {
      for (let i = 0; i < (Data.data).length; i++){
        const base64ToImage = `data:image/jpeg;base64,${Data.data[i]}`;
        setTabImageUrl(oldArray => [...oldArray, base64ToImage]);
      }
      
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


  return (
    <div className="App">
      <div className='body'>
        <div className="main-page">
          <h1>Guitar Tab {tabPage}</h1>
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
                <button onClick={()=>postTabPage(tabPage)}>confirm</button>
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
