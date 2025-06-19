importScripts('floodfill.min.js');
onmessage=e=>{const{img,x,y,color,tol}=e.data,d=img.data, rgba=[...Array.from(color.match(/\w\w/g),h=>parseInt(h,16)),255]; floodfill(d,x,y,rgba,tol,img.width,img.height);postMessage(img);}
