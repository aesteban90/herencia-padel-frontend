import { useEffect } from "react";

const useOutsideClick = (ref, callback) => {
  const handleClick = e => {
    if (ref.current && !ref.current.contains(e.target) && !e.target.classList.contains('menu-item')) {
        if(e.target.parentElement != null){
            if(e.target.parentElement.classList.contains('menu-item')){
                return false;
            } 
        }else{
            if(e.target.classList.contains('menu-item')){
                return false;
            }
        }
        callback();        
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default useOutsideClick;