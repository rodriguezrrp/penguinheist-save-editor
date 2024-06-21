import { useEffect, useState } from "react";


export default function AsyncImage({
  /**@type {string | PromiseLike<string>}*/ src,
  /**@type string*/ alt, useEmptySrcAsPlaceholder = true,
  ...props
}) {
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [isAsyncLoading, setIsAsyncLoading] = useState(false);

  useEffect(() => {
    if(src === loadedSrc) {
      return;
    }
    if(typeof(src) === "undefined" || src === null) {
      setLoadedSrc(null);
      setIsAsyncLoading(false);  // just ensure it's false
      return;
    }
    if(typeof(src) === "string") {
      setLoadedSrc(src);
      setIsAsyncLoading(false);  // just ensure it's false
      return;
    }

    let cancel = false;
    setIsAsyncLoading(true);

    // expect src to be a Promise
    src
      .then((resSrc) => {
        if(cancel) return;
        if(typeof(resSrc) === "string") {
          setLoadedSrc(resSrc);
        } else {
          console.error('warning: resSrc was not a string:', resSrc);
          setLoadedSrc(null);
        }
      })
      .catch((err) => {
        if(cancel) return;
        console.error('Error encountered trying to async load image:', err);
        setLoadedSrc(null);
      })
      .finally(() => setIsAsyncLoading(false));
    
    return () => {
      cancel = true;
      setIsAsyncLoading(false);
    }
  }, [src, loadedSrc]);
  // end useEffect


  // useEffect(() => {
  
  //   if(src === loadedSrc) {
  //     return;
  //   }
  
  //   setIsLoading(true);
  //   setLoadedSrc(null);
  
  //   if (src) {
  //     let cancel = false;
  //     // let parentElem = parentElem ?? null;
  //     let _createdParentElem = null;
  //     let _createdImgElem = null;
      
  //     const image = new Image();

  //     // const handleLoad = () => {
  //     //   console.info('loaded async image', props.src);
  //     //   setLoadedSrc(props.src);
  //     // };
  //     const handleLoad = (e) => {
  //       // console.info('loaded async image', e.target.src, e);
  //       console.info('AsyncImage loaded, e.target.src:', e.target.src);
  //       setLoadedSrc(e.target.src);
  //       image.removeEventListener('load', handleLoad);
  //       _createdImgElem?.remove();
  //       _createdParentElem?.remove();
  //     };
  //     const onSrcString = (src) => {
  //       if(cancel) return;
  //       if(loadedSrc === src) {
  //         _createdImgElem?.remove();
  //         _createdParentElem?.remove();
  //       }
  //       image.addEventListener('load', handleLoad);
  //       image.src = src;
  //       // append to DOM to try to ensure it preloads
  //       _createdImgElem = image;
  //       _createdImgElem.style['width'] = '1px';
  //       _createdImgElem.style['height'] = '1px';
  //       parentElem.appendChild(_createdImgElem);
  //     }

  //     if(!parentElem) {
  //         // create one ourselves
  //         const _randomID = String(`img-preload-parent-${Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER)}`);
  //         _createdParentElem = document.createElement('div');
  //         _createdParentElem.id = _randomID;
  //         _createdParentElem.classList.add('img-preload-parent');
  //         _createdParentElem.style['width'] = '1px';
  //         _createdParentElem.style['height'] = '1px';
  //         _createdParentElem.style['position'] = 'absolute';
  //         _createdParentElem.style['top'] = '-9999px';
  //         _createdParentElem.style['left'] = '-9999px';
  //         parentElem = _createdParentElem;
  //         document.body.appendChild(_createdParentElem);
  //     }
     
      
  //     if(typeof(props.src) === "string") {
  //       // direct call, no async.
  //       onSrcString(props.src);
  //     } else {
  //       // handle async promise situation
  //       Promise.resolve(props.src)
  //       .then(src => onSrcString(src))
  //       .catch(err => {
  //         console.error('Error encountered trying to async load image:', err);
  //       })
  //       .finally(() => setIsLoading(false));
  //     }

  //     return () => {
  //       cancel = true;
  //       image.removeEventListener('load', handleLoad);
  //       _createdImgElem?.remove();
  //       _createdParentElem?.remove();
  //       setIsLoading(false);
  //     };
  //   }
  //   // else {
  //   //   // props.src was falsy
  //   //   setLoadedSrc('');
  //   // }
  // }, [props.src, props.parentElem, loadedSrc]);
  // // end useEffect


  if (!isAsyncLoading && loadedSrc !== null) {
    return (
      <img {...props} src={loadedSrc || ''} alt={alt || ''} />
    );
  }
  if(useEmptySrcAsPlaceholder) {
    return <img {...props} src={''} alt={alt || ''} />;
  } else {
    return null;
  }
};