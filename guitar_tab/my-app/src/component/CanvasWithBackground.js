import React, { useState, useEffect, useRef } from 'react';

function CanvasWithBackground(props) {
  const {imageUrl,rectangle,setRectangle} = props;
  const [canvas, setCanvas] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({positionX:0,positionY:0});
  const [goalPosition, setGoalPosition] = useState({startPositionX:0,startPositionY:0,endPositionX:0,endPositionY:0});
  const [isDrawing,setIsDrawing] = useState(false);
//   const [rectangle,setRectangle] = useState(null);

  const Clickdown = (e) =>{
    if (!canvas) {
      return;
    }
    const drawRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / drawRect.width;
    const scaleY = canvas.height / drawRect.height;
    const x = (e.clientX - drawRect.left)*scaleX;
    const y = (e.clientY - drawRect.top)*scaleY;
    setCursorPosition({positionX:x, positionY:y})
    setGoalPosition((data)=>({...data,startPositionX:x, startPositionY:y})) //單獨針對startPosition去做設定
    console.log("drawRect", drawRect.width);
    console.log("canvas", canvas.width);
    
    // console.log("not adjust", e.clientX);
    console.log("adjust", cursorPosition);
    
    setIsDrawing(true);
  };

  const ClickUp = (e) =>{
    if (!canvas || !isDrawing) {
      return;
    }
    const drawRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / drawRect.width;
    const scaleY = canvas.height / drawRect.height;
    const x = (e.clientX - drawRect.left)*scaleX;
    const y = (e.clientY - drawRect.top)*scaleY;
    setCursorPosition({positionX:x, positionY:y})
    // setGoalPosition({endPositionX:x, endPositionY:y})
    setGoalPosition((data)=>({...data,endPositionX:x, endPositionY:y})) //單獨針對endPosition去做設定
    setIsDrawing(false);
  
    // console.log("after", cursorPosition);
    // console.log("!!!!=>", goalPosition);
  }

  const CursorMove = (e) =>{
    if (!canvas || !isDrawing){
        return;
    }
    const drawRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / drawRect.width;
    const scaleY = canvas.height / drawRect.height;
    const x = (e.clientX - drawRect.left)*scaleX;
    const y = (e.clientY - drawRect.top)*scaleY;
    
    setCursorPosition({positionX:x, positionY:y})
  };

  useEffect(() => {
    
    if (canvas) {
      
      const ctx = canvas.getContext('2d');
      
      // 創建一個新的圖像對象
      const img = new Image();
      img.src = imageUrl;
      // 在圖像加載完成後，設定 Canvas 的背景
      img.onload = () => {
        // 設定 Canvas 的寬高，以匹配圖像的寬高
        
        canvas.width = img.width;
        canvas.height = img.height;


        
        // 繪製圖像作為 Canvas 的背景
        ctx.drawImage(img, 0, 0);

        if (rectangle) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
          }
      };
    }
  }, [canvas, imageUrl,rectangle]);
  useEffect(()=>{
    if (isDrawing) {
        const rectangleX = Math.min(goalPosition.startPositionX,cursorPosition.positionX);
        const rectangleY = Math.min(goalPosition.startPositionY,cursorPosition.positionY);
        const rectangleWidth = Math.abs(goalPosition.startPositionX - cursorPosition.positionX);
        const rectangleHeight = Math.abs(goalPosition.startPositionY - cursorPosition.positionY);
        setRectangle({x:rectangleX,y:rectangleY,width:rectangleWidth,height:rectangleHeight});
    }
  
  },[goalPosition,isDrawing,cursorPosition]);

  return (
    <canvas ref={setCanvas} onMouseDown={Clickdown} onMouseUp={ClickUp} onMouseMove={CursorMove} style={{zIndex:99}}></canvas>
  );
}

export default CanvasWithBackground;
